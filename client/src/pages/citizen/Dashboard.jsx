import { Link } from 'react-router-dom';
import { FileText, Clock, Wrench, CheckCircle2, PlusCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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

const CHART_COLORS = {
  submitted: '#2557eb', under_review: '#d97706', assigned: '#6366f1',
  in_progress: '#3b82f6', resolved: '#16a34a', closed: '#64748b',
  rejected: '#dc2626', reopened: '#f97316',
};

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => dashboardService.citizen(), []);

  if (loading) {
    return (
      <div>
        <PageHeader title={`Welcome, ${user.name.split(' ')[0]}`} subtitle="Your complaint activity at a glance" />
        <CardsSkeleton />
        <div className="mt-6 card"><TableSkeleton /></div>
      </div>
    );
  }
  if (error) return <ErrorState message="Could not load your dashboard" onRetry={reload} />;

  const metrics = data.metrics;
  const chartData = data.statusDistribution.map((s) => ({ name: STATUS_META[s.status]?.label || s.status, value: s.count, status: s.status }));

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user.name.split(' ')[0]}`}
        subtitle="Your complaint activity at a glance"
        actions={<Link to="/citizen/submit" className="btn-primary"><PlusCircle className="h-4 w-4" /> Submit Complaint</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={metrics.total} icon={FileText} variant="civic" />
        <StatCard label="Pending" value={metrics.pending} icon={Clock} variant="amber" />
        <StatCard label="In progress" value={metrics.inProgress} icon={Wrench} variant="navy" />
        <StatCard label="Resolved" value={metrics.resolved} icon={CheckCircle2} variant="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
            <h2 className="font-semibold text-navy-900">Recent complaints</h2>
            <Link to="/citizen/complaints" className="link text-sm">View all</Link>
          </div>
          {data.recent.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileText}
                title="No complaints yet"
                message="When you report an issue it will show up here."
                action={<Link to="/citizen/submit" className="btn-primary mt-2">Submit your first complaint</Link>}
              />
            </div>
          ) : (
            <ul className="divide-y divide-navy-50">
              {data.recent.map((c) => (
                <li key={c._id}>
                  <Link to={`/citizen/complaints/${c._id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-navy-50/60">
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
          <div className="border-b border-navy-100 px-5 py-4">
            <h2 className="font-semibold text-navy-900">Status breakdown</h2>
          </div>
          <div className="p-5">
            {chartData.length === 0 ? (
              <p className="py-10 text-center text-sm text-navy-400">No data yet</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {chartData.map((entry) => (
                        <Cell key={entry.status} fill={CHART_COLORS[entry.status] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <ul className="mt-4 space-y-2">
              {chartData.map((entry) => (
                <li key={entry.status} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-navy-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[entry.status] || '#94a3b8' }} />
                    {entry.name}
                  </span>
                  <span className="font-semibold text-navy-800">{entry.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
