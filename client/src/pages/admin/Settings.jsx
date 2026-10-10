import { Server, ShieldCheck, Database, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { ROLE_LABELS } from '../../utils/roles.js';
import { formatDateTime } from '../../utils/formatters.js';

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-navy-50 py-3 last:border-0">
      <span className="text-sm text-navy-500">{label}</span>
      <span className="text-sm font-medium text-navy-800">{value}</span>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';

  const items = [
    { icon: Server, title: 'Application', rows: [
      ['Environment', import.meta.env.MODE],
      ['API base URL', apiBase],
      ['Auth method', 'JWT (HTTP-only cookie)'],
      ['CSRF protection', 'Double-submit token'],
    ] },
    { icon: ShieldCheck, title: 'Your session', rows: [
      ['Signed in as', user.name],
      ['Email', user.email],
      ['Role', ROLE_LABELS[user.role]],
      ['Last login', formatDateTime(user.lastLoginAt)],
    ] },
    { icon: Database, title: 'Data & workflow', rows: [
      ['Complaint statuses', '8 stages'],
      ['Assignment', 'Manual routing by admin'],
      ['Notifications', 'In-app'],
      ['Audit logging', 'Enabled'],
    ] },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" subtitle="System configuration and environment details." />

      <div className="space-y-6">
        {items.map((section) => (
          <div key={section.title} className="card p-6">
            <h2 className="flex items-center gap-2 font-semibold text-navy-900">
              <section.icon className="h-4 w-4 text-civic-600" /> {section.title}
            </h2>
            <div className="mt-3">
              {section.rows.map(([label, value]) => <Row key={label} label={label} value={value} />)}
            </div>
          </div>
        ))}

        <div className="card flex gap-3 border-civic-100 bg-civic-50/50 p-6">
          <Info className="h-5 w-5 shrink-0 text-civic-600" />
          <div className="text-sm text-navy-600">
            <p className="font-medium text-navy-800">Maintenance tasks</p>
            <p className="mt-1">
              Categories with existing complaints are soft-deactivated rather than deleted, preserving complaint history.
              Administrative maintenance such as seeding or resetting categories is performed through server scripts
              (<code className="rounded bg-white px-1 py-0.5 text-xs">npm run seed</code>,{' '}
              <code className="rounded bg-white px-1 py-0.5 text-xs">npm run reset-categories</code>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
