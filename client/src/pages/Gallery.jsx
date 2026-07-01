import { useState } from 'react'
import paintings, { GROUPS } from '../data/paintings.js'
import PaintingCard from '../components/PaintingCard.jsx'
import Lightbox from '../components/Lightbox.jsx'

// Gallery page (route "/gallery").
// - Paintings are shown in two labelled sections, one per group
//   ("One Line" and "African Fabric").
// - Two independent filter rows:
//     * STATUS: All / Available / Sold
//     * GROUP:  All / One Line / African Fabric
// - Each card has price + Add to Cart (see PaintingCard).
// - Clicking a card's image opens the Lightbox overlay.
const STATUS_FILTERS = ['All', 'Available', 'Sold']
const GROUP_FILTERS = ['All', ...GROUPS]

export default function Gallery() {
  // Active status filter ('All' | 'Available' | 'Sold').
  const [statusFilter, setStatusFilter] = useState('All')
  // Active group filter ('All' | one of GROUPS).
  const [groupFilter, setGroupFilter] = useState('All')
  // The painting currently shown in the lightbox (null = closed).
  const [selected, setSelected] = useState(null)

  // Apply the status filter. Data status is lowercase ("available"/"sold"),
  // the buttons are capitalised, so compare case-insensitively.
  const matchesStatus = (p) =>
    statusFilter === 'All' || p.status === statusFilter.toLowerCase()

  // Which groups get a section, honouring the group filter.
  const visibleGroups = GROUPS.filter(
    (g) => groupFilter === 'All' || g === groupFilter
  )

  // Total cards across all visible sections (drives the empty state).
  const totalVisible = paintings.filter(
    (p) => visibleGroups.includes(p.group) && matchesStatus(p)
  ).length

  return (
    <div className="page gallery">
      <h1>Gallery</h1>
      <p className="gallery-intro">
        Original one-line and African-fabric works. Click any piece to view it
        larger, or add an available piece to your cart to purchase.
      </p>

      {/* ---------- Filter rows ---------- */}
      <div className="filter-group">
        <span className="filter-label">Status</span>
        <div className="filter-bar">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn ${statusFilter === f ? 'active' : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">Collection</span>
        <div className="filter-bar">
          {GROUP_FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn ${groupFilter === f ? 'active' : ''}`}
              onClick={() => setGroupFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Sections, one per visible group ---------- */}
      {visibleGroups.map((group) => {
        const cards = paintings.filter(
          (p) => p.group === group && matchesStatus(p)
        )
        if (cards.length === 0) return null
        return (
          <section key={group} className="gallery-section">
            <h2 className="gallery-section-title">{group}</h2>
            <div className="gallery-grid">
              {cards.map((painting) => (
                <PaintingCard
                  key={painting.id}
                  painting={painting}
                  onOpen={setSelected}
                />
              ))}
            </div>
          </section>
        )
      })}

      {totalVisible === 0 && (
        <p className="empty-state">No paintings match these filters.</p>
      )}

      {/* ---------- Lightbox overlay ---------- */}
      <Lightbox painting={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
