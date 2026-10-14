# Team Contributions

**Project:** CivicConnect — Mathura-Vrindavan Municipal Corporation (MVMC) Grievance Portal
**Team size:** 4 members

> The work split is balanced so each member owns a full vertical (backend + frontend + report chapter).

## Team

| # | Member | GitHub | Role | Contribution |
|---|--------|--------|------|--------------|
| 1 | Piyush Gautam | [@piyushgautam2052007-art](https://github.com/piyushgautam2052007-art) | Authentication, Users & Security | 25% |
| 2 | Anushka Bansal | [@banushka985-beep](https://github.com/banushka985-beep) | Complaint Management & Workflow (core) | 25% |
| 3 | Pratiksha | [@Pratiksha1403m](https://github.com/Pratiksha1403m) | Categories, Notifications, Analytics & Audit | 25% |
| 4 | Pradeep Kumar | [@chpradeepkumar](https://github.com/chpradeepkumar) | Public Portal, UI/UX, Platform, Docs & Testing | 25% |

### Git author identities (GitHub no-reply emails)

| Member | Git author email |
|--------|------------------|
| Piyush Gautam | `229683628+piyushgautam2052007-art@users.noreply.github.com` |
| Anushka Bansal | `228776896+banushka985-beep@users.noreply.github.com` |
| Pratiksha | `189869393+Pratiksha1403m@users.noreply.github.com` |
| Pradeep Kumar | `196923995+chpradeepkumar@users.noreply.github.com` |

## Module Ownership

### Piyush Gautam — Authentication, Users & Security
**Backend**
- `server/src/models/User.js`
- `server/src/controllers/authController.js`, `userController.js`
- `server/src/routes/authRoutes.js`, `userRoutes.js`, `staffRoutes.js`
- `server/src/middleware/auth.js`, `csrf.js`, `rateLimiters.js`
- `server/src/validators/authValidator.js`
- `server/src/utils/jwt.js`, `cookies.js`, `generate.js`

**Frontend**
- `client/src/context/AuthContext.jsx`
- `client/src/routes/ProtectedRoute.jsx`, `PublicOnlyRoute.jsx`
- `client/src/pages/public/Login.jsx`, `Register.jsx`
- `client/src/pages/Profile.jsx`
- `client/src/pages/admin/UserManagement.jsx`, `StaffManagement.jsx`
- `client/src/services/authService.js`, `userService.js`
- `client/src/schemas/authSchemas.js`

**Report chapter:** Authentication, roles (RBAC) and security.

### Anushka Bansal — Complaint Management & Workflow (core feature)
**Backend**
- `server/src/models/Complaint.js`
- `server/src/services/complaintService.js`
- `server/src/controllers/complaintController.js`
- `server/src/routes/complaintRoutes.js`
- `server/src/validators/complaintValidator.js`
- `server/src/middleware/upload.js`
- `server/src/utils/constants.js` (status workflow)

**Frontend**
- `client/src/pages/citizen/SubmitComplaint.jsx`, `MyComplaints.jsx`, `ComplaintDetails.jsx`, `Dashboard.jsx`
- `client/src/pages/staff/Dashboard.jsx`, `AssignedComplaints.jsx`, `WorkHistory.jsx`
- `client/src/pages/admin/AllComplaints.jsx`, `Assignments.jsx`, `Overdue.jsx`
- `client/src/pages/public/TrackComplaint.jsx`
- `client/src/components/ComplaintRow.jsx`, `StatusBadge.jsx` (+ test), `Timeline.jsx`, `ImageUploader.jsx`
- `client/src/services/complaintService.js`
- `client/src/schemas/complaintSchema.js` (+ test)

**Report chapter:** Complaint lifecycle, status workflow and assignment.

### Pratiksha — Categories, Notifications, Analytics & Audit
**Backend**
- `server/src/models/Category.js`, `Notification.js`, `AuditLog.js`
- `server/src/controllers/categoryController.js`, `notificationController.js`, `dashboardController.js`
- `server/src/services/notificationService.js`, `auditService.js`
- `server/src/routes/categoryRoutes.js`, `notificationRoutes.js`, `dashboardRoutes.js`
- `server/src/validators/categoryValidator.js`
- `server/src/scripts/seed.js`, `createAdmin.js`, `resetCategories.js`

**Frontend**
- `client/src/pages/public/Categories.jsx`
- `client/src/pages/citizen/Notifications.jsx`
- `client/src/pages/admin/CategoryManagement.jsx`, `Analytics.jsx`, `AuditLogs.jsx`, `Dashboard.jsx`, `Settings.jsx`
- `client/src/components/NotificationBell.jsx`, `CategoryIcon.jsx`, `StatCard.jsx`
- `client/src/services/categoryService.js`, `notificationService.js`, `dashboardService.js`

**Report chapter:** Reference data, notifications, dashboards and audit trail.

### Pradeep Kumar — Public Portal, UI/UX, Platform, Docs & Testing
**Backend / platform**
- `server/src/app.js`, `server.js`
- `server/src/config/env.js`, `db.js`
- `server/src/middleware/error.js`, `validate.js`
- `server/src/utils/ApiError.js`, `apiResponse.js`, `asyncHandler.js`
- `server/tests/*`

**Frontend / design system**
- `client/src/main.jsx`, `App.jsx`, `index.css`, `tailwind.config.js`, `vite.config.js`
- `client/src/routes/AppRoutes.jsx`
- `client/src/layouts/PublicLayout.jsx`, `DashboardLayout.jsx`
- `client/src/components/Navbar.jsx`, `Footer.jsx`, `GovTopBar.jsx`, `Emblem.jsx`, `NoticeTicker.jsx`, `Modal.jsx`, `FormControls.jsx`, `LoadingSkeleton.jsx`, `Pagination.jsx`, `Spinner.jsx`, `PageHeader.jsx`, `EmptyState.jsx`
- `client/src/pages/public/Home.jsx`, `About.jsx`, `HowItWorks.jsx`, `Notices.jsx`, `FAQ.jsx`, `Contact.jsx`, `NotFound.jsx`
- `client/src/config/site.js`, `images.js`
- `client/src/context/UiContext.jsx`, `ToastContext.jsx`
- `client/src/hooks/useAsync.js`, `useDebounce.js`
- `client/src/utils/formatters.js` (+ test), `roles.js`

**Docs:** `README.md`, `docs/API.md`, `docs/ARCHITECTURE.md`, `PROJECT_STATUS.md`

**Report chapter:** Overall design, public site, deployment/run steps, testing.

## How to Verify (optional, using Git)

```bash
git shortlog -sne                    # commits per author
git log --author="Member Name"       # one member's commits
git blame <path/to/file>             # who last changed each line
git log --oneline -- client/src/pages/citizen   # history of a module
```

## Notes
- Rule of thumb: **one file, one primary owner**. Each member is also a *reviewer* of another member's module.
- Percentages are equal (25% each) because the split is balanced by design; adjust if your actual effort differed.
