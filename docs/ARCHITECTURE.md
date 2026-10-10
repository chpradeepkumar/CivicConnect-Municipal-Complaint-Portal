# Architecture & Security

## Overview

CivicConnect is a classic three-tier MERN application delivered as an npm workspace monorepo:

```
React SPA (Vite)  ──HTTP/JSON──▶  Express REST API  ──Mongoose──▶  MongoDB
      client/                          server/                     (civicconnect_portal)
```

## Backend

Request flow: `server.js → app.js → routes → middleware (auth/validate/upload) → controller → service/model → response envelope`.

- **Config** (`src/config`) centralizes environment loading and the Mongoose connection.
- **Routes** expose a versioned API under `/api/v1`. Public routes (`/complaints/track`, `/categories`, `/dashboard/public-stats`, `/auth/*`) are declared before authenticated guards.
- **Controllers** are thin; shared workflow logic lives in **services** (`complaintService`, `notificationService`, `auditService`).
- **Models** — `User`, `Category`, `Complaint`, `Notification`, `AuditLog`. All use `mongoose.models.X || mongoose.model(...)` to avoid recompilation errors during hot reload/tests.
- **Responses** always use `sendSuccess` / paginated `meta` built by `buildPaginationMeta`.

### Complaint workflow

`STATUS_TRANSITIONS` in `src/utils/constants.js` defines the legal state machine. `applyStatusChange` appends a timestamped, optionally-public history entry and stamps `resolvedAt`/`closedAt`. Illegal transitions are rejected with `400`.

```
submitted ─┬─▶ under_review ─┬─▶ assigned ─▶ in_progress ─▶ resolved ─┬─▶ closed
           ├─▶ assigned       └─▶ rejected                          └─▶ reopened
           └─▶ rejected
```

Due dates (`dueAt`) are derived from priority (urgent 1d, high 3d, medium 5d, low 7d) and drive the overdue views.

### Role scoping

- **Citizen** — only their own complaints.
- **Staff** — only complaints assigned to them (enforced in list filters and `changeStatus`).
- **Admin** — all complaints; the only role that may assign, reject, or close.

## Frontend

- **Routing** — `routes/AppRoutes.jsx` with `ProtectedRoute` (role-gated) and `PublicOnlyRoute` (redirects logged-in users to their dashboard).
- **State** — `AuthContext` holds the session (bootstrapped from `GET /auth/me`); `ToastContext` provides notifications.
- **Data fetching** — the lightweight `useAsync` hook plus service modules wrap Axios.
- **API client** (`services/api.js`) injects the CSRF header, transparently refreshes an expired CSRF token and retries once, and emits a global 401 handler that clears the session.
- **UI** — Tailwind utility classes with a small set of shared primitives (`card`, `btn-*`, `badge`, `table-*`) and reusable components (badges, pagination, modal, empty/error states, skeletons).

## Security

| Concern | Mitigation |
|---------|-----------|
| Password storage | bcryptjs hashing with per-user salt; `password` is `select:false` and stripped in `toJSON` |
| Session transport | JWT in an HTTP-only, SameSite cookie (not accessible to JS) |
| CSRF | Double-submit cookie: `civicconnect_csrf` cookie + `X-CSRF-Token` header verified server-side |
| Authorization | `requireAuth` / `requireRole` middleware plus per-resource ownership checks |
| Input validation | Zod schemas on body/query for every mutating endpoint |
| HTTP headers | Helmet |
| Brute force | `express-rate-limit` on auth endpoints (and a general limiter) |
| Uploads | Multer with MIME/extension allow-list and size cap; access-controlled image serving |
| Query injection | User `search` input is regex-escaped before use |
| Secrets | `.env` is git-ignored; `.env.example` documents required keys |

## Testing

- **Server** — Vitest + Supertest against an in-memory MongoDB (`mongodb-memory-server`); covers auth, RBAC, complaint workflow, validation, and public tracking.
- **Client** — Vitest + jsdom + Testing Library for schemas, formatters, and components.

## Notable configuration

- API port defaults to `5050` and the database to `civicconnect_portal` to avoid colliding with other local services.
- The Vite dev server proxies `/api` and `/health` to the API so the SPA and API share an origin in development (simplifying cookie/CSRF behavior).
