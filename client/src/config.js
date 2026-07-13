// ============================================================================
//  SITE CONFIG — edit these three values, then rebuild
// ============================================================================
//
//  This is the ONE place to set up the manual (no-backend) checkout. Change the
//  three placeholders below and you're done — nothing else needs editing.
//
//    1. FORM_ID        — your Formspree form id (order + contact notifications)
//    2. CASHAPP_HANDLE — where buyers send payment (primary)
//    3. VENMO_HANDLE   — secondary/optional payment handle
//
//  ----------------------------------------------------------------------------
//  1) FORM_ID  (Formspree)
//  ----------------------------------------------------------------------------
//  The Checkout and Contact pages POST to https://formspree.io/f/<FORM_ID>.
//  Get a FREE form id:
//    a. Go to https://formspree.io and create a free account.
//    b. Click "New Form", name it (e.g. "CMK Art Orders"), and set the
//       notification email to the address where you want orders/messages sent.
//    c. Formspree gives you an endpoint like  https://formspree.io/f/abcdwxyz
//       Copy the LAST part (the "abcdwxyz") and paste it into FORM_ID below.
//    d. The first time a real submission comes in, Formspree emails you a link
//       to confirm the address — click it once and you're live.
//
//  >>> REPLACE the placeholder 'FORM_ID' below with your real Formspree id. <<<
//
//  ----------------------------------------------------------------------------
//  2) & 3)  CashApp / Venmo handles
//  ----------------------------------------------------------------------------
//  These are shown on the confirmation screen after a buyer submits an order.
//  Payment is MANUAL: the buyer sends money to one of these handles, includes
//  their name, and Carmen ships once the payment lands. Include the leading
//  "$" for CashApp and "@" for Venmo (e.g. '$CarmenKershaw', '@Carmen-Kershaw').
//  Leave VENMO_HANDLE as '' to hide the Venmo option.
// ============================================================================

const config = {
  // 1) Formspree form id (just the id, NOT the full URL).
  // ⚠️ TODO: STILL A PLACEHOLDER — paste your real Formspree form id here after
  // you sign up (see the step-by-step instructions above). Until you do, order
  // and contact submissions will NOT be delivered. Replace 'FORM_ID' only —
  // keep the quotes, e.g. FORM_ID: 'abcdwxyz'.
  FORM_ID: 'FORM_ID',

  // 2) CashApp handle — primary payment method (keep the leading "$").
  CASHAPP_HANDLE: '$cmkart',

  // 3) Venmo handle — secondary/optional (keep the leading "@"); '' to hide.
  // Empty = Venmo is not offered and is hidden everywhere automatically.
  VENMO_HANDLE: '',
}

// Convenience: the full Formspree endpoint used by fetch() in the pages.
export const FORMSPREE_ENDPOINT = `https://formspree.io/f/${config.FORM_ID}`

export default config
