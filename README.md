# CivicConnect — Mathura-Vrindavan Municipal Corporation (MVMC)

A government-styled municipal complaint portal built on the MERN stack, branded for the **Mathura-Vrindavan Municipal Corporation, Government of Uttar Pradesh**. Citizens report civic issues (potholes, garbage, streetlights, water, drainage, property damage), staff resolve assigned work, and administrators route complaints, manage users, and monitor analytics.

> **Disclaimer:** This is a demonstration project for a mini-project. It is not affiliated with the Mathura-Vrindavan Municipal Corporation or the Government of Uttar Pradesh. All contact details, helplines, notices and officer names shown are illustrative.

## Features

- **Public** — government landing page with live statistics, a scrolling notices ticker, category browser, public notices, FAQ, contact/helpline page, and private complaint tracking by tracking code. Bilingual (English/हिंदी) with font-size controls.
- **Accessibility** — skip-to-content links, semantic landmarks, and a printable complaint acknowledgement receipt.
- **Citizen** — register/login, submit complaints with photos + optional geolocation, track status and a public timeline, receive in-app notifications, reopen resolved issues, manage profile.
- **Staff** — dashboard with workload metrics, assigned complaint queue, status updates with resolution notes/photos, work history.
- **Admin** — operations dashboard, all-complaint search/filter, assignment management, user & staff management, category management, analytics, overdue tracking, audit logs.
- **Platform** — JWT auth in HTTP-only cookies, CSRF double-submit protection, role-based access control, rate limiting, request validation with Zod, file uploads with Multer, notifications, and audit logging.

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, Vite 5, React Router 6, Tailwind CSS 3, Axios, Recharts, Lucide, Zod |
| Backend   | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, Zod, Helmet, express-rate-limit, Multer |
| Database  | MongoDB |
| Testing   | Vitest, Supertest, mongodb-memory-server, Testing Library |

## Project Structure

```
civic connect mini project/
├─ server/                 REST API
│  ├─ src/
│  │  ├─ config/           env + database connection
│  │  ├─ controllers/      request handlers
│  │  ├─ middleware/       auth, csrf, validate, error, upload, rate limits
│  │  ├─ models/           User, Category, Complaint, Notification, AuditLog
│  │  ├─ routes/           versioned API routes
│  │  ├─ services/         complaint workflow, notifications, audit
│  │  ├─ utils/            ApiError, constants, cookies, jwt, responses
│  │  ├─ validators/       Zod schemas
│  │  ├─ scripts/          seed, create-admin, reset-categories
│  │  ├─ app.js            Express app
│  │  └─ server.js         bootstrap
│  └─ tests/               Vitest + Supertest integration tests
├─ client/                 React SPA
│  └─ src/
│     ├─ components/       reusable UI (Emblem, GovTopBar, Navbar, Footer, NoticeTicker, ...)
│     ├─ config/           site branding + content (SITE, HELPLINES, NOTICES, FAQS, translations)
│     ├─ context/          Auth, Toast, Ui (language + font size)
│     ├─ hooks/            useAsync, useDebounce
│     ├─ layouts/          Public, Dashboard
│     ├─ pages/            public (home/about/notices/faq/contact/track), citizen, staff, admin
│     ├─ routes/           route table + guards
│     ├─ schemas/          client-side Zod schemas
│     ├─ services/         Axios API clients
│     └─ utils/            constants, formatters, roles
├─ docs/                   API + architecture documentation
└─ package.json            npm workspaces root
```

## Prerequisites

- Node.js >= 18.18 (developed on Node 24)
- npm 9+
- A running MongoDB instance (local `mongodb://127.0.0.1:27017` or Atlas)

## Getting Started

```bash
# 1. Install all workspace dependencies
npm install

# 2. Configure the server environment
copy server\.env.example server\.env      # then edit values (MONGODB_URI, JWT_SECRET, ...)

# 3. Seed categories + demo accounts + sample complaints
npm run seed

# 4. Run API and SPA together (Vite proxies /api to the API)
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5050/api/v1

### Environment Variables

**server/.env**

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5050`) |
| `API_PREFIX` | API base path (default `/api/v1`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Token signing secret and lifetime |
| `COOKIE_NAME` / `COOKIE_SECRET` | Auth cookie config |
| `CSRF_COOKIE_NAME` | CSRF cookie name |
| `COOKIE_SECURE` / `COOKIE_SAME_SITE` | Cookie security flags |
| `CLIENT_ORIGIN` | Allowed CORS origin (default `http://localhost:5173`) |
| `UPLOAD_DIR` / `MAX_UPLOAD_MB` | Upload storage and size limit |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstrap admin for `npm run create-admin` |

**client/.env**

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | API base path (default `/api/v1`) |
| `VITE_API_PROXY_TARGET` | Dev proxy target (default `http://localhost:5050`) |

## Demo Accounts

Created by `npm run seed` (password for all: `Passw0rd!`):

| Role    | Email |
|---------|-------|
| Admin   | `admin@civicconnect.local` |
| Staff   | `staff@civicconnect.local` |
| Citizen | `citizen@civicconnect.local` |

> Change these credentials before any real deployment.

## Scripts

Run from the repository root:

| Command | Purpose |
|---------|---------|
| `npm run dev` | Run API + client concurrently |
| `npm run dev:server` / `npm run dev:client` | Run one side only |
| `npm run build` | Build the client for production |
| `npm start` | Start the API (production mode) |
| `npm run lint` | ESLint across both workspaces |
| `npm test` | Vitest across both workspaces |
| `npm run test:server` | Server integration tests |
| `npm run seed` | Seed reference data and demo accounts |
| `npm run create-admin` | Create/promote the bootstrap admin |

## Testing

```bash
npm test                      # everything
npm run test:server           # 24 integration tests (in-memory MongoDB)
npm run test -w client        # 11 unit/component tests
```

## Complaint Status Workflow

```
submitted ─┬─> under_review ─┬─> assigned ─> in_progress ─> resolved ─┬─> closed
           ├─> assigned       └─> rejected                            └─> reopened
           └─> rejected
```

Transitions are validated server-side; only valid moves are accepted. Resolved/closed/rejected complaints may be reopened.

## Branding & Content

Municipal identity, contact details, helplines, notices, FAQs and the English/Hindi UI strings live in one place — `client/src/config/site.js` (`SITE`, `HELPLINES`, `NOTICES`, `FAQS`, `TRANSLATIONS`, `DISCLAIMER`). Language and font-size preferences are handled by `client/src/context/UiContext.jsx` and persisted in `localStorage`.

## Documentation

- [API reference](docs/API.md)
- [Architecture & security](docs/ARCHITECTURE.md)
- [Project status](PROJECT_STATUS.md)

## License

Provided as-is for educational / demonstration purposes.
