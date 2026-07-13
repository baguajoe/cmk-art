import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice } from '../utils/format.js'
import { FORMSPREE_ENDPOINT } from '../config.js'

// Checkout page (route "/checkout").
//
// This is a fully STATIC, no-backend checkout:
//   * Shows the order summary (items + total).
//   * Collects buyer name, email, shipping address, and an optional message.
//   * On submit we POST the order as JSON to Formspree (see /src/config.js),
//     which emails Carmen the order details. No page reload; we handle success
//     and error states inline.
//   * On success we send the buyer to the Thank-You page (route "/thank-you"),
//     passing the order name + total in router state so it can show the
//     CashApp/Venmo payment instructions.
//
// NOTE: payment is MANUAL. We deliberately do NOT mark any painting "sold" here
// — Carmen sets a painting's status to "sold" by hand in
// src/data/paintings.js AFTER she confirms the CashApp/Venmo payment landed.
export default function Checkout() {
  const { items, subtotal, count, clearCart } = useCart()
  const navigate = useNavigate()

  const [buyer, setBuyer] = useState({
    name: '',
    email: '',
    address: '',
    message: '',
  })
  // 'idle' | 'sending' | 'error'
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setBuyer((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    // Build a readable list of the requested paintings for the email.
    const paintingList = items.map((p) => ({
      title: p.title,
      size: p.size,
      price: formatPrice(p.price),
    }))

    // A one-line-per-painting summary so the Formspree email is easy to read.
    const paintingsText = items
      .map((p) => `${p.title} (${p.size}) — ${formatPrice(p.price)}`)
      .join('\n')

    const payload = {
      type: 'ORDER REQUEST',
      name: buyer.name.trim(),
      email: buyer.email.trim(),
      address: buyer.address.trim(),
      message: buyer.message.trim(),
      paintings: paintingsText,
      paintings_detail: paintingList,
      total: formatPrice(subtotal),
      // _subject controls the email subject line Formspree sends.
      _subject: `CMK Art order request — ${buyer.name.trim()} — ${formatPrice(subtotal)}`,
    }

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        // Capture the order details for the confirmation screen BEFORE we clear
        // the cart (clearing resets subtotal to 0).
        const orderTotal = formatPrice(subtotal)
        const buyerName = buyer.name.trim()
        clearCart()
        navigate('/thank-you', {
          state: { name: buyerName, total: orderTotal },
        })
        return
      }

      // Formspree returns JSON with an "errors" array on failure.
      const data = await res.json().catch(() => ({}))
      const firstError =
        Array.isArray(data.errors) && data.errors[0]?.message
      setErrorMsg(
        firstError ||
          'Could not send your order request. Please try again, or use the Contact page.'
      )
      setStatus('error')
    } catch {
      setErrorMsg('Could not reach the order service. Please try again later.')
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

  const canSubmit =
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

        {/* ---------- Buyer info + submit ---------- */}
        <section className="checkout-payment">
          <form className="checkout-form" onSubmit={handleSubmit}>
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
            <label>
              Message <span className="field-optional">(optional)</span>
              <textarea
                name="message"
                rows="3"
                placeholder="Anything you'd like Carmen to know?"
                value={buyer.message}
                onChange={handleChange}
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary checkout-pay-btn"
              disabled={!canSubmit || status === 'sending'}
            >
              {status === 'sending'
                ? 'Sending…'
                : `Place Order Request · ${formatPrice(subtotal)}`}
            </button>

            {status === 'error' && (
              <p className="form-feedback error">{errorMsg}</p>
            )}
            <p className="checkout-secure-note">
              Submitting sends Carmen your order request. Payment is arranged
              afterward by CashApp — you'll see the instructions on the next
              screen. Nothing is charged automatically.
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}
