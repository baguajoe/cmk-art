import { Link, useLocation } from 'react-router-dom'
import config from '../config.js'

// ThankYou page (route "/thank-you") — the order confirmation screen.
//
// The Checkout page navigates here after a successful Formspree submission,
// passing { name, total } in router state. We use those to show the buyer
// exactly what to send and how, via the manual CashApp/Venmo flow.
//
// If someone lands here directly (no router state — e.g. a refresh or a typed
// URL), we show a friendly generic message instead of order-specific details.
export default function ThankYou() {
  const { state } = useLocation()
  const name = state?.name
  const total = state?.total

  // Direct visit with no order context.
  if (!name || !total) {
    return (
      <div className="page thankyou">
        <h1>Thank You!</h1>
        <p className="thankyou-lead">
          If you just placed an order request, check your email for the payment
          details. Otherwise, browse the gallery to find your next piece.
        </p>
        <Link to="/gallery" className="btn btn-primary">
          Back to the Gallery
        </Link>
      </div>
    )
  }

  return (
    <div className="page thankyou">
      <h1>Order Request Received 🎉</h1>
      <p className="thankyou-lead">
        Thank you, {name}! Your order request has been received. To complete
        your purchase, please send payment using the details below.
      </p>

      {/* ---------- Payment instructions ---------- */}
      <div className="thankyou-pay">
        <h2>Send your payment</h2>

        <p className="thankyou-total">
          Amount to send: <strong>{total}</strong>
        </p>

        {/* Primary: CashApp */}
        <p className="thankyou-pay-line">
          <strong>CashApp (preferred):</strong>{' '}
          <span className="thankyou-handle">{config.CASHAPP_HANDLE}</span>
        </p>
        <p className="thankyou-pay-note">
          Please include your name (<strong>{name}</strong>) in the payment note
          so Carmen can match it to your order.
        </p>

        {/* Secondary: Venmo (optional) */}
        {config.VENMO_HANDLE && (
          <p className="thankyou-pay-line">
            <strong>Venmo (optional alternative):</strong>{' '}
            <span className="thankyou-handle">{config.VENMO_HANDLE}</span>
            {' — '}again, include your name in the note.
          </p>
        )}

        <p className="thankyou-ship-note">
          Your painting ships as soon as your payment is confirmed. Carmen will
          be in touch by email to arrange delivery.
        </p>
      </div>

      <Link to="/gallery" className="btn btn-primary">
        Back to the Gallery
      </Link>
    </div>
  )
}
