import { createContext, useContext, useMemo, useState } from 'react'

// ============================================================================
//  CART CONTEXT
// ============================================================================
//  A tiny site-wide cart built on React Context so any component (Navbar,
//  Gallery, Checkout) can read and change the cart without prop-drilling.
//
//  Design notes for this shop:
//   * Every painting is a ONE-OF-A-KIND original, so there are no quantities —
//     an item is simply in the cart or it isn't. We prevent adding the same
//     painting twice (keyed by painting id).
//   * The cart is held in memory only (component state). It intentionally does
//     NOT use localStorage, so refreshing the page clears the cart.
// ============================================================================

const CartContext = createContext(null)

export function CartProvider({ children }) {
  // The cart is an array of full painting objects (see /data/paintings.js).
  const [items, setItems] = useState([])

  // Add a painting. No-op if it's already in the cart (originals are unique).
  const addToCart = (painting) => {
    setItems((prev) =>
      prev.some((p) => p.id === painting.id) ? prev : [...prev, painting]
    )
  }

  // Remove a painting by id.
  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }

  // Empty the cart (used after a successful checkout).
  const clearCart = () => setItems([])

  // Is this painting already in the cart?
  const isInCart = (id) => items.some((p) => p.id === id)

  // Derived values, memoised so they only recompute when items change.
  const { count, subtotal } = useMemo(
    () => ({
      count: items.length,
      subtotal: items.reduce((sum, p) => sum + Number(p.price || 0), 0),
    }),
    [items]
  )

  const value = {
    items,
    count,
    subtotal,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Convenience hook so components can do: const { addToCart } = useCart()
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used inside a <CartProvider>')
  }
  return ctx
}
