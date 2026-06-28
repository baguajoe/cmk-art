# CMK Art — Artist Portfolio

A portfolio website for **CMK Art** (artist: **Carmen Kershaw**).

- **Frontend:** React + Vite (plain JavaScript / JSX), `react-router-dom`.
- **Backend:** Python + Flask (contact form API).
- The two are **decoupled** — React talks to Flask over HTTP at `/api/*`.

```
/client          React app (Vite)
  /src
    /components   Navbar, Footer, PaintingCard, Lightbox
    /pages        Home, Bio, Gallery, Contact
    /data         paintings.js  (the gallery data array)
  /public/images  painting1.jpg … painting12.jpg (placeholders)
/server           Flask backend
  app.py
  requirements.txt
README.md
.gitignore
```

---

## Quick start

You need **two terminals** — one for the backend, one for the frontend.

### 1. Backend (Flask)

```bash
cd server
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py                     # serves on http://localhost:5000
```

The API listens on the `PORT` environment variable (default **5000**) and
binds to `0.0.0.0` so it works in GitHub Codespaces. To use a different port:

```bash
PORT=5001 python app.py
```

> If you change the backend port, update the proxy `target` in
> `client/vite.config.js` to match.

### 2. Frontend (React + Vite)

In a second terminal:

```bash
cd client
npm install
npm run dev                       # serves on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### Running both together

Just keep both terminals running:

- Terminal A → `cd server && source venv/bin/activate && python app.py`
- Terminal B → `cd client && npm run dev`

Vite proxies any request to `/api/*` over to Flask (configured in
`client/vite.config.js`), so the contact form works in development with **no
CORS setup** required.

---

## Previewing in GitHub Codespaces

Codespaces automatically forwards ports. After starting both servers:

1. Open the **Ports** tab (next to the Terminal tab).
2. You should see two forwarded ports:
   - **5173** → the Vite/React app
   - **5000** → the Flask API
3. Click the 🌐 globe icon next to **port 5173** to open the site in your
   browser preview. (The frontend reaches the backend automatically through
   the Vite proxy, so you normally only need to open 5173.)

If a port doesn't appear, add it manually in the Ports tab using **Forward a
Port**. Both servers already bind to `0.0.0.0`, which is what lets Codespaces
forward them.

> **Note:** If you ever call the Flask API directly from the browser preview
> (instead of through the Vite proxy), set port 5000's visibility to
> **Public** in the Ports tab, or the request may be blocked.

---

## Editing content

### Paintings (the gallery)

All gallery data lives in **`client/src/data/paintings.js`** — an array of
painting objects:

```js
{
  title: 'Single Thread',
  image: '/images/painting1.jpg',
  medium: 'Continuous-line ink on canvas',
  size: '24" x 30"',
  year: 2024,
  price: '$520',
  status: 'Available',   // must be exactly "Available" or "Sold"
}
```

- **Add** a painting: copy a block, paste it, edit the fields.
- **Remove** a painting: delete its block.
- `status` must be exactly `"Available"` or `"Sold"` — the filter buttons and
  the status badge styling depend on this.

### Swapping images

Images live in **`client/public/images/`** and are referenced as
`"/images/<filename>"`.

- The simplest approach: **overwrite** `painting1.jpg … painting12.jpg` with
  real photos of Carmen's work, keeping the same filenames.
- Or add new files and update the matching `image` field in `paintings.js`.

The included `painting1.jpg … painting12.jpg` are generated **placeholders** —
replace them with real artwork photos.

### Contact links

In **`client/src/pages/Contact.jsx`**:

- Replace the placeholder email `hello@cmkart.example` with the real address.
- Update the **Facebook** link `href`.
- An **Instagram** block is included but commented out — uncomment it and add
  the real handle when ready.

---

## Backend notes & future extensions

`POST /api/contact` accepts JSON `{ name, email, message }`, validates the
fields, logs the submission, and appends it to a local **`contacts.json`**
file (git-ignored). It returns proper HTTP status codes (400 for bad input,
500 on a save failure, 200 on success).

Two clearly marked extension points live in `save_submission()` in
`server/app.py`:

- **Email:** send a notification using `smtplib` or Flask-Mail.
- **Database:** swap the JSON file for SQLite — because all persistence is
  funneled through `save_submission()`, only that function changes; the route
  stays the same.

There's also a `GET /api/health` endpoint for quick health checks.