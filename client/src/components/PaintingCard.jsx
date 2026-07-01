import { useCart } from '../context/CartContext.jsx'
import { formatPrice } from '../utils/format.js'

// PaintingCard renders a single artwork in the gallery grid.
// Props:
//   painting — one object from /data/paintings.js
//   onOpen   — callback fired when the card image is clicked (opens Lightbox)
//
// "sold" pieces are visually de-emphasised, show a "Sold" badge, and their
// Add-to-Cart button is disabled. Available pieces can be added to the cart
// (and the button switches to "In Cart" once added, since originals are
// one-of-a-kind and can't be added twice).
export default function PaintingCard({ painting, onOpen }) {
  const isSold = painting.status === 'sold'
  const { addToCart, isInCart } = useCart()
  const inCart = isInCart(painting.id)

  return (
    <article className={`painting-card ${isSold ? 'is-sold' : ''}`}>
      <button
        className="painting-image-btn"
        onClick={() => onOpen(painting)}
        aria-label={`View ${painting.title} larger`}
      >
        <img src={painting.image} alt={painting.title} loading="lazy" />
        <span className={`status-badge ${isSold ? 'badge-sold' : 'badge-available'}`}>
          {isSold ? 'Sold' : 'Available'}
        </span>
      </button>

      <div className="painting-info">
        <h3 className="painting-title">{painting.title}</h3>
        <p className="painting-meta">{painting.medium}</p>
        <p className="painting-meta">{painting.size}</p>
        <p className={`painting-price ${isSold ? 'price-sold' : ''}`}>
          {formatPrice(painting.price)}
        </p>

        {/* Add to Cart — disabled when sold or already in the cart. */}
        <button
          className="btn btn-primary add-to-cart-btn"
          onClick={() => addToCart(painting)}
          disabled={isSold || inCart}
        >
          {isSold ? 'Sold' : inCart ? 'In Cart' : 'Add to Cart'}
        </button>
      </div>
    </article>
  )
}
