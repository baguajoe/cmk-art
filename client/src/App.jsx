import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import CartPanel from './components/CartPanel.jsx'
import Home from './pages/Home.jsx'
import Bio from './pages/Bio.jsx'
import Gallery from './pages/Gallery.jsx'
import Contact from './pages/Contact.jsx'
import Checkout from './pages/Checkout.jsx'
import ThankYou from './pages/ThankYou.jsx'

// App defines the shared layout (Navbar + Footer on every page) and the
// route table. The cart drawer (CartPanel) is rendered here at the root so it
// can slide over any page; its open/closed state lives here and the Navbar's
// cart button toggles it.
// Add a new page by creating a component in /pages and adding a <Route> below
// plus a link in Navbar.jsx.
export default function App() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <div className="app">
      <Navbar onCartClick={() => setCartOpen(true)} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bio" element={<Bio />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </main>
      <Footer />
      <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
