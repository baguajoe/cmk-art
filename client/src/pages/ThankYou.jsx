import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

// ThankYou page (route "/thank-you").
// Stripe redirects here after a successful payment with a ?session_id=... in
// the URL (see the success_url the backend sets on the Checkout Session).
//
// What happens here:
//   1. We clear the cart (the order is placed).
//   2. We ping the backend /api/order-complete with the session id as a
//      FALLBACK trigger for the confirmation email + marking the piece sold.
//      The Stripe webhook (see server/app.py) is the PRIMARY, reliable trigger;
//      this call just helps in local/dev testing where a webhook may not be
//      configured. The backend de-dupes by session id so no double emails.
export default function ThankYou() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')
  const { clearCart } = useCart()
  // Guard so React StrictMode's double-invoke doesn't fire the effect twice.
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    clearCart()

    if (sessionId) {
      // Fire-and-forget; failures are non-fatal (the webhook is authoritative).
      fetch('/api/order-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      }).catch(() => {})
    }
  }, [sessionId, clearCart])

  return (
    <div className="page thankyou">
      <h1>Thank You! 🎉</h1>
      <p className="thankyou-lead">
        Your order is confirmed. A confirmation has been sent and Carmen will be
        in touch about shipping your original artwork.
      </p>
      {sessionId && (
        <p className="thankyou-ref">
          Order reference: <code>{sessionId}</code>
        </p>
      )}
      <Link to="/gallery" className="btn btn-primary">
        Back to the Gallery
      </Link>
    </div>
  )
}
