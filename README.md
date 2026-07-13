# CMK Art — Artist Portfolio & Shop

A portfolio + **shop** website for **CMK Art** (artist: **Carmen Kershaw**).
Browse original paintings in two collections, add them to a cart, and place an
order — payment is handled **manually via CashApp** (Venmo optional), and each
order request is emailed to Carmen through **Formspree**.

- **Fully static frontend:** React + Vite (plain JavaScript / JSX),
  `react-router-dom`. **No backend or server is required to run or deploy the
  site.**
- **Orders & contact:** submitted straight to [Formspree](https://formspree.io)
  from the browser (a free form-to-email service).
- **Payment:** manual. The buyer sends money by CashApp/Venmo and Carmen ships
  once the payment is confirmed.

```
/client                 React app (Vite) — this is the whole site
  /src
    config.js           ⭐ EDIT THIS: Formspree FORM_ID + CashApp/Venmo handles
    /components         Navbar, Footer, PaintingCard, Lightbox, CartPanel
    /pages              Home, Bio, Gallery, Contact, Checkout, ThankYou
    /context            CartContext.jsx   (site-wide cart)
    /data               paintings.js       (the 12 paintings)
    /utils              format.js          (price formatting)
  /public/images        painting1.jpg … painting12.jpg
/server                 OPTIONAL legacy Flask helper — NOT required anymore
README.md
.gitignore
```

> **Each painting is a unique original** — quantity is always 1, and the same
> piece can't be added to the cart twice.

---

## 1. Configure — do this first (all in one file)

Everything you need to set up lives in **`client/src/config.js`**. Open it and
replace the three placeholders:

```js
const config = {
  FORM_ID: 'FORM_ID',            // your Formspree form id (see below)
  CASHAPP_HANDLE: '$CASHAPP_HANDLE', // e.g. '$CarmenKershaw'
  VENMO_HANDLE: '@VENMO_HANDLE',     // e.g. '@Carmen-Kershaw'  ('' to hide)
}
```

### Getting a free Formspree FORM_ID

1. Go to **<https://formspree.io>** and create a **free** account.
2. Click **New Form**, name it (e.g. "CMK Art Orders"), and set the notification
   email to wherever you want orders and contact messages delivered.
3. Formspree gives you an endpoint like `https://formspree.io/f/abcdwxyz`. Copy
   the **last part** — the `abcdwxyz` — and paste it in as `FORM_ID`.
4. The **first** time a real submission comes through, Formspree emails you a
   one-time link to confirm your address. Click it once and you're live.

> The free plan includes 50 submissions/month, which is plenty for a small shop.
> Both the **Checkout** and the **Contact** page use this same `FORM_ID`; each
> submission is tagged (`type: "ORDER REQUEST"` or `"CONTACT MESSAGE"`) so you
> can tell them apart in your inbox.

### CashApp / Venmo handles

Set `CASHAPP_HANDLE` (keep the leading `$`) and `VENMO_HANDLE` (keep the leading
`@`). These appear on the confirmation screen after a buyer places an order.
Leave `VENMO_HANDLE` as `''` to hide the Venmo option.

---

## 2. How the checkout works (manual payment)

1. A buyer adds available pieces to the cart and clicks **Proceed to Checkout**.
2. On **Checkout** they enter name, email, shipping address, and an optional
   message, then **Place Order Request**. This POSTs the order (buyer details,
   the list of paintings with titles/sizes/prices, and the total) to your
   Formspree form — you get an email.
3. The buyer sees a **confirmation screen** telling them to send the exact total
   by **CashApp** to your handle (with their name in the note so you can match
   it), or optionally by **Venmo**. It explains the painting ships once payment
   is confirmed.
4. **You** receive the order email, watch for the CashApp/Venmo payment, and
   ship once it lands.

Nothing is charged automatically and no card data ever touches the site.

---

## 3. Marking a painting sold (manual)

Because payment is manual, **nothing marks a painting sold automatically.**
After you have **confirmed** a buyer's CashApp/Venmo payment actually arrived:

1. Open **`client/src/data/paintings.js`**.
2. Find that painting and change its `status` from `'available'` to `'sold'`.
3. Rebuild and redeploy (`npm run build`, then push/redeploy — see below).

Sold pieces show a **"Sold" badge** and their **Add to Cart** button is
disabled, so they can't be purchased again.

---

## 4. Run locally

You only need the frontend. From the repo root:

```bash
cd client
npm install
npm run dev
```

Open **<http://localhost:5173>**. In **GitHub Codespaces**, open the **Ports**
tab and click the 🌐 globe next to **port 5173**.

> The Formspree submission works in dev too — but during testing, remember the
> real form emails your real inbox. Consider a throwaway Formspree form while
> experimenting.

---

## 5. Build for production (static — deploy to Vercel)

```bash
cd client
npm run build      # outputs a fully static site to client/dist/
npm run preview    # optional: preview the production build locally
```

`client/dist/` is a **fully static bundle** (HTML/CSS/JS + images) — no server,
no environment variables, no secrets. Deploy it anywhere that serves static
files.

### Deploying to Vercel

- **Root Directory:** `client`
- **Framework Preset:** Vite (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

That's it — there is no backend to deploy. (For client-side routing on a static
host, Vercel serves the SPA correctly out of the box with the Vite preset; if
you self-host elsewhere, add a rewrite so all routes fall back to `index.html`.)

---

## Editing content

### Paintings (the gallery)

All gallery data lives in **`client/src/data/paintings.js`** — an array of
painting objects (the file has full inline comments):

```js
{
  id: 1,                         // UNIQUE number — never reuse; the cart keys on it
  title: "Momma's Baby",
  group: 'One Line',             // exactly "One Line" or "African Fabric"
  medium: 'acrylic on canvas panel',
  size: '14" x 18"',
  price: 242,                    // a WHOLE-DOLLAR NUMBER (not "$242", no cents)
  image: '/images/painting1.jpg',
  status: 'available',           // exactly "available" or "sold" (lowercase)
  description: '',               // optional; shows in the lightbox when filled in
}
```

- **Edit** a title / price / description: change the field and save.
- **Add** a painting: copy a block, paste it, give it a **new unique `id`**.
- **Remove** a painting: delete its block.
- `group` must be exactly `"One Line"` or `"African Fabric"`; `status` must be
  exactly `"available"` or `"sold"` — the sections, filters, and badges depend
  on these.

### Swapping images

Images live in **`client/public/images/`** and are referenced as
`"/images/<filename>"`. Overwrite `painting1.jpg … painting12.jpg` with real
photos (keeping the filenames), or add new files and update the `image` field.

### Contact links

In **`client/src/pages/Contact.jsx`**, replace the placeholder email and update
the Facebook link; an Instagram block is included, commented out.

---

## About the `/server` folder (optional / legacy)

The site used to require a Flask backend (Stripe checkout + order emails). That
is **gone** — the site is now fully static and needs no backend. The `/server`
folder is kept only as an optional legacy helper (a health check + a local
contact log) and is **not needed to run, build, or deploy the site**. You can
ignore it, or delete it entirely.
