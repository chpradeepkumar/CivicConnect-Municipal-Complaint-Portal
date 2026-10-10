import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Home } from 'lucide-react';
import { Sidebar } from '../components/Sidebar.jsx';
import { NotificationBell } from '../components/NotificationBell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { ROLE_LABELS } from '../utils/roles.js';

export function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <aside className="hidden w-64 shrink-0 bg-navy-900 lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar role={user?.role} />
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="relative h-full w-64 bg-navy-900">
            <Sidebar role={user?.role} onNavigate={() => setMobileOpen(false)} />
            <button
              className="absolute right-3 top-4 text-navy-300"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-navy-100 bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-2 text-navy-600 hover:bg-navy-50 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <p className="text-sm font-semibold text-navy-900">{ROLE_LABELS[user?.role] || 'Portal'}</p>
              <p className="hidden text-xs text-navy-400 sm:block">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="btn-ghost px-2" title="Back to site">
              <Home className="h-5 w-5" />
            </Link>
            <NotificationBell />
            <button onClick={handleLogout} className="btn-ghost px-2 text-red-600 hover:bg-red-50" title="Log out">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main key={location.pathname} id="main-content" className="min-w-0 flex-1 p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
