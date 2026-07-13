"""
CMK Art — Flask backend (LEGACY / OPTIONAL — no longer required)
================================================================

The CMK Art site is now a fully STATIC frontend. Checkout and the contact form
both submit directly to Formspree (see client/src/config.js), so you do NOT need
to run this server to use or deploy the site — just build /client and deploy the
static output (see the README).

This slim Flask app is kept only as an optional legacy helper: a health check
and a contact endpoint that logs submissions to a local JSON file. All Stripe
code, order emails, and sold-tracking were removed when the site moved to the
manual CashApp/Venmo checkout.

There are no secrets and no .env file anymore.
"""

import json
import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS

# --------------------------------------------------------------------------- #
# App setup
# --------------------------------------------------------------------------- #
app = Flask(__name__)

# Allow the React frontend (a different origin in dev) to call us.
CORS(app)

HERE = os.path.dirname(__file__)
CONTACTS_FILE = os.path.join(HERE, "contacts.json")  # git-ignored local log


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
    """Receive a contact form submission. Expects JSON {name, email, message}.

    NOTE: the live site does NOT use this — the Contact page posts directly to
    Formspree. This endpoint remains only for optional local/legacy use.
    """
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


# --------------------------------------------------------------------------- #
# Entry point
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
