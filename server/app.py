"""
CMK Art — Flask backend
=======================

A minimal, well-commented Flask API for the CMK Art portfolio site.

Responsibilities (today):
  * POST /api/contact — accept a contact form submission, validate it,
    log it, and append it to a local contacts.json file.
  * GET  /api/health  — simple health check for uptime / debugging.

The app is intentionally structured so a real database (e.g. SQLite) or
real email sending can be dropped in later without rewriting the routes —
see the clearly marked extension points in `save_submission()`.
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

# Allow the React frontend (running on a different origin in dev) to call us.
# In development the Vite dev server also proxies /api to this backend, but
# enabling CORS keeps direct cross-origin calls working too (e.g. in prod).
CORS(app)

# Where contact submissions are appended. Stored next to this file so it is
# easy to find. This path is git-ignored.
CONTACTS_FILE = os.path.join(os.path.dirname(__file__), "contacts.json")


# --------------------------------------------------------------------------- #
# Persistence helper
# --------------------------------------------------------------------------- #
def save_submission(submission):
    """Append one contact submission to contacts.json.

    contacts.json holds a JSON array of submissions. We read the existing
    array (or start a new one), append, and write it back.

    ----------------------------------------------------------------------
    EXTENSION POINTS (do this later):
      * EMAIL: send a notification here using smtplib or Flask-Mail, e.g.
            send_email(to="carmen@example.com", subject=..., body=...)
      * DATABASE: instead of (or in addition to) the JSON file, insert a row
        into SQLite. Because all persistence is funneled through this one
        function, swapping the storage layer means editing only this body —
        the route below does not change.
    ----------------------------------------------------------------------
    """
    # Load existing submissions, tolerating a missing or corrupt file.
    submissions = []
    if os.path.exists(CONTACTS_FILE):
        try:
            with open(CONTACTS_FILE, "r", encoding="utf-8") as f:
                submissions = json.load(f)
            if not isinstance(submissions, list):
                submissions = []
        except (json.JSONDecodeError, OSError):
            submissions = []

    submissions.append(submission)

    with open(CONTACTS_FILE, "w", encoding="utf-8") as f:
        json.dump(submissions, f, indent=2, ensure_ascii=False)


# --------------------------------------------------------------------------- #
# Routes
# --------------------------------------------------------------------------- #
@app.route("/api/health", methods=["GET"])
def health():
    """Lightweight health check."""
    return jsonify({"status": "ok"}), 200


@app.route("/api/contact", methods=["POST"])
def contact():
    """Receive a contact form submission.

    Expects JSON: { "name": str, "email": str, "message": str }
    Returns JSON success on 200, or an error with an appropriate status code.
    """
    # Parse JSON safely — silent=True returns None instead of raising on bad input.
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be JSON."}), 400

    # Pull and trim the fields.
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    # --- Validation -------------------------------------------------------- #
    if not name or not email or not message:
        return jsonify({"error": "Name, email, and message are all required."}), 400

    # Very small sanity check on the email — a full RFC check is overkill here.
    if "@" not in email or "." not in email:
        return jsonify({"error": "Please provide a valid email address."}), 400

    # --- Build the record -------------------------------------------------- #
    submission = {
        "name": name,
        "email": email,
        "message": message,
        "received_at": datetime.now(timezone.utc).isoformat(),
    }

    # Log to the server console for visibility during development.
    app.logger.info("New contact submission from %s <%s>", name, email)

    # Persist it. If saving fails, report a 500 rather than pretending success.
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
    # Read the port from the PORT env var (important for Codespaces port
    # forwarding), defaulting to 5000. Bind to 0.0.0.0 so Codespaces can
    # forward the port to your browser.
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
