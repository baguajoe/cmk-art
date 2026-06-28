import { useState } from 'react'
import paintings from '../data/paintings.js'
import PaintingCard from '../components/PaintingCard.jsx'
import Lightbox from '../components/Lightbox.jsx'

// Gallery page (route "/gallery").
// - Maps over the paintings data array into a responsive grid of cards.
// - Filter buttons (All / Available / Sold) drive which cards show.
// - Clicking a card opens the Lightbox overlay.
const FILTERS = ['All', 'Available', 'Sold']

export default function Gallery() {
  // Which filter is active.
  const [filter, setFilter] = useState('All')
  // The painting currently shown in the lightbox (null = closed).
  const [selected, setSelected] = useState(null)

  // Apply the active filter to the data array.
  const visible = paintings.filter((p) => filter === 'All' || p.status === filter)

  return (
    <div className="page gallery">
      <h1>Gallery</h1>
      <p className="gallery-intro">
        Original abstract and mixed media works. Click any piece to view it larger.
      </p>

      {/* ---------- Filter buttons ---------- */}
      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ---------- Responsive grid ---------- */}
      <div className="gallery-grid">
        {visible.map((painting) => (
          <PaintingCard
            key={painting.title}
            painting={painting}
            onOpen={setSelected}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="empty-state">No paintings match this filter.</p>
      )}

      {/* ---------- Lightbox overlay ---------- */}
      <Lightbox painting={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
