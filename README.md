# CMK Art — Artist Portfolio & Shop

A portfolio + **shop** website for **CMK Art** (artist: **Carmen Kershaw**).
Browse original paintings in two collections, add them to a cart, and check out
with **Stripe**. Each completed order emails Carmen the details.

- **Frontend:** React + Vite (plain JavaScript / JSX), `react-router-dom`.
- **Backend:** Python + Flask (gallery checkout + contact form API).
- The two are **decoupled** — React talks to Flask over HTTP at `/api/*`.

```
/client          React app (Vite)
  /src
    /components   Navbar, Footer, PaintingCard, Lightbox, CartPanel
    /pages        Home, Bio, Gallery, Contact, Checkout, ThankYou
    /context      CartContext.jsx   (site-wide cart)
    /data         paintings.js        (the 12 paintings)
                  paymentHandles.js   (CashApp / Venmo / Zelle)
    /utils        format.js           (price formatting)
  /public/images  painting1.jpg … painting12.jpg
  .env.example    VITE_STRIPE_PUBLISHABLE_KEY
/server           Flask backend
  app.py          checkout / webhook / order-email / contact
  requirements.txt
  .env.example    Stripe + email secrets
README.md
.gitignore
```

> **Two paintings are for sale as unique originals** — quantity is always 1, and
> the same piece can't be added to the cart twice.

---

## Configuration & secrets (do this first)

All secrets live in **`.env`** files that are git-ignored. Start from the
provided examples:

```bash
cp server/.env.example server/.env     # Stripe + email secrets
cp client/.env.example client/.env     # Stripe publishable key
```

### 1. Stripe keys

1. Create a free account at <https://stripe.com> and open the **Dashboard**.
2. Go to **Developers → API keys**. While building, use the **test** keys
   (they start with `sk_test_` and `pk_test_`).
3. Fill them in:
   - `server/.env` → `STRIPE_SECRET_KEY=sk_test_...`
   - `client/.env` → `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
4. The **webhook secret** (`STRIPE_WEBHOOK_SECRET=whsec_...`) is covered in
   [Testing a Stripe payment](#testing-a-stripe-payment-test-mode) below.

Switch to the **live** keys (`sk_live_` / `pk_live_`) only when you're ready to
take real money.

### 2. Gmail App Password (for order emails)

Order notifications are sent from a Gmail account using SMTP. Gmail requires an
**App Password** (a normal password won't work):

1. Enable **2-Step Verification** on the Google account:
   <https://myaccount.google.com/security>.
2. Create an App Password: <https://myaccount.google.com/apppasswords> — pick
   "Mail" / "Other", and copy the 16-character code (remove the spaces).
3. In `server/.env` set:
   ```
   EMAIL_ADDRESS=youraddress@gmail.com
   EMAIL_APP_PASSWORD=your16charapppassword
   EMAIL_TO=youraddress@gmail.com          # where order emails are sent
   ```

If email isn't configured, orders are still saved to `server/orders.json` — you
just won't get the email.

### 3. CashApp / Venmo / Zelle handles

These "other ways to pay" are **manual** (no automation). Set them in the
frontend at **`client/src/data/paymentHandles.js`**:

```js
const paymentHandles = {
  cashapp: '$YourCashTag',
  venmo: '@Your-Venmo',
  zelle: 'you@example.com',
}
```

Leave any value as `''` to hide that option.

---

## Quick start

You need **two terminals** — one for the backend, one for the frontend.

### 1. Backend (Flask)

```bash
cd server
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt   # installs flask, flask-cors, stripe, python-dotenv
python app.py                     # serves on http://localhost:5000
```

> Make sure you created `server/.env` first (see
> [Configuration & secrets](#configuration--secrets-do-this-first)). Without
> `STRIPE_SECRET_KEY` the checkout endpoints return a clear error, but the rest
> of the site still runs.

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

## Testing a Stripe payment (test mode)

With **test** keys in your `.env` files, no real money moves. To place a test order:

1. Start both servers (backend + frontend) as above.
2. On the **Gallery**, add an available piece to your cart, open the cart, and
   click **Proceed to Checkout**.
3. Fill in name / email / shipping address, then **Pay with Card**. You're
   redirected to Stripe's hosted checkout page.
4. Use a Stripe **test card**:
   - Card number: `4242 4242 4242 4242`
   - Expiry: any future date (e.g. `12/34`) · CVC: any 3 digits · ZIP: any 5 digits
   - (Other test cards: <https://stripe.com/docs/testing>)
5. After paying you're returned to the **Thank You** page and the cart clears.

### Making the order email + "sold" marking fire locally

The reliable trigger is the **Stripe webhook**. To receive it on your machine,
use the [Stripe CLI](https://stripe.com/docs/stripe-cli) in a third terminal:

```bash
stripe login
stripe listen --forward-to localhost:5000/api/stripe-webhook
```

`stripe listen` prints a signing secret like `whsec_...` — copy it into
`server/.env` as `STRIPE_WEBHOOK_SECRET=whsec_...` and restart the backend.
Now a successful test payment will:

- **email** the order to `EMAIL_TO`,
- append it to **`server/orders.json`** (a local backup), and
- add the painting id to **`server/sold.json`**.

> Even without the CLI, the **Thank You** page calls `/api/order-complete` as a
> fallback, which verifies the session with Stripe and processes the order.
> (Processing is de-duplicated by Stripe session id, so you never get two emails
> for one order.)

In **production**, instead of the CLI add a webhook endpoint in
**Dashboard → Developers → Webhooks** pointing at
`https://YOUR_DOMAIN/api/stripe-webhook`, subscribe to the
`checkout.session.completed` event, and copy its signing secret into
`STRIPE_WEBHOOK_SECRET`.

---

## Marking paintings sold

Because the free hosting tier can wipe local files, the **order email is the
real record of a sale**. Here's the current flow:

- On a completed order, the backend records the sale in `server/orders.json`
  and `server/sold.json` (used to stop selling the same original twice while the
  server is running).
- To update what shoppers **see**, open
  `client/src/data/paintings.js` and change that piece's `status` from
  `"available"` to `"sold"` by hand. Sold pieces show a "Sold" badge and can't be
  added to the cart.

For permanent, automatic sold-status, replace the JSON files with a real
database — the code marks exactly where in `server/app.py` (`mark_sold()` and
the `CATALOG`) and the frontend would then read availability from an API instead
of the static `paintings.js`.

---

## Editing content

### Paintings (the gallery)

All gallery data lives in **`client/src/data/paintings.js`** — an array of
painting objects (the file has full inline comments):

```js
{
  id: 1,                         // UNIQUE number — never reuse; the cart & backend key on it
  title: "Momma's Baby",
  group: 'One Line',             // exactly "One Line" or "African Fabric" (section + filter)
  medium: 'acrylic on canvas panel',
  size: '14" x 18"',
  price: 242,                    // a WHOLE-DOLLAR NUMBER (not "$242", no cents)
  image: '/images/painting1.jpg',
  status: 'available',           // exactly "available" or "sold" (lowercase)
  description: '',               // optional blurb; shows in the lightbox when filled in
}
```

- **Edit** a title / price / description: change that field and save. Price is a
  plain number (e.g. `price: 400`); description goes between the quotes.
- **Add** a painting: copy a block, paste it, give it a **new unique `id`**.
- **Remove** a painting: delete its block.
- `group` must be exactly `"One Line"` or `"African Fabric"`; `status` must be
  exactly `"available"` or `"sold"` — the sections, filters, and badges depend
  on these.

> ⚠️ **Keep prices in sync with the backend.** For security, the server charges
> the price from its own `CATALOG` list in `server/app.py`, not the price the
> browser sends. If you change a price (or add/remove a painting), update the
> matching entry in `CATALOG` too.

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

## Backend API reference

All routes are under `/api` (proxied to Flask by Vite in dev). Secrets are read
from `server/.env` via `python-dotenv` — nothing is hardcoded.

| Method & path | Purpose |
| --- | --- |
| `GET /api/health` | Health check. |
| `POST /api/contact` | Contact form → validates, appends to `contacts.json`. |
| `POST /api/create-checkout-session` | Receives `{ items:[{id}], buyer }`, validates each painting is known and not already sold, prices it from the server-side `CATALOG`, creates a **Stripe Checkout Session**, and returns `{ url, id }`. The frontend redirects to `url`. |
| `POST /api/stripe-webhook` | Stripe's reliable "payment succeeded" callback. Verifies the signature with `STRIPE_WEBHOOK_SECRET`, then emails the order, appends to `orders.json`, and marks the piece sold in `sold.json`. |
| `POST /api/order-complete` | Fallback for the same, called by the Thank-You page with `{ session_id }`; verifies the session was paid, then processes it (de-duplicated by session id). |

**Future extensions** (marked in `server/app.py`):

- **Database:** replace `orders.json` / `sold.json` / the `CATALOG` list with a
  real DB (e.g. SQLite/Postgres) so availability is permanent and the frontend
  can read it from an API instead of the static `paintings.js`.
- The contact route's `save_submission()` still has its original SQLite/email
  extension points.