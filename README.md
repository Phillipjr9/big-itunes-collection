# Big ITunes Collection

Premium Nigerian women’s fashion storefront + admin for **Big ITunes Collection**.

## Stack

- Vite · React · TypeScript · TanStack Router / Query / Start
- Tailwind CSS · Shadcn/ui · Framer Motion
- Blink SDK (project wired; catalog/orders currently local-first)

## Features

### Storefront
- Home, shop with filters/search, product detail pages
- Cart with size + stock checks (persisted in `localStorage`)
- Wishlist, checkout, order confirmation
- Newsletter signup (stored locally)
- Size guide, delivery, returns, contact, FAQs

### Admin (`/app`)
- PIN login (demo: `itunes2026`)
- Dashboard metrics
- Products CRUD (create/edit, active flag, barcodes)
- Orders + status workflow
- Inventory by size with reorder-point warnings

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Data note

Products, cart, wishlist, orders, and subscribers persist in the browser (`localStorage` keys prefixed `bic_`). Stock decreases when orders are placed. Swap the context layer for Blink database tables when you are ready for multi-device production data.

## Admin PIN

Default demo PIN: **`itunes2026`** (change in `src/context/ShopContext.tsx`).
