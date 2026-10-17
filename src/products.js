// products.js - Product catalog (pure data + lookup helper)
// Kept separate from the CLI and from the cart logic so it can be
// imported and tested in isolation.

export const PRODUCTS = [
  { id: 1, name: 'Classic T-Shirt',   description: '100% cotton, unisex', price: 199.99, quantityAvailable: 10 },
  { id: 2, name: 'Coffee Mug',         description: 'Ceramic, 350 ml',     price: 49.90,  quantityAvailable: 25 },
  { id: 3, name: 'Wireless Mouse',     description: 'Ergonomic, 2.4 GHz',  price: 249.00, quantityAvailable: 8 },
  { id: 4, name: 'Lined Notebook A5', description: '96 pages, hard cover', price: 29.50,  quantityAvailable: 50 },
  { id: 5, name: 'Desk Lamp',          description: 'LED, adjustable arm',  price: 129.00, quantityAvailable: 0 } // out of stock on purpose
]

// Returns the product object whose id matches, or null if not found.
// Accepts the products array as an argument so tests can pass a
// fresh catalog instead of mutating the shared PRODUCTS constant.
export function findProductById(products, id) {
  if (!Array.isArray(products)) return null
  return products.find(p => p.id === id) || null
}
