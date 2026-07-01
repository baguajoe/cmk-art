import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice } from '../utils/format.js'

// CartPanel is the slide-out cart drawer, rendered once at the app root.
// Props:
//   open    — whether the drawer is visible
//   onClose — close the drawer
//
// It lists each painting in the cart (title, size, price, remove button),
// shows a running subtotal, and has a "Proceed to Checkout" button that
// navigates to the Checkout page.
export default function CartPanel({ open, onClose }) {
  const { items, subtotal, removeFromCart, count } = useCart()
  const navigate = useNavigate()

  // Close on Escape and lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const goToCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  if (!open) return null

  return (
    <div className="cart-backdrop" onClick={onClose}>
      {/* Stop clicks inside the drawer from closing it. */}
      <aside
        className="cart-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping cart"
      >
        <div className="cart-panel-header">
          <h2>Your Cart ({count})</h2>
          <button className="cart-close" onClick={onClose} aria-label="Close cart">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <p className="cart-empty">Your cart is empty.</p>
        ) : (
          <>
            <ul className="cart-list">
              {items.map((p) => (
                <li key={p.id} className="cart-item">
                  <img src={p.image} alt={p.title} className="cart-item-thumb" />
                  <div className="cart-item-info">
                    <span className="cart-item-title">{p.title}</span>
                    <span className="cart-item-meta">{p.size}</span>
                    <span className="cart-item-price">{formatPrice(p.price)}</span>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(p.id)}
                    aria-label={`Remove ${p.title} from cart`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-subtotal">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <button className="btn btn-primary cart-checkout-btn" onClick={goToCheckout}>
              Proceed to Checkout
            </button>
          </>
        )}
      </aside>
    </div>
  )
}
