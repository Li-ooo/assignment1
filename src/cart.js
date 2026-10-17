// cart.js - Shopping cart logic.
// Every function here is pure w.r.t. its inputs (except checkout, which
// intentionally decreases quantityAvailable on the catalog, as the
// assignment requires) and has no readline/console dependency, so it can
// be unit tested with Vitest.

import { findProductById } from './products.js'

// Round to 2 decimals to avoid floating point drift (e.g. 0.1 + 0.2).
function money(n) {
  return Math.round(n * 100) / 100
}

export function createCart() {
  return []
}

// Adds `quantity` of product `productId` to `cart`.
// Validation order: product exists -> quantity positive integer -> enough stock
// (including anything already in the cart for that product).
// Returns { success: true } on success, or { success: false, error: '...' }.
export function addToCart(cart, products, productId, quantity) {
  const product = findProductById(products, productId)
  if (!product) {
    return { success: false, error: `Product with id ${productId} does not exist.` }
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { success: false, error: 'Quantity must be a positive integer.' }
  }

  const existing = cart.find(item => item.productId === productId)
  const alreadyInCart = existing ? existing.quantity : 0
  if (alreadyInCart + quantity > product.quantityAvailable) {
    return {
      success: false,
      error: `Only ${product.quantityAvailable} of '${product.name}' available (cart already has ${alreadyInCart}).`
    }
  }

  if (existing) {
    existing.quantity += quantity
    existing.totalPrice = money(existing.quantity * product.price)
  } else {
    cart.push({ productId, quantity, totalPrice: money(quantity * product.price) })
  }
  return { success: true }
}

// Sum of every line's totalPrice, rounded to 2 decimals.
export function calculateTotal(cart) {
  return money(cart.reduce((sum, item) => sum + item.totalPrice, 0))
}

// Completes the purchase: rejects an empty cart, then decreases the
// quantityAvailable of every product in the cart. Returns a snapshot
// of the purchased items together with the total.
export function checkout(cart, products) {
  if (!Array.isArray(cart) || cart.length === 0) {
    return { success: false, error: 'Cannot checkout an empty cart.' }
  }
  const total = calculateTotal(cart)
  for (const item of cart) {
    const product = findProductById(products, item.productId)
    if (product) {
      product.quantityAvailable -= item.quantity
    }
  }
  const snapshot = cart.map(item => ({ ...item }))
  return { success: true, total, items: snapshot }
}
