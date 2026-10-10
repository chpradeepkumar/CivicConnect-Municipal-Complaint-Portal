import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, FileText, Bell, User, ClipboardList,
  History, Users, Briefcase, Tags, BarChart3, AlarmClock, ScrollText,
  Settings,
} from 'lucide-react';
import { ROLES } from '../utils/constants.js';
import { Emblem } from './Emblem.jsx';
import { SITE } from '../config/site.js';

const NAV = {
  [ROLES.CITIZEN]: [
    { to: '/citizen', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/citizen/submit', label: 'Submit Complaint', icon: PlusCircle },
    { to: '/citizen/complaints', label: 'My Complaints', icon: FileText },
    { to: '/citizen/notifications', label: 'Notifications', icon: Bell },
    { to: '/citizen/profile', label: 'Profile', icon: User },
  ],
  [ROLES.STAFF]: [
    { to: '/staff', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/staff/complaints', label: 'Assigned Complaints', icon: ClipboardList },
    { to: '/staff/history', label: 'Work History', icon: History },
    { to: '/staff/profile', label: 'Profile', icon: User },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/complaints', label: 'All Complaints', icon: FileText },
    { to: '/admin/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/staff', label: 'Staff Management', icon: Briefcase },
    { to: '/admin/categories', label: 'Categories', icon: Tags },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/overdue', label: 'Overdue Complaints', icon: AlarmClock },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ],
};

export function Sidebar({ role, onNavigate }) {
  const links = NAV[role] || [];
  return (
    <div className="flex h-full flex-col">
      <div className="gov-strip h-1" aria-hidden="true" />
      <div className="flex h-16 items-center gap-3 border-b border-navy-800 px-5">
        <Emblem className="h-9 w-9" />
        <span className="leading-tight">
          <span className="block text-sm font-bold text-white">{SITE.portalName}</span>
          <span className="block text-[10px] uppercase tracking-wide text-navy-400">{SITE.shortName} Grievance Portal</span>
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-civic-600 text-white' : 'text-navy-200 hover:bg-navy-800 hover:text-white'
              }`
            }
          >
            <link.icon className="h-4.5 w-4.5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-navy-800 p-4 text-xs text-navy-400">
        {SITE.corpName}
      </div>
    </div>
  );
}

export default Sidebar;
