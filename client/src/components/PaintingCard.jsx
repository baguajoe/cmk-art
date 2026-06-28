// PaintingCard renders a single artwork in the gallery grid.
// Props:
//   painting — one object from /data/paintings.js
//   onOpen   — callback fired when the card image is clicked (opens Lightbox)
//
// "Sold" pieces are styled differently from "Available" ones via the
// status badge class and a muted card class.
export default function PaintingCard({ painting, onOpen }) {
  const isSold = painting.status === 'Sold'

  return (
    <article className={`painting-card ${isSold ? 'is-sold' : ''}`}>
      <button
        className="painting-image-btn"
        onClick={() => onOpen(painting)}
        aria-label={`View ${painting.title} larger`}
      >
        <img src={painting.image} alt={painting.title} loading="lazy" />
        <span className={`status-badge ${isSold ? 'badge-sold' : 'badge-available'}`}>
          {painting.status}
        </span>
      </button>

      <div className="painting-info">
        <h3 className="painting-title">{painting.title}</h3>
        <p className="painting-meta">{painting.medium}</p>
        <p className="painting-meta">
          {painting.size} · {painting.year}
        </p>
        <p className={`painting-price ${isSold ? 'price-sold' : ''}`}>
          {painting.price}
        </p>
      </div>
    </article>
  )
}
