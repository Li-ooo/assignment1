// index.js - Command line interface.
// UI glue only: it reads input, prints menus, and delegates every piece
// of real logic to cart.js / products.js so that those functions stay
// unit-testable.

import readline from 'node:readline'
import { PRODUCTS } from './products.js'
import { createCart, addToCart, calculateTotal, checkout } from './cart.js'

const cart = createCart()

function printProducts() {
  console.log('\n=== Available products ===')
  for (const p of PRODUCTS) {
    console.log(`[${p.id}] ${p.name} - ${p.description} - ${p.price.toFixed(2)} kr (in stock: ${p.quantityAvailable})`)
  }
  console.log('Commands: add <id> <qty> | cart | checkout | quit\n')
}

function printCart() {
  if (cart.length === 0) {
    console.log('Your cart is empty.')
    return
  }
  console.log('\n=== Your cart ===')
  for (const item of cart) {
    console.log(`  Product ${item.productId} x${item.quantity} = ${item.totalPrice.toFixed(2)} kr`)
  }
  console.log(`  Total: ${calculateTotal(cart).toFixed(2)} kr\n`)
}

function handleLine(line) {
  const input = line.trim().toLowerCase()

  if (input === 'quit') {
    console.log('Goodbye!')
    rl.close()
    return
  }

  if (input === 'cart') {
    printCart()
    printProducts()
    return
  }

  if (input === 'checkout') {
    const result = checkout(cart, PRODUCTS)
    if (result.success) {
      console.log(`\nCheckout complete! You paid ${result.total.toFixed(2)} kr. Thank you for shopping with us.`)
    } else {
      console.log(`\nCheckout failed: ${result.error}`)
    }
    printProducts()
    return
  }

  const match = input.match(/^add\s+(\d+)\s+(\d+)$/)
  if (match) {
    const productId = Number(match[1])
    const quantity = Number(match[2])
    const result = addToCart(cart, PRODUCTS, productId, quantity)
    if (result.success) {
      console.log(`Added ${quantity} x product ${productId} to cart.`)
    } else {
      console.log(`Could not add: ${result.error}`)
    }
    printCart()
    return
  }

  console.log('Unknown command. Try: add <id> <qty> | cart | checkout | quit')
  printProducts()
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('Welcome to the Command Line Shopping Cart!')
printProducts()
rl.setPrompt('> ')
rl.prompt()
rl.on('line', line => {
  handleLine(line)
  rl.prompt()
})
rl.on('close', () => process.exit(0))
