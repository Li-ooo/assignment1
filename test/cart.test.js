// cart.test.js - Vitest unit tests.
// We build a fresh catalog per test so that mutations (checkout
// decreasing quantityAvailable) never leak between tests.

import { describe, it, expect, beforeEach } from 'vitest'
import { PRODUCTS, findProductById } from '../src/products.js'
import { createCart, addToCart, calculateTotal, checkout } from '../src/cart.js'

let catalog
beforeEach(() => {
  // Deep-enough clone: top-level fields are primitives.
  catalog = PRODUCTS.map(p => ({ ...p }))
})

describe('findProductById', () => {
  it('returns the product when the id exists', () => {
    expect(findProductById(catalog, 2).name).toBe('Coffee Mug')
  })
  it('returns null when the id does not exist', () => {
    expect(findProductById(catalog, 999)).toBeNull()
  })
})

describe('addToCart', () => {
  it('adds a new product line with correct quantity and totalPrice', () => {
    const cart = createCart()
    const result = addToCart(cart, catalog, 1, 2)
    expect(result.success).toBe(true)
    expect(cart).toHaveLength(1)
    expect(cart[0]).toEqual({ productId: 1, quantity: 2, totalPrice: 399.98 })
  })

  it('accumulates quantity when the same product is added again', () => {
    const cart = createCart()
    addToCart(cart, catalog, 2, 1)
    addToCart(cart, catalog, 2, 3)
    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(4)
    expect(cart[0].totalPrice).toBe(199.60) // 4 * 49.90
  })

  it('fails when the product does not exist', () => {
    const cart = createCart()
    const result = addToCart(cart, catalog, 42, 1)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/does not exist/i)
    expect(cart).toHaveLength(0)
  })

  it('fails when requested quantity exceeds stock', () => {
    const cart = createCart()
    const result = addToCart(cart, catalog, 3, 999) // only 8 available
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/available/i)
    expect(cart).toHaveLength(0)
  })

  it('fails when the accumulated cart quantity would exceed stock', () => {
    const cart = createCart()
    addToCart(cart, catalog, 3, 6)
    const result = addToCart(cart, catalog, 3, 3) // 6 + 3 = 9 > 8
    expect(result.success).toBe(false)
  })

  it('fails on zero or negative quantity', () => {
    const cart = createCart()
    expect(addToCart(cart, catalog, 1, 0).success).toBe(false)
    expect(addToCart(cart, catalog, 1, -3).success).toBe(false)
    expect(cart).toHaveLength(0)
  })

  it('fails when the product is out of stock (quantityAvailable = 0)', () => {
    const cart = createCart()
    const result = addToCart(cart, catalog, 5, 1)
    expect(result.success).toBe(false)
  })
})

describe('calculateTotal', () => {
  it('sums line totals and rounds to 2 decimals', () => {
    const cart = createCart()
    addToCart(cart, catalog, 1, 1) // 199.99
    addToCart(cart, catalog, 2, 2) // 99.80
    expect(calculateTotal(cart)).toBeCloseTo(299.79, 2)
  })
  it('returns 0 for an empty cart', () => {
    expect(calculateTotal(createCart())).toBe(0)
  })
})

describe('checkout', () => {
  it('fails on an empty cart', () => {
    const result = checkout(createCart(), catalog)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/empty/i)
  })

  it('returns the correct total and decreases stock', () => {
    const stockBefore = catalog.find(p => p.id === 1).quantityAvailable // 10
    const cart = createCart()
    addToCart(cart, catalog, 1, 3)
    const result = checkout(cart, catalog)

    expect(result.success).toBe(true)
    expect(result.total).toBeCloseTo(599.97, 2) // 3 * 199.99
    expect(catalog.find(p => p.id === 1).quantityAvailable).toBe(stockBefore - 3)
  })

  it('decreases stock for every line in the cart', () => {
    const cart = createCart()
    addToCart(cart, catalog, 1, 1)
    addToCart(cart, catalog, 4, 5)
    checkout(cart, catalog)
    expect(catalog.find(p => p.id === 1).quantityAvailable).toBe(9)
    expect(catalog.find(p => p.id === 4).quantityAvailable).toBe(45)
  })
})
