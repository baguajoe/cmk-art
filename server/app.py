"""
CMK Art — Flask backend
=======================

A small, well-commented Flask API for the CMK Art shoppable portfolio site.

Responsibilities:
  * POST /api/contact                 — accept a contact form submission.
  * GET  /api/health                  — simple health check.
  * POST /api/create-checkout-session — validate a cart and create a Stripe
                                        Checkout Session (server-side pricing).
  * POST /api/stripe-webhook          — Stripe's reliable "payment succeeded"
                                        callback: emails the order + marks sold.
  * POST /api/order-complete          — fallback trigger for the same, called by
                                        the Thank-You page after the redirect.

ALL SECRETS COME FROM A .env FILE (never hardcode them). See .env.example for
the full list of variables. python-dotenv loads them at startup.
"""

import json
import os
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

import stripe

# Load variables from server/.env into the environment. Do this before we read
# any os.environ values below.
load_dotenv()

# --------------------------------------------------------------------------- #
# App setup
# --------------------------------------------------------------------------- #
app = Flask(__name__)

# Allow the React frontend (a different origin in dev/prod) to call us.
CORS(app)

# Stripe secret key (starts with sk_test_... in test mode). Read from the env;
# never hardcode it. If it's missing, the checkout endpoints return a clear
# error instead of crashing.
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

# Files stored next to this script. All are git-ignored.
HERE = os.path.dirname(__file__)
CONTACTS_FILE = os.path.join(HERE, "contacts.json")
ORDERS_FILE = os.path.join(HERE, "orders.json")   # backup log of completed orders
SOLD_FILE = os.path.join(HERE, "sold.json")       # simple list of sold painting ids


# --------------------------------------------------------------------------- #
# Authoritative painting catalog
# --------------------------------------------------------------------------- #
# This is the SERVER-SIDE source of truth for prices, so a malicious client
# cannot change what they're charged. Prices are WHOLE DOLLARS (matching
# client/src/data/paintings.js).
#
# KEEP THIS IN SYNC with client/src/data/paintings.js: same ids, titles, and
# prices. (Later, a shared database would remove this duplication — see the
# README "Marking paintings sold" note.)
CATALOG = [
    {"id": 1, "title": "Momma's Baby", "size": '14" x 18"', "price": 242},
    {"id": 2, "title": "Abstract Male", "size": '10" x 20"', "price": 200},
    {"id": 3, "title": "Side Profile Afro", "size": '18" x 24"', "price": 400},
    {"id": 4, "title": "Royal Head Wrap", "size": '30" x 30"', "price": 600},
    {"id": 5, "title": "Queens Crown", "size": '30" x 30"', "price": 600},
    {"id": 6, "title": "African Queen", "size": '18" x 24"', "price": 450},
    {"id": 7, "title": "African King", "size": '18" x 24"', "price": 450},
    {"id": 8, "title": "African Princess", "size": '12" x 16"', "price": 200},
    {"id": 9, "title": "Sunset Sistahs", "size": '20" x 24"', "price": 500},
    {"id": 10, "title": "Martin", "size": '20" x 24"', "price": 500},
    {"id": 11, "title": "Malcolm", "size": '20" x 24"', "price": 500},
    {"id": 12, "title": "Butterflies Nectar", "size": '12" x 24"', "price": 300},
]
CATALOG_BY_ID = {p["id"]: p for p in CATALOG}


# --------------------------------------------------------------------------- #
# Small JSON-file helpers
# --------------------------------------------------------------------------- #
def _read_json(path, default):
    """Read a JSON file, tolerating a missing or corrupt file."""
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return default


def _write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def load_sold_ids():
    """Return a set of painting ids that have been sold."""
    data = _read_json(SOLD_FILE, [])
    return set(data) if isinstance(data, list) else set()


def mark_sold(ids):
    """Add painting ids to the sold list (sold.json).

    NOTE ON MARKING SOLD (read this):
      The free hosting tier may wipe local files, so the ORDER EMAIL is the real
      source of truth for a sale. This sold.json list is a best-effort local
      cache used to stop the same original being sold twice while the server is
      up. The Gallery's own display status still lives in
      client/src/data/paintings.js, which you currently update BY HAND after an
      order (see the README). To make sold-status permanent and automatic,
      replace these JSON files with a real database here and have the frontend
      read availability from an API instead of the static file.
    """
    sold = load_sold_ids()
    sold.update(ids)
    _write_json(SOLD_FILE, sorted(sold))


# --------------------------------------------------------------------------- #
# Email (SMTP)
# --------------------------------------------------------------------------- #
def send_order_email(order):
    """Email the order details to the artist via SMTP.

    Uses these environment variables (see .env.example):
      EMAIL_ADDRESS       — the Gmail address you send FROM
      EMAIL_APP_PASSWORD  — a Gmail *App Password* (NOT your normal password;
                            create one at https://myaccount.google.com/apppasswords
                            with 2-Step Verification enabled)
      EMAIL_TO            — where the order notification is sent (usually you)

    If email isn't configured, we log a warning and skip — the order is still
    saved to orders.json, so nothing is lost.
    """
    sender = os.environ.get("EMAIL_ADDRESS")
    password = os.environ.get("EMAIL_APP_PASSWORD")
    recipient = os.environ.get("EMAIL_TO") or sender

    if not (sender and password and recipient):
        app.logger.warning(
            "Email not configured (EMAIL_ADDRESS / EMAIL_APP_PASSWORD / EMAIL_TO); "
            "skipping order email. Order was still saved to orders.json."
        )
        return

    lines = [
        "New CMK Art order confirmed!",
        "",
        f"Buyer:   {order['buyer_name']}",
        f"Email:   {order['buyer_email']}",
        f"Address: {order['buyer_address']}",
        "",
        "Paintings:",
    ]
    for item in order["items"]:
        lines.append(f"  - #{item['id']} {item['title']} ({item['size']}) — ${item['price']}")
    lines += [
        "",
        f"Total: ${order['total']}",
        f"Stripe session: {order['session_id']}",
        f"Placed at: {order['completed_at']}",
    ]

    msg = EmailMessage()
    msg["Subject"] = f"CMK Art order — {order['buyer_name']} — ${order['total']}"
    msg["From"] = sender
    msg["To"] = recipient
    msg.set_content("\n".join(lines))

    # Gmail SMTP over STARTTLS.
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender, password)
        server.send_message(msg)

    app.logger.info("Order email sent to %s", recipient)


# --------------------------------------------------------------------------- #
# Order completion (shared by the webhook and the fallback endpoint)
# --------------------------------------------------------------------------- #
def process_completed_order(session):
    """Given a paid Stripe Checkout Session, record + email the order once.

    De-dupes by Stripe session id so the webhook and the Thank-You page's
    fallback call can't produce two emails / two order rows for one purchase.
    Returns True if this call actually processed the order, False if it was a
    duplicate.
    """
    session_id = session.get("id")
    metadata = session.get("metadata") or {}

    # Already recorded? Then this is a duplicate trigger — do nothing.
    orders = _read_json(ORDERS_FILE, [])
    if not isinstance(orders, list):
        orders = []
    if any(o.get("session_id") == session_id for o in orders):
        app.logger.info("Order %s already processed; skipping.", session_id)
        return False

    # Rebuild the purchased items from our authoritative catalog.
    id_str = metadata.get("painting_ids", "")
    ids = [int(x) for x in id_str.split(",") if x.strip().isdigit()]
    items = [CATALOG_BY_ID[i] for i in ids if i in CATALOG_BY_ID]
    total = sum(item["price"] for item in items)

    order = {
        "session_id": session_id,
        "buyer_name": metadata.get("buyer_name", ""),
        "buyer_email": metadata.get("buyer_email") or session.get("customer_email", ""),
        "buyer_address": metadata.get("buyer_address", ""),
        "items": items,
        "total": total,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }

    # 1) Append to orders.json (local backup).
    orders.append(order)
    try:
        _write_json(ORDERS_FILE, orders)
    except OSError as exc:
        app.logger.error("Failed to write orders.json: %s", exc)

    # 2) Mark the pieces sold locally.
    mark_sold(ids)

    # 3) Email the artist (best effort — never let an email error break the flow).
    try:
        send_order_email(order)
    except Exception as exc:  # noqa: BLE001 — log and continue
        app.logger.error("Failed to send order email: %s", exc)

    app.logger.info("Processed order %s (%s items, $%s)", session_id, len(items), total)
    return True


# --------------------------------------------------------------------------- #
# Contact persistence helper (unchanged behaviour)
# --------------------------------------------------------------------------- #
def save_submission(submission):
    """Append one contact submission to contacts.json."""
    submissions = _read_json(CONTACTS_FILE, [])
    if not isinstance(submissions, list):
        submissions = []
    submissions.append(submission)
    _write_json(CONTACTS_FILE, submissions)


# --------------------------------------------------------------------------- #
# Routes
# --------------------------------------------------------------------------- #
@app.route("/api/health", methods=["GET"])
def health():
    """Lightweight health check."""
    return jsonify({"status": "ok"}), 200


@app.route("/api/contact", methods=["POST"])
def contact():
    """Receive a contact form submission. Expects JSON {name, email, message}."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be JSON."}), 400

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"error": "Name, email, and message are all required."}), 400
    if "@" not in email or "." not in email:
        return jsonify({"error": "Please provide a valid email address."}), 400

    submission = {
        "name": name,
        "email": email,
        "message": message,
        "received_at": datetime.now(timezone.utc).isoformat(),
    }
    app.logger.info("New contact submission from %s <%s>", name, email)

    try:
        save_submission(submission)
    except OSError as exc:
        app.logger.error("Failed to save submission: %s", exc)
        return jsonify({"error": "Could not save your message. Please try again."}), 500

    return jsonify({"success": True, "message": "Thank you for reaching out!"}), 200


def _frontend_url():
    """Where Stripe should send the buyer back to.

    Prefer an explicit FRONTEND_URL env var (best for production), then the
    request's Origin header (works automatically in dev / Codespaces), then a
    localhost fallback.
    """
    return (
        os.environ.get("FRONTEND_URL")
        or request.headers.get("Origin")
        or "http://localhost:5173"
    )


@app.route("/api/create-checkout-session", methods=["POST"])
def create_checkout_session():
    """Validate the cart and create a Stripe Checkout Session.

    Expects JSON:
      {
        "items": [{ "id": 1 }, { "id": 6 }],
        "buyer": { "name": str, "email": str, "address": str }
      }

    Returns { "url": <hosted checkout url>, "id": <session id> } on success.
    Prices come from our server-side CATALOG, never from the client.
    """
    if not stripe.api_key:
        return jsonify({"error": "Payments are not configured yet (missing STRIPE_SECRET_KEY)."}), 500

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be JSON."}), 400

    items = data.get("items") or []
    buyer = data.get("buyer") or {}
    if not isinstance(items, list) or not items:
        return jsonify({"error": "Your cart is empty."}), 400

    name = (buyer.get("name") or "").strip()
    email = (buyer.get("email") or "").strip()
    address = (buyer.get("address") or "").strip()
    if not (name and email and address):
        return jsonify({"error": "Name, email, and shipping address are required."}), 400

    sold = load_sold_ids()
    line_items = []
    ids = []
    for entry in items:
        pid = entry.get("id") if isinstance(entry, dict) else None
        painting = CATALOG_BY_ID.get(pid)
        # Validate the painting exists and is still available.
        if painting is None:
            return jsonify({"error": f"Unknown painting (id {pid})."}), 400
        if pid in sold:
            return jsonify({"error": f"'{painting['title']}' has just sold and is no longer available."}), 409

        ids.append(pid)
        line_items.append({
            "price_data": {
                "currency": "usd",
                "unit_amount": painting["price"] * 100,  # Stripe wants cents
                "product_data": {
                    "name": painting["title"],
                    "description": f'Original painting · {painting["size"]}',
                },
            },
            "quantity": 1,  # each piece is a unique original
        })

    frontend = _frontend_url()
    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            customer_email=email,
            # Stripe fills in {CHECKOUT_SESSION_ID} on redirect. Keep the literal
            # placeholder text — do not interpolate it yourself.
            success_url=frontend + "/thank-you?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=frontend + "/checkout",  # on cancel, back to checkout/cart
            metadata={
                "buyer_name": name[:500],
                "buyer_email": email[:500],
                "buyer_address": address[:500],
                "painting_ids": ",".join(str(i) for i in ids),
            },
        )
    except Exception as exc:  # noqa: BLE001
        app.logger.error("Stripe session creation failed: %s", exc)
        return jsonify({"error": "Could not start checkout. Please try again."}), 502

    return jsonify({"url": session.url, "id": session.id}), 200


@app.route("/api/stripe-webhook", methods=["POST"])
def stripe_webhook():
    """Stripe's server-to-server confirmation that a payment completed.

    This is the RELIABLE trigger for emailing the order and marking pieces sold
    (it fires even if the buyer closes the tab before the redirect).

    SETTING THE WEBHOOK SECRET:
      * Local testing: run the Stripe CLI —
            stripe listen --forward-to localhost:5000/api/stripe-webhook
        It prints a signing secret like `whsec_...`; put it in server/.env as
        STRIPE_WEBHOOK_SECRET.
      * Production: in the Stripe Dashboard → Developers → Webhooks, add an
        endpoint pointing at https://YOUR_DOMAIN/api/stripe-webhook, subscribe
        to the `checkout.session.completed` event, and copy its signing secret
        into STRIPE_WEBHOOK_SECRET.
    """
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    payload = request.get_data()
    sig_header = request.headers.get("Stripe-Signature")

    if not webhook_secret:
        app.logger.warning("STRIPE_WEBHOOK_SECRET not set; rejecting webhook.")
        return jsonify({"error": "Webhook not configured."}), 500

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        app.logger.warning("Invalid Stripe webhook: %s", exc)
        return jsonify({"error": "Invalid signature."}), 400

    if event["type"] == "checkout.session.completed":
        process_completed_order(event["data"]["object"])

    # Always 200 so Stripe stops retrying once we've received it.
    return jsonify({"received": True}), 200


@app.route("/api/order-complete", methods=["POST"])
def order_complete():
    """Fallback order trigger, called by the Thank-You page after redirect.

    Expects JSON { "session_id": str }. We retrieve the session from Stripe,
    confirm it was paid, then process it (email + mark sold). The webhook above
    is the primary path; this helps in local dev where a webhook may not be set
    up. De-duplication in process_completed_order() prevents double handling.
    """
    if not stripe.api_key:
        return jsonify({"error": "Payments are not configured."}), 500

    data = request.get_json(silent=True) or {}
    session_id = (data.get("session_id") or "").strip()
    if not session_id:
        return jsonify({"error": "session_id is required."}), 400

    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except Exception as exc:  # noqa: BLE001
        app.logger.error("Could not retrieve Stripe session %s: %s", session_id, exc)
        return jsonify({"error": "Could not verify the order."}), 502

    if session.get("payment_status") != "paid":
        return jsonify({"error": "Payment not completed."}), 402

    processed = process_completed_order(session)
    return jsonify({"success": True, "new": processed}), 200


# --------------------------------------------------------------------------- #
# Entry point
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    # Read the port from the PORT env var (important for Codespaces port
    # forwarding), defaulting to 5000. Bind to 0.0.0.0 so Codespaces can
    # forward the port to your browser.
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
