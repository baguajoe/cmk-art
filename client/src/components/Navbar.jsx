import { useState } from 'react'
import { NavLink } from 'react-router-dom'

// Shared navigation bar shown on every page.
// - Uses NavLink so the active route is automatically highlighted
//   (react-router adds the "active" class, which we style in index.css).
// - Responsive: on narrow screens the links collapse into a hamburger menu
//   toggled by the `open` state.
export default function Navbar() {
  const [open, setOpen] = useState(false)

  // Close the mobile menu after a link is tapped.
  const closeMenu = () => setOpen(false)

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={closeMenu}>
          CMK<span className="brand-accent">Art</span>
        </NavLink>

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
      </div>
    </header>
  )
}
