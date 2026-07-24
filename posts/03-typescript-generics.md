---
title: Understanding TypeScript Generics
subtitle: Write Flexible, Type-Safe Code
summary: Generics are one of TypeScript's most powerful features. Let's demystify them with practical examples.
date: 2026-07-15
tags:
  - TypeScript
status: publish
---

## What Are Generics?

Generics allow you to write **reusable** code that works with any type while maintaining type safety.

### A Simple Example

```ts
function identity<T>(value: T): T {
  return value
}

const num = identity(42)       // type: number
const str = identity('hello')  // type: string
```

The `<T>` is a **type variable** — it captures the type the caller provides.

### Generic Constraints

Sometimes you want to restrict what types can be used:

```ts
interface HasLength {
  length: number
}

function logLength<T extends HasLength>(item: T): T {
  console.log(item.length)
  return item
}

logLength('hello')   // OK: string has .length
logLength([1, 2, 3]) // OK: array has .length
logLength(42)        // Error: number doesn't have .length
```

### Real-World Use Case

```ts
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url)
  return response.json()
}

// Usage
interface User {
  id: number
  name: string
}

const user = await fetchData<User>('/api/user/1')
// user is typed as User!
```

### Key Takeaways

- Use generics to **reduce duplication** while keeping type safety
- Add **constraints** (`extends`) to limit what types are accepted
- Generics compose well with **utility types** like `Partial<T>`, `Pick<T>`, etc.

Generics turn TypeScript from a simple type checker into a powerful **type-level programming language**.
