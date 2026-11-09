# Still & Form: Find It. Fix It. Prove It.

**Still & Form** is a small-batch home goods storefront and full-stack debugging challenge. Explore its deliberately imperfect commerce API, use the documented product, cart, and order contracts to investigate behavior, and prove fixes with automated tests.

The repository is runnable as delivered. Its automated checks describe intended behavior and are expected to report a mix of passes and failures until the challenge is completed. This document describes the intended contracts; it does not map implementation discrepancies.

## Project Objectives

- Explore a realistic React storefront backed by an Express REST API.
- Practice tracing behavior across the UI, API, and business-logic layers.
- Use focused regression tests as an executable specification.
- Exercise validation, error handling, state updates, pricing, and inventory flows.

## Technology Stack

- Frontend: React 19, Vite 6, React Router 7, Axios, CSS.
- Backend: Node.js 20.19+ and Express 5.
- Data: Seeded in-memory store; no database service is required.
- Testing: Vitest, React Testing Library, jsdom, and Supertest.

Dependencies are managed from the repository root. The client and server remain separate runtime applications.

## Architecture

```text
Browser
  React pages and components
       | Axios / JSON
       v
  Express REST API
       | services
       +-- catalog and cart operations
       +-- order orchestration
       +-- pricing and tax rules
       |
       v
  In-memory store (products, cart, orders)
```

The Vite development server listens on port 5173 and proxies `/api` requests to the API on port 3001. The API can also be started and tested independently. The store is initialized from seed data when the API process starts and is shared by requests in that process; restarting the process resets carts and orders.

## Folder Structure

```text
.
├── .env.example
├── .gitignore
├── INSTRUCTION.md
├── README.md
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       │   ├── Footer.jsx
│       │   ├── Header.jsx
│       │   └── ProductCard.jsx
│       ├── hooks/
│       │   └── CartContext.jsx
│       ├── pages/
│       │   ├── Cart.jsx
│       │   ├── Checkout.jsx
│       │   ├── Confirmation.jsx
│       │   ├── Home.jsx
│       │   ├── NotFound.jsx
│       │   ├── ProductDetail.jsx
│       │   └── Shop.jsx
│       ├── services/
│       │   └── api.js
│       ├── tests/
│       │   ├── format.test.js
│       │   ├── setup.js
│       │   └── storefront.test.jsx
│       ├── utils/
│       │   └── format.js
│       ├── main.jsx
│       └── styles.css
├── server/
│   ├── src/
│   │   ├── business/
│   │   │   ├── orderService.js
│   │   │   └── pricing.js
│   │   ├── data/
│   │   │   └── products.js
│   │   ├── services/
│   │   │   ├── cartService.js
│   │   │   └── catalogService.js
│   │   ├── app.js
│   │   └── index.js
│   └── tests/
│       ├── api.test.js
│       └── business.test.js
├── package.json
├── package-lock.json
└── vitest.config.js
```

## Responsibilities

### Frontend

- `pages/` composes the home, catalog, product detail, cart, checkout, and confirmation routes.
- `components/` contains shared navigation, footer, and product presentation.
- `hooks/CartContext.jsx` owns shared basket state and API actions.
- `services/api.js` configures the Axios client.
- `utils/format.js` contains reusable storefront formatting and presentation calculations.
- `styles.css` defines the responsive visual system and page layouts.

### Backend

- `src/index.js` loads environment configuration and starts the HTTP listener.
- `src/app.js` assembles Express middleware and REST routes; `createApp` and `createStore` support isolated tests.
- `src/data/products.js` is the sample catalog.
- `src/services/` owns catalog and cart operations.
- `src/business/` owns order orchestration and price calculations.

## REST API

All endpoints are prefixed with `/api`. Request and response bodies use JSON. Prices are integer Indian rupees (INR). Unknown resources return `404`; invalid input returns `400` with an `{ "error": "..." }` body.

### Health

`GET /api/health`

```json
{ "status": "ok" }
```

Returns `200` when the API process is available.

### Products

`GET /api/products`

Optional query parameters:

| Parameter | Meaning |
| --- | --- |
| `q` | Case-insensitive match against product name or description. |
| `category` | Exact category filter. Combines with `q`. |
| `sort` | `featured` (default), `price-asc`, `price-desc`, or `rating`. |
| `page` | 1-based page number; defaults to `1`. |
| `limit` | Page size from 1 to 50; defaults to `12`. |

A successful response is `200`:

```json
{
  "products": [
    {
      "id": "arc-mug",
      "name": "Arc Ceramic Mug",
      "category": "Tableware",
      "price": 680,
      "compareAtPrice": 840,
      "stock": 18,
      "rating": 4.8,
      "reviewCount": 42,
      "color": "Chalk",
      "description": "A quietly sculptural everyday mug...",
      "image": "https://example.test/arc-mug.jpg",
      "featured": true
    }
  ],
  "page": 1,
  "pages": 1,
  "total": 1
}
```

`GET /api/products/:id` returns `200` with `{ "product": Product }`, `400` for a malformed ID, and `404` for a well-formed ID that is not in the catalog.

### Cart

`GET /api/cart` returns `200`:

```json
{
  "items": [
    {
      "productId": "arc-mug",
      "quantity": 2,
      "product": { "id": "arc-mug", "name": "Arc Ceramic Mug", "price": 680 }
    }
  ],
  "subtotal": 1360
}
```

`POST /api/cart` adds a quantity to the basket. Quantity must be a positive integer and the resulting line quantity must not exceed available stock. The body is `{ "productId": "arc-mug", "quantity": 1 }`; a successful request returns `201` and the updated cart.

`PATCH /api/cart/:productId` sets the line quantity. The body is `{ "quantity": 3 }`. A successful request returns `200` and the updated cart. The product must exist in the cart, and the requested quantity must be a positive integer within stock.

`DELETE /api/cart/:productId` removes only the requested line and returns `200` with the updated cart. A missing line returns `404`.

Cart subtotal is the sum of each product's unit price multiplied by its quantity. An empty cart is represented by `items: []` and a zero subtotal.

### Orders

`POST /api/orders` creates an order from the current cart. Customer `name`, valid `email`, and `address` are required. The optional `discountCode` accepts `WELCOME10`. Empty carts and invalid customer details return `400`; a successful order returns `201` with `{ "order": Order }`.

Request:

```json
{
  "customer": {
    "name": "Ari Shah",
    "email": "ari@example.com",
    "address": "12 Garden Lane, Pune"
  },
  "discountCode": "WELCOME10"
}
```

Response shape:

```json
{
  "order": {
    "id": "BL-0001",
    "customer": {
      "name": "Ari Shah",
      "email": "ari@example.com",
      "address": "12 Garden Lane, Pune"
    },
    "items": [
      { "productId": "arc-mug", "name": "Arc Ceramic Mug", "price": 680, "quantity": 2 }
    ],
    "subtotal": 1360,
    "discount": 136,
    "tax": 122,
    "total": 1346,
    "status": "confirmed",
    "createdAt": "2026-01-15T12:00:00.000Z"
  }
}
```

Amounts above illustrate the documented rounding rules: apply the percentage discount once to the subtotal, round to the nearest rupee, then calculate and round 10% tax on the discounted subtotal. The total is discounted subtotal plus tax. Inventory is reduced by the quantity purchased only after successful order creation, and the cart is then emptied.

`GET /api/orders/:id` returns `200` with `{ "order": Order }` or `404` when the order is unknown.

## Data Model

The in-memory store contains three collections:

- **Product**: stable slug `id`, name, category, unit price, optional comparison price, stock count, rating, review count, color, description, image URL, and featured flag.
- **Cart line**: `productId` references a Product and `quantity` is a positive integer. The product object in cart responses is resolved from the current catalog.
- **Order**: generated ID, embedded customer details, item snapshots (product ID, name, unit price, quantity), subtotal, discount, tax, total, status, and ISO creation time. Item snapshots preserve the purchase-time price and name.

There is one process-wide anonymous cart in this challenge version; there is no authentication or user table. The order embeds its customer and item snapshots, so it remains readable independently of later catalog changes.

## Business Rules

- All displayed and API prices use INR integer values.
- Cart line quantities are positive integers and cannot exceed available product stock.
- `WELCOME10` applies a 10% discount once to the subtotal.
- Tax is 10% of the discounted subtotal, rounded to the nearest rupee.
- The order total is discounted subtotal plus tax.
- Empty baskets cannot be checked out.
- A successful order decrements stock by each purchased quantity and clears the cart.

## Application Modules

- Home page with featured products and collection links.
- Product catalog with search, category filters, sort options, and paged API support.
- Product detail with stock information and quantity selection.
- Shared basket with quantity updates and item removal.
- Checkout with customer details and a discount code.
- Order confirmation with an itemized receipt.
- Health, catalog, cart, and order API resources.

## Testing Architecture

Vitest runs all suites from the repository root. Supertest exercises Express routes with a new in-memory store per API test. Business tests exercise pricing and order behavior independently. React Testing Library and jsdom cover client rendering; client math tests cover presentation calculations. Assertions describe the expected product and order behavior rather than mirroring the current result.

- `npm test` runs the full suite and returns nonzero if any assertion fails.
- `npm run test:backend` runs API and business tests.
- `npm run test:frontend` runs client tests.
- `npm run test:business` runs independent business-rule tests.
- `npm run test:watch` runs all suites in watch mode.

The test runner prints each test's actual result and Vitest's pass/fail totals. The baseline intentionally contains both passing checks and failing checks.

## Environment Variables

Copy `.env.example` to `.env` in the repository root:

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3001` | Express listening port. |
| `VITE_API_BASE_URL` | `/api` | Axios API base path used by the client. |

For local development, Vite proxies `/api` to `http://localhost:3001`. If the API runs on a different host or port, update the Vite proxy in `client/vite.config.js` or set the appropriate client API base URL.

## Important Implementation Notes

- No MongoDB server is needed. The in-memory store is intentionally lightweight and resets on API restart.
- Product images use remote Unsplash image URLs and require a network connection to load.
- Run both services for a complete experience. The client can be started independently, but API-backed views require the server.
- The API is intentionally unauthenticated and is intended for local development and debugging exercises, not production deployment.
- See [INSTRUCTION.md](INSTRUCTION.md) for installation, startup, build, and debugging commands.
