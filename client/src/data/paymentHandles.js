// ============================================================================
//  MANUAL PAYMENT HANDLES  (CashApp / Venmo / Zelle)
// ============================================================================
//  These are shown on the Checkout page under "Other ways to pay". They are
//  fully manual: the buyer pays you directly and messages you, then you mark
//  the piece sold by hand (there is no automation for these — only Stripe is
//  automated).
//
//  >>> REPLACE the placeholder strings below with your real handles. <<<
//  Leave a value as an empty string ('') to hide that payment option.
// ============================================================================

const paymentHandles = {
  cashapp: '$CASHAPP_HANDLE', // e.g. '$CarmenKershaw'
  venmo: '@VENMO_HANDLE', // e.g. '@Carmen-Kershaw'
  zelle: 'ZELLE_EMAIL', // e.g. 'carmen@example.com' or a phone number
}

export default paymentHandles
