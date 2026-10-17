# Kain & Kebaya

Kain & Kebaya is a Nusantara fashion storefront and admin dashboard built with React 19, TanStack Start/Router, Tailwind CSS, TanStack Query, Better Auth, and Zod-validated server functions.

## Run locally

```bash
npm install
npm run dev
```

Configure `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` in `.env.local`. Open `/setup` to create the first administrator and initialize the sample product catalog, then sign in at `/demo/better-auth`.

## Application architecture

```text
src/
  components/storefront/   Shared product artwork and cart state/drawer
  integrations/better-auth Better Auth client and account controls
  lib/db.ts                In-memory product, customer, role, and order models
  lib/server/              Authenticated and validated TanStack server functions
  routes/                  File-based public storefront, checkout, and admin pages
```

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Brand landing page, category links, and featured products |
| `/products` | Public | Searchable, filterable product catalog |
| `/product/$productId` | Public | Product detail, size selection, and add-to-cart |
| `/checkout` | Customer session | Shipping details and order submission |
| `/demo/better-auth` | Public | Better Auth sign-in and customer registration |
| `/setup` | Public, one-time setup | Create the initial admin and seed catalog |
| `/dashboard` | Admin | Product CRUD, stock/order summary, and catalog seed action |
| `/products/new` | Admin | Create a categorized product |
| `/products/$productId` | Admin | Edit or delete a product |
| `/users` | Admin | Manage customer/admin roles |

## Data and authorization

- Better Auth manages sign-in and sessions. Users default to the `customer` role; `/setup` promotes the initial account to `admin`.
- Server functions in `src/lib/server/products.ts` validate product input with Zod and require admin authorization for mutations. Public catalog/detail functions expose only product records.
- `src/lib/server/orders.ts` revalidates product IDs, sizes, and current stock during checkout, calculates prices from server-side product data, reserves stock, and stores a pending order.
- The cart is held in client-side React state. It is cleared after a successful checkout.
- Product data, user roles, sessions, and orders currently live in memory. They are lost on a process restart and are not shared across Vercel serverless instances. Add a persistent database before production use.
- Checkout records a payment preference but does not charge the customer. There is no payment gateway or shipping-rate integration yet.
- Products may have a high-resolution image URL; when no URL is configured, the catalog uses category artwork.

## Useful commands

```bash
npm run generate-routes
npx tsc --noEmit
npx biome check src
npm run build
```
