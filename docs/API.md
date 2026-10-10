# CivicConnect API Reference

Base URL: `/api/v1`

All responses are JSON using a consistent envelope:

```jsonc
// success
{ "success": true, "message": "optional", "data": { }, "meta": { } }

// error
{ "success": false, "message": "Human readable error", "details": [ { "field": "email", "message": "Invalid email" } ] }
```

## Authentication & CSRF

- Auth uses a JWT stored in the HTTP-only cookie `civicconnect_token`.
- Any state-changing request (`POST` / `PUT` / `PATCH` / `DELETE`) must include the CSRF token in the `X-CSRF-Token` header. Fetch one with `GET /auth/csrf`; the value is also set in the `civicconnect_csrf` cookie.
- The SPA does this automatically in `client/src/services/api.js`.

Roles: `citizen`, `staff`, `admin`.

## Auth

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/auth/csrf` | public | Issue a CSRF token (sets cookie) |
| POST | `/auth/register` | public | Register a citizen. Body: `name, email, password, phone?, address?` |
| POST | `/auth/login` | public | Log in. Body: `email, password` |
| POST | `/auth/logout` | public | Clear the auth cookie |
| GET | `/auth/me` | auth | Current user |

## Users

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/users/me` | auth | Current profile |
| PATCH | `/users/me` | auth | Update own `name, phone, address` |
| PATCH | `/users/me/password` | auth | Change password. Body: `currentPassword, newPassword` |
| GET | `/users` | admin | List users. Query: `page, limit, role, isActive, search` |
| POST | `/users` | admin | Create user. Body: `name, email, password, role, phone?, department?` |
| GET | `/users/:id` | admin | Fetch a user |
| PATCH | `/users/:id` | admin | Update `name, phone, address, department, role, isActive` |

## Staff

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/staff` | admin | List active staff. Query: `page, limit, search` |

## Complaints

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/complaints/track/:trackingCode` | public | Privacy-preserving public tracking |
| GET | `/complaints/images/:filename` | auth | Serve a complaint image (owner/staff/admin only) |
| POST | `/complaints` | citizen | Create complaint (multipart). Fields: `title, description, category, address, priority?, latitude?, longitude?, images[]` |
| GET | `/complaints` | auth | List complaints (scoped by role). Query: `page, limit, status, category, priority, assignedTo, search, sort` (`sort` = `newest\|oldest\|updated\|priority`) |
| GET | `/complaints/:id` | auth | Complaint detail |
| GET | `/complaints/:id/history` | auth | Status history / timeline |
| PATCH | `/complaints/:id` | owner/admin | Edit `title, description, category, address, priority` |
| POST | `/complaints/:id/reopen` | owner/admin | Reopen. Body: `reason` |
| POST | `/complaints/:id/assign` | admin | Assign. Body: `staffId, note?` |
| PATCH | `/complaints/:id/status` | admin/staff | Change status (multipart). Body: `status, note?, resolutionNotes?, isPublic?, images[]?` |
| POST | `/complaints/:id/reject` | admin | Reject. Body: `reason` |

## Categories

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/categories` | public | List categories (admins also see inactive). Adds `complaintCount` |
| GET | `/categories/:id` | public | Fetch a category |
| POST | `/categories` | admin | Create. Body: `name, description?, icon?, colorHex?, defaultDepartment?, defaultPriority?` |
| PATCH | `/categories/:id` | admin | Update any category field |
| DELETE | `/categories/:id` | admin | Delete, or deactivate if complaints reference it |

## Notifications

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/notifications` | auth | List own notifications. Query: `page, limit` |
| GET | `/notifications/unread-count` | auth | Unread count |
| PATCH | `/notifications/read-all` | auth | Mark all as read |
| PATCH | `/notifications/:id/read` | auth | Mark one as read |

## Dashboard & Audit

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/dashboard/public-stats` | public | Totals + category distribution |
| GET | `/dashboard/citizen` | citizen | Metrics, recent, distributions |
| GET | `/dashboard/staff` | staff | Assigned/in-progress/resolved/overdue metrics |
| GET | `/dashboard/admin` | admin | Full operations metrics, trends, staff workload |
| GET | `/dashboard/audit-logs` | admin | Audit trail. Query: `page, limit, action, entityType, actor` |

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation / bad request |
| 401 | Not authenticated |
| 403 | Forbidden (role / ownership / CSRF) |
| 404 | Not found |
| 409 | Conflict (e.g. duplicate email/category) |
| 429 | Rate limited |
| 500 | Server error |
