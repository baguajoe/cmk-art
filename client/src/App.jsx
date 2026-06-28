import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Bio from './pages/Bio.jsx'
import Gallery from './pages/Gallery.jsx'
import Contact from './pages/Contact.jsx'

// App defines the shared layout (Navbar + Footer on every page) and the
// route table. Add a new page by creating a component in /pages and adding
// a <Route> below plus a link in Navbar.jsx.
export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bio" element={<Bio />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
