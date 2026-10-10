import { Link } from 'react-router-dom';
import { ClipboardList, Wrench, CheckCircle2, AlarmClock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useAsync from '../../hooks/useAsync.js';
import dashboardService from '../../services/dashboardService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { CardsSkeleton, TableSkeleton } from '../../components/LoadingSkeleton.jsx';
import { EmptyState, ErrorState } from '../../components/EmptyState.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { STATUS_META } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatters.js';
import CategoryIcon from '../../components/CategoryIcon.jsx';

const CHART_COLORS = { submitted: '#2557eb', under_review: '#d97706', assigned: '#6366f1', in_progress: '#3b82f6', resolved: '#16a34a', closed: '#64748b', rejected: '#dc2626', reopened: '#f97316' };

export default function StaffDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => dashboardService.staff(), []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Staff Dashboard" subtitle={`Welcome back, ${user.name.split(' ')[0]}`} />
        <CardsSkeleton />
        <div className="mt-6 card"><TableSkeleton /></div>
      </div>
    );
  }
  if (error) return <ErrorState message="Could not load your dashboard" onRetry={reload} />;

  const chartData = data.statusDistribution.map((s) => ({ name: STATUS_META[s.status]?.label || s.status, value: s.count, status: s.status }));
  const jobs = data.recent;

  return (
    <div>
      <PageHeader
        title="Staff Dashboard"
        subtitle={`Welcome back, ${user.name.split(' ')[0]}`}
        actions={<Link to="/staff/complaints" className="btn-primary"><ClipboardList className="h-4 w-4" /> My assigned work</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned" value={data.metrics.assigned} icon={ClipboardList} variant="civic" />
        <StatCard label="In progress" value={data.metrics.inProgress} icon={Wrench} variant="navy" />
        <StatCard label="Resolved" value={data.metrics.resolved} icon={CheckCircle2} variant="green" />
        <StatCard label="Overdue" value={data.metrics.overdue} icon={AlarmClock} variant="red" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
            <h2 className="font-semibold text-navy-900">Recent assigned complaints</h2>
            <Link to="/staff/complaints" className="link text-sm">View all</Link>
          </div>
          {jobs.length === 0 ? (
            <div className="p-6"><EmptyState title="No assigned complaints" message="New work assigned to you will appear here." /></div>
          ) : (
            <ul className="divide-y divide-navy-50">
              {jobs.map((c) => (
                <li key={c._id}>
                  <Link to={`/staff/complaints/${c._id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-navy-50/60">
                    <div className="flex min-w-0 items-center gap-3">
                      <CategoryIcon name={c.category?.icon} className="h-5 w-5 shrink-0 text-civic-600" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-navy-800">{c.title}</p>
                        <p className="text-xs text-navy-400">{c.trackingCode} · {formatDate(c.createdAt)}</p>
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="border-b border-navy-100 px-5 py-4"><h2 className="font-semibold text-navy-900">Workload by status</h2></div>
          <div className="p-5">
            {chartData.length === 0 ? (
              <p className="py-10 text-center text-sm text-navy-400">No data yet</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry) => <Cell key={entry.status} fill={CHART_COLORS[entry.status] || '#94a3b8'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
