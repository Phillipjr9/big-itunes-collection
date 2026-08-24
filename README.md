# Big ITunes Collection

Premium **Nigerian women’s fashion** e-commerce website and admin dashboard.

## Storefront

- Multi-page shop: Home, Shop (filters/sort), Product detail, Cart, Checkout, Account, Wishlist
- Feminine blush/rose design system
- ₦ Naira pricing and Nigerian state-based delivery fees
- Cart, wishlist, and orders persisted in the browser (`localStorage`)

## Admin (`admin.html`)

Demo sign-in accounts:

| Email | Password | Role |
|-------|----------|------|
| `admin@bigitunescollection.com` | `admin123` | Admin (full access) |
| `manager@bigitunescollection.com` | `manager123` | Manager |
| `staff@bigitunescollection.com` | `staff123` | Staff (upload products, inventory) |
| `viewer@bigitunescollection.com` | `viewer123` | Viewer (read-only) |

Features:

- Role-based access control (RBAC)
- Product CRUD with image upload, phone camera, webcam
- Bulk CSV product import
- Barcode / SKU field + camera barcode scan (lookup & assign)
- Orders: status updates, bulk status, status history
- Inventory: per-size stock, movements, low-stock alerts
- Automated **reorder points** and reorder queue
- Audit log of admin actions

## Run locally

Open any HTML file in a modern browser, or serve the folder:

```bash
npx serve .
# or
python -m http.server 8080
```

Then visit `http://localhost:8080` (or the port shown).

> Camera / barcode features work best on **HTTPS** or `localhost`.

## Project structure

```
├── index.html          # Homepage
├── shop.html           # Catalogue
├── product.html        # Product detail
├── cart.html / checkout.html / account.html / wishlist.html
├── admin.html          # Admin dashboard
├── css/styles.css
└── js/
    ├── data.js         # Catalogue, cart, stock helpers
    └── common.js       # Shared header/footer
```

## Note

This is a **client-side demo**. Data is stored in the browser only. For production, connect a real backend, CDN for images, and payment gateway.
