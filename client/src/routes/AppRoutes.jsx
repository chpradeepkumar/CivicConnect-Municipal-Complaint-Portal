import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicOnlyRoute from './PublicOnlyRoute.jsx';
import { ROLES } from '../utils/constants.js';

import Home from '../pages/public/Home.jsx';
import About from '../pages/public/About.jsx';
import HowItWorks from '../pages/public/HowItWorks.jsx';
import Categories from '../pages/public/Categories.jsx';
import TrackComplaint from '../pages/public/TrackComplaint.jsx';
import Notices from '../pages/public/Notices.jsx';
import FAQ from '../pages/public/FAQ.jsx';
import Contact from '../pages/public/Contact.jsx';
import Login from '../pages/public/Login.jsx';
import Register from '../pages/public/Register.jsx';
import NotFound from '../pages/public/NotFound.jsx';

import CitizenDashboard from '../pages/citizen/Dashboard.jsx';
import SubmitComplaint from '../pages/citizen/SubmitComplaint.jsx';
import MyComplaints from '../pages/citizen/MyComplaints.jsx';
import CitizenComplaintDetails from '../pages/citizen/ComplaintDetails.jsx';
import Notifications from '../pages/citizen/Notifications.jsx';
import Profile from '../pages/Profile.jsx';

import StaffDashboard from '../pages/staff/Dashboard.jsx';
import AssignedComplaints from '../pages/staff/AssignedComplaints.jsx';
import WorkHistory from '../pages/staff/WorkHistory.jsx';

import AdminDashboard from '../pages/admin/Dashboard.jsx';
import AllComplaints from '../pages/admin/AllComplaints.jsx';
import Assignments from '../pages/admin/Assignments.jsx';
import UserManagement from '../pages/admin/UserManagement.jsx';
import StaffManagement from '../pages/admin/StaffManagement.jsx';
import CategoryManagement from '../pages/admin/CategoryManagement.jsx';
import Analytics from '../pages/admin/Analytics.jsx';
import Overdue from '../pages/admin/Overdue.jsx';
import AuditLogs from '../pages/admin/AuditLogs.jsx';
import Settings from '../pages/admin/Settings.jsx';

function DashboardShell({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />
      <Route path="/categories" element={<PublicLayout><Categories /></PublicLayout>} />
      <Route path="/track" element={<PublicLayout><TrackComplaint /></PublicLayout>} />
      <Route path="/track/:trackingCode" element={<PublicLayout><TrackComplaint /></PublicLayout>} />
      <Route path="/notices" element={<PublicLayout><Notices /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

      {/* Auth */}
      <Route path="/login" element={<PublicOnlyRoute><PublicLayout><Login /></PublicLayout></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><PublicLayout><Register /></PublicLayout></PublicOnlyRoute>} />

      {/* Citizen */}
      <Route
        path="/citizen"
        element={
          <ProtectedRoute roles={[ROLES.CITIZEN]}>
            <DashboardShell><CitizenDashboard /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/submit"
        element={
          <ProtectedRoute roles={[ROLES.CITIZEN]}>
            <DashboardShell><SubmitComplaint /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints"
        element={
          <ProtectedRoute roles={[ROLES.CITIZEN]}>
            <DashboardShell><MyComplaints /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/complaints/:id"
        element={
          <ProtectedRoute roles={[ROLES.CITIZEN]}>
            <DashboardShell><CitizenComplaintDetails /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/notifications"
        element={
          <ProtectedRoute roles={[ROLES.CITIZEN]}>
            <DashboardShell><Notifications /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/profile"
        element={
          <ProtectedRoute roles={[ROLES.CITIZEN]}>
            <DashboardShell><Profile /></DashboardShell>
          </ProtectedRoute>
        }
      />

      {/* Staff */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={[ROLES.STAFF]}>
            <DashboardShell><StaffDashboard /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/complaints"
        element={
          <ProtectedRoute roles={[ROLES.STAFF]}>
            <DashboardShell><AssignedComplaints /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/complaints/:id"
        element={
          <ProtectedRoute roles={[ROLES.STAFF]}>
            <DashboardShell><CitizenComplaintDetails /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/history"
        element={
          <ProtectedRoute roles={[ROLES.STAFF]}>
            <DashboardShell><WorkHistory /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/profile"
        element={
          <ProtectedRoute roles={[ROLES.STAFF]}>
            <DashboardShell><Profile /></DashboardShell>
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardShell><AdminDashboard /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardShell><AllComplaints /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints/:id"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardShell><CitizenComplaintDetails /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assignments"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardShell><Assignments /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardShell><UserManagement /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardShell><StaffManagement /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardShell><CategoryManagement /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardShell><Analytics /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/overdue"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardShell><Overdue /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardShell><AuditLogs /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardShell><Settings /></DashboardShell>
          </ProtectedRoute>
        }
      />

      <Route path="/admin/profile" element={<Navigate to="/admin/settings" replace />} />
      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  );
}
