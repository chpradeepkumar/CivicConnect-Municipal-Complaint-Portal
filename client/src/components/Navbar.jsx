import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, User, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { NotificationBell } from './NotificationBell.jsx';
import { GovTopBar } from './GovTopBar.jsx';
import { Emblem } from './Emblem.jsx';
import { dashboardHome } from '../utils/roles.js';
import { SITE } from '../config/site.js';

const LINKS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/about', key: 'nav.about' },
  { to: '/categories', key: 'nav.categories' },
  { to: '/how-it-works', key: 'nav.howItWorks' },
  { to: '/notices', key: 'nav.notices' },
  { to: '/track', key: 'nav.track' },
  { to: '/faq', key: 'nav.faq' },
  { to: '/contact', key: 'nav.contact' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useUi();
  const toast = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out');
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `relative rounded-md px-3 py-2 text-sm font-semibold transition ${
      isActive ? 'text-civic-800' : 'text-navy-600 hover:text-civic-800'
    }`;

  const navUnderline = ({ isActive }) =>
    isActive
      ? 'after:absolute after:inset-x-2 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-saffron-500'
      : '';

  return (
    <header>
      <div className="gov-strip h-1" aria-hidden="true" />
      <GovTopBar />

      <div className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 shadow-sm backdrop-blur">
        {/* Masthead */}
        <div className="container-page flex items-center justify-between gap-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <Emblem className="h-12 w-12 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-bold leading-tight text-navy-900 sm:text-lg">
                {SITE.corpName}
              </span>
              <span className="block truncate text-xs text-navy-500">
                {SITE.corpNameHi} · {SITE.city}, {SITE.state}
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <>
                <NotificationBell />
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-lg border border-navy-200 px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
                    aria-expanded={menuOpen}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-civic-100 text-xs font-bold text-civic-800">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                    <span className="max-w-[8rem] truncate">{user.name}</span>
                    <ChevronDown className="h-4 w-4 text-navy-400" />
                  </button>
                  {menuOpen ? (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-navy-100 bg-white py-1 shadow-card">
                      <Link
                        to={dashboardHome(user.role)}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50"
                      >
                        <LayoutDashboard className="h-4 w-4" /> {t('action.dashboard')}
                      </Link>
                      <Link
                        to={`/${user.role}/profile`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50"
                      >
                        <User className="h-4 w-4" /> {t('action.profile')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> {t('action.logout')}
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">{t('action.login')}</Link>
                <Link to="/register" className="btn-primary">{t('action.report')}</Link>
              </>
            )}
          </div>

          <button
            className="rounded-md p-2 text-navy-600 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Primary nav */}
        <div className="hidden border-t border-navy-100 lg:block">
          <nav className="container-page flex items-center justify-between" aria-label="Main navigation">
            <div className="flex items-center gap-0.5">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `${linkClass({ isActive })} ${navUnderline({ isActive })}`}
                >
                  {t(link.key)}
                </NavLink>
              ))}
            </div>
            <Link to="/track" className="btn-primary my-2 px-4 py-1.5 text-xs">
              <Bell className="h-3.5 w-3.5" /> {t('action.report')}
            </Link>
          </nav>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-b border-navy-100 bg-white lg:hidden">
          <div className="container-page flex flex-col py-3">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={linkClass}
                onClick={() => setMobileOpen(false)}
              >
                {t(link.key)}
              </NavLink>
            ))}
            <div className="mt-2 flex gap-2 border-t border-navy-100 pt-3">
              {user ? (
                <>
                  <Link to={dashboardHome(user.role)} className="btn-secondary flex-1" onClick={() => setMobileOpen(false)}>
                    {t('action.dashboard')}
                  </Link>
                  <button className="btn-danger flex-1" onClick={handleLogout}>{t('action.logout')}</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary flex-1" onClick={() => setMobileOpen(false)}>{t('action.login')}</Link>
                  <Link to="/register" className="btn-primary flex-1" onClick={() => setMobileOpen(false)}>{t('action.register')}</Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
