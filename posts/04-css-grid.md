---
title: CSS Grid Layout Deep Dive
subtitle: Mastering Two-Dimensional Layouts
summary: CSS Grid is the most powerful layout system in CSS. Learn how to use it effectively for complex page layouts.
date: 2026-07-10
tags:
  - CSS
status: publish
---

## CSS Grid Fundamentals

CSS Grid Layout is a **two-dimensional** layout system — meaning it handles both columns and rows simultaneously.

### The Container

```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
}
```

### The `fr` Unit

The `fr` unit distributes available space proportionally:

- `1fr 2fr 1fr` — middle column gets twice the space
- `repeat(3, 1fr)` — three equal columns

### Named Grid Areas

```css
.layout {
  display: grid;
  grid-template-areas:
    "header  header  header"
    "sidebar content aside"
    "footer  footer  footer";
  grid-template-columns: 200px 1fr 200px;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

### Responsive Without Media Queries

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

This creates a responsive grid that automatically adjusts the number of columns based on available space — **no media queries needed**.

---

Grid pairs perfectly with Flexbox: use Grid for **page layout** and Flexbox for **component-level** alignment.
