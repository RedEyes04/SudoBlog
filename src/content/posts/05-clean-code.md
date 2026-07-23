---
id: 5
title: The Art of Writing Clean Code
subtitle: Principles That Stand the Test of Time
summary: Clean code is not about following rules blindly — it's about writing code that other humans can understand and maintain.
date: 2026-07-05
---

## What Is Clean Code?

Clean code is code that is **easy to read, easy to understand, and easy to change**.

### 1. Meaningful Names

```ts
// Bad
const d = new Date()
const fn = (x: number) => x * 2

// Good
const currentDate = new Date()
const double = (value: number) => value * 2
```

> "There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton

### 2. Small Functions

A function should do **one thing** and do it well:

```ts
// Bad — does too much
function processOrder(order) {
  // validate, calculate total, save to DB, send email...
}

// Good — composes small functions
function processOrder(order) {
  validateOrder(order)
  const total = calculateTotal(order)
  saveOrder(order, total)
  sendConfirmation(order)
}
```

### 3. Avoid Surprises

Functions should not have hidden side effects:

```ts
// Surprising — modifies the argument
function addToCart(cart, item) {
  cart.items.push(item)
  return cart
}

// Expected — returns a new value
function addToCart(cart, item) {
  return { ...cart, items: [...cart.items, item] }
}
```

### 4. Comments Explain Why, Not What

```ts
// Bad — restates the code
// Increment counter by 1
counter++

// Good — explains the reason
// Reset counter at midnight for daily quota
counter = 0
```

---

Clean code is a **practice**, not a destination. Every PR is an opportunity to leave the codebase better than you found it.
