// Small shared formatting helpers.
//
// Prices in the gallery data (see /data/paintings.js) are stored as plain
// whole-dollar NUMBERS (e.g. 242), not strings. formatPrice() turns them into
// a display string like "$242" or "$1,200". Keeping the raw number in the data
// makes it easy to add up a cart subtotal and to send exact amounts to Stripe.
export function formatPrice(amount) {
  const n = Number(amount) || 0
  return '$' + n.toLocaleString('en-US')
}
