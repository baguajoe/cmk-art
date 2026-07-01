import { useEffect } from 'react'
import { formatPrice } from '../utils/format.js'

// Lightbox shows an enlarged view of a single painting in an overlay.
// Props:
//   painting — the artwork to display (or null/undefined when closed)
//   onClose  — callback to close the overlay
//
// Closes when the user clicks the dark backdrop or presses the Escape key.
export default function Lightbox({ painting, onClose }) {
  // Register a keydown listener while the lightbox is open so Escape closes it.
  useEffect(() => {
    if (!painting) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    // Prevent the page behind the overlay from scrolling.
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [painting, onClose])

  // Nothing selected → render nothing.
  if (!painting) return null

  return (
    // Clicking the backdrop closes the lightbox...
    <div className="lightbox-backdrop" onClick={onClose}>
      {/* ...but clicks on the inner content should NOT close it. */}
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <img src={painting.image} alt={painting.title} />
        <div className="lightbox-caption">
          <h3>{painting.title}</h3>
          <p>
            {painting.medium} · {painting.size}
          </p>
          {/* description is optional — only render it once filled in. */}
          {painting.description && (
            <p className="lightbox-description">{painting.description}</p>
          )}
          <p className="lightbox-price">
            {formatPrice(painting.price)} —{' '}
            {painting.status === 'sold' ? 'Sold' : 'Available'}
          </p>
        </div>
      </div>
    </div>
  )
}
