import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice } from '../utils/format.js'
import paymentHandles from '../data/paymentHandles.js'

// Checkout page (route "/checkout").
// - Shows the order summary (items + total).
// - Collects buyer name, email, and shipping address.
// - Primary payment is Stripe Checkout: we POST the cart to the backend, which
//   creates a Stripe Checkout Session and returns its hosted-page URL; we then
//   redirect the browser there. On success Stripe returns the buyer to the
//   Thank-You page; on cancel, back here.
// - Below the Stripe button are manual payment options (CashApp / Venmo /
//   Zelle) — see /data/paymentHandles.js to set those handles.
export default function Checkout() {
  const { items, subtotal, count } = useCart()
  const navigate = useNavigate()

  const [buyer, setBuyer] = useState({ name: '', email: '', address: '' })
  // 'idle' | 'redirecting' | 'error'
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setBuyer((prev) => ({ ...prev, [name]: value }))
  }

  const handleStripeCheckout = async (e) => {
    e.preventDefault()
    setStatus('redirecting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Send only the ids; the backend looks up the authoritative price
          // and availability so the client can't tamper with amounts.
          items: items.map((p) => ({ id: p.id })),
          buyer,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok && data.url) {
        // Hand off to Stripe's hosted checkout page.
        window.location.href = data.url
        return
      }

      setErrorMsg(
        data.error || 'Could not start checkout. Please try again.'
      )
      setStatus('error')
    } catch {
      setErrorMsg('Could not reach the server. Please try again later.')
      setStatus('error')
    }
  }

  // Empty cart → gentle redirect prompt.
  if (count === 0) {
    return (
      <div className="page checkout">
        <h1>Checkout</h1>
        <p className="empty-state">
          Your cart is empty.{' '}
          <button className="link-button" onClick={() => navigate('/gallery')}>
            Browse the gallery
          </button>
        </p>
      </div>
    )
  }

  const canPay =
    buyer.name.trim() && buyer.email.trim() && buyer.address.trim()

  return (
    <div className="page checkout">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        {/* ---------- Order summary ---------- */}
        <section className="checkout-summary">
          <h2>Order Summary</h2>
          <ul className="checkout-items">
            {items.map((p) => (
              <li key={p.id} className="checkout-item">
                <img src={p.image} alt={p.title} className="checkout-thumb" />
                <div>
                  <span className="checkout-item-title">{p.title}</span>
                  <span className="checkout-item-meta">{p.size}</span>
                </div>
                <span className="checkout-item-price">{formatPrice(p.price)}</span>
              </li>
            ))}
          </ul>
          <div className="checkout-total">
            <span>Total</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
        </section>

        {/* ---------- Buyer info + payment ---------- */}
        <section className="checkout-payment">
          <form className="checkout-form" onSubmit={handleStripeCheckout}>
            <h2>Your Details</h2>
            <label>
              Full name
              <input
                type="text"
                name="name"
                value={buyer.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={buyer.email}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Shipping address
              <textarea
                name="address"
                rows="4"
                placeholder="Street, city, state, ZIP, country"
                value={buyer.address}
                onChange={handleChange}
                required
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary checkout-pay-btn"
              disabled={!canPay || status === 'redirecting'}
            >
              {status === 'redirecting'
                ? 'Redirecting to Stripe…'
                : `Pay with Card · ${formatPrice(subtotal)}`}
            </button>

            {status === 'error' && (
              <p className="form-feedback error">{errorMsg}</p>
            )}
            <p className="checkout-secure-note">
              Card payments are processed securely by Stripe. You'll be taken to
              Stripe's hosted checkout page.
            </p>
          </form>

          {/* ---------- Manual payment options ---------- */}
          <div className="other-pay">
            <h3>Other ways to pay</h3>
            <p className="other-pay-note">
              Prefer to pay directly? Use one of the options below, then{' '}
              <a href="/contact">message me</a> with your name and the piece(s)
              you bought so I can confirm and ship. (These are manual — please
              still fill in your shipping address above or include it in your
              message.)
            </p>
            <ul className="other-pay-list">
              {paymentHandles.cashapp && (
                <li>
                  <strong>CashApp:</strong> {paymentHandles.cashapp}
                </li>
              )}
              {paymentHandles.venmo && (
                <li>
                  <strong>Venmo:</strong> {paymentHandles.venmo}
                </li>
              )}
              {paymentHandles.zelle && (
                <li>
                  <strong>Zelle:</strong> {paymentHandles.zelle}
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
