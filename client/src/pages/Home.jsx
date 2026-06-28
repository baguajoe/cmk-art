import { Link } from 'react-router-dom'

// Home page (route "/").
// Hero with a featured-artwork placeholder + title, a short welcome,
// an "About Us" section, and a button leading to the Gallery.
export default function Home() {
  return (
    <div className="page home">
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero-text">
          <h1 className="hero-title">CMK Art</h1>
          <p className="hero-subtitle">Abstract & mixed media by Carmen Kershaw</p>
          <p className="hero-welcome">
            Welcome — a collection of original paintings celebrating color,
            movement, and storytelling. Each piece invites you to find your
            own meaning and emotional connection.
          </p>
          <Link to="/gallery" className="btn btn-primary">
            View the Gallery
          </Link>
        </div>

        {/* Featured-artwork placeholder. Swap the image src for a real
            featured piece, e.g. "/images/painting1.jpg". */}
        <div className="hero-image">
          <img src="/images/painting1.jpg" alt="Featured artwork by Carmen Kershaw" />
        </div>
      </section>

      {/* ---------- About Us ---------- */}
      <section className="about-us">
        <h2>About Us</h2>
        <p>
          CMK Art is the studio of Carmen Kershaw, a self-taught abstract artist
          and retired kindergarten teacher. Her work blends expressive abstract
          painting with two signature techniques — continuous-line artwork drawn
          from a single uninterrupted line, and vibrant African fabrics that add
          texture, depth, and cultural significance to her mixed media pieces.
        </p>
        <p>
          She believes art should inspire reflection, spark conversation, and
          bring beauty into everyday spaces.
        </p>
        <Link to="/bio" className="btn btn-ghost">
          Read Carmen's full story →
        </Link>
      </section>
    </div>
  )
}
