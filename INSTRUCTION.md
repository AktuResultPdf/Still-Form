# Still & Form Developer Instructions

This guide covers a clean local setup, independent client and API workflows, production compilation, and the debugging challenge's test commands.

## Prerequisites

- Node.js 20.19 or later (Node 24 is also supported).
- npm 10 or later.
- Git, if cloning the repository.
- No MongoDB installation is needed; the server uses an in-memory store.

Check versions:

```bash
node --version
npm --version
```

## Install

From the repository root:

```bash
npm install
cp .env.example .env
```

The root package manages dependencies for the frontend, backend, and test suites. There are no separate `client` or `server` install steps.

## Environment Configuration

Edit the root `.env` file as needed:

```dotenv
PORT=3001
VITE_API_BASE_URL=/api
```

`PORT` configures Express. `VITE_API_BASE_URL` configures the browser API client and is read when Vite starts or builds. Local Vite development proxies `/api` to `http://localhost:3001`. The in-memory catalog, cart, and orders are reset whenever the API process restarts.

## Start the Applications Independently

Open two terminals in the repository root.

Terminal 1, start the API with automatic Node watch mode:

```bash
npm run dev:server
```

The API listens at `http://localhost:3001`. Check it with:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/products
```

Terminal 2, start the Vite client:

```bash
npm run dev:client
```

Open `http://localhost:5173`. The client expects the API to be running so catalog, basket, and checkout requests can complete.

To run both processes from one terminal instead:

```bash
npm run dev
```

Vite and the API log their output with `web` and `api` labels; stop both with Ctrl+C.

## Build and Start

Compile the client for production:

```bash
npm run build
```

Vite writes static assets to `client/dist/`. Preview that build locally with:

```bash
npm run preview
```

Start the API without watch mode:

```bash
npm run start:server
```

The static client and Express API are independent deployment units. Configure the production web server to route `/api` to the Express process, or set `VITE_API_BASE_URL` to the deployed API base before building. The API process must remain running for the commerce flows to work.

## Test Commands

Run all frontend, backend, and business tests:

```bash
npm test
```

Run a specific test group:

```bash
npm run test:backend
npm run test:frontend
npm run test:business
```

Watch all test files while debugging:

```bash
npm run test:watch
```

Tests use Vitest. API coverage uses Supertest and an isolated in-memory store; client component tests use React Testing Library and jsdom. Vitest prints individual test results and returns a nonzero exit code when any test fails. This repository is a challenge: the baseline is expected to include failing behavior checks. A fully resolved challenge should produce exit code `0` from `npm test`.

To run one file directly:

```bash
npx vitest run server/tests/api.test.js --reporter=verbose
npx vitest run client/src/tests/format.test.js --reporter=verbose
```

## Debugging Workflow

1. Read the API contract and business rules in [README.md](README.md).
2. Start the server and client independently so browser interactions and API responses can be inspected separately.
3. Reproduce one behavior at a time in the UI or with `curl`.
4. Run its narrow test file with Vitest, inspect the assertion and stack trace, and trace the call path through the relevant client, route, service, or business module.
5. Make a focused change and rerun the narrow test before running the full suite.
6. Use browser developer tools to inspect the console, network status codes, JSON payloads, and responsive layout.

Useful API examples:

```bash
curl 'http://localhost:3001/api/products?q=mug&category=Tableware'
curl -X POST http://localhost:3001/api/cart \
  -H 'Content-Type: application/json' \
  -d '{"productId":"arc-mug","quantity":2}'
curl http://localhost:3001/api/cart
```

## Troubleshooting

- **Port already in use:** set `PORT` to a free API port. If you change the API port, update the Vite `/api` proxy in `client/vite.config.js` and restart Vite.
- **Client loads but API-backed pages fail:** confirm the API health endpoint responds and check the browser Network panel for `/api` requests.
- **`npm test` exits nonzero:** Vitest prints the failing test name, expected value, received value, and source location. Baseline failures are part of the exercise; inspect the corresponding behavior and use the documented contract as the source of truth.
- **Product photographs do not load:** images come from Unsplash and require network access. The rest of the application can still be used.
- **Unexpected cart or order state after a server restart:** this challenge uses process memory rather than persistent storage; a restart creates a fresh store.
- **Dependency or transform errors after changing packages:** run `npm install` from the repository root, then rerun the focused command.
