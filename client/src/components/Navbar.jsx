import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

// Shared navigation bar shown on every page.
// - Uses NavLink so the active route is automatically highlighted
//   (react-router adds the "active" class, which we style in index.css).
// - Responsive: on narrow screens the links collapse into a hamburger menu
//   toggled by the `open` state.
// - Shows a cart button with a live item-count badge; clicking it opens the
//   slide-out cart drawer (see App.jsx / CartPanel.jsx).
// Props:
//   onCartClick — open the cart drawer.
export default function Navbar({ onCartClick }) {
  const [open, setOpen] = useState(false)
  const { count } = useCart()

  // Close the mobile menu after a link is tapped.
  const closeMenu = () => setOpen(false)

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={closeMenu}>
          CMK<span className="brand-accent">Art</span>
        </NavLink>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/bio" onClick={closeMenu}>
            Bio
          </NavLink>
          <NavLink to="/gallery" onClick={closeMenu}>
            Gallery
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>
        </nav>

        <div className="navbar-right">
          {/* Cart button with item-count badge. */}
          <button className="cart-button" onClick={onCartClick} aria-label="Open cart">
            <span className="cart-icon" aria-hidden="true">
              🛒
            </span>
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>

          {/* Hamburger button — only visible on mobile via CSS */}
          <button
            className="hamburger"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
