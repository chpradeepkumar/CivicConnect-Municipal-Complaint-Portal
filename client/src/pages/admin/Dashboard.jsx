import { Link } from 'react-router-dom';
import {
  FileText, FolderOpen, CheckCircle2, AlarmClock, Users, Briefcase, Activity,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line,
  XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from 'recharts';
import useAsync from '../../hooks/useAsync.js';
import dashboardService from '../../services/dashboardService.js';
import { StatCard } from '../../components/StatCard.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { CardsSkeleton, TableSkeleton } from '../../components/LoadingSkeleton.jsx';
import { EmptyState, ErrorState } from '../../components/EmptyState.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { STATUS_META } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatters.js';

const CHART_COLORS = { submitted: '#2557eb', under_review: '#d97706', assigned: '#6366f1', in_progress: '#3b82f6', resolved: '#16a34a', closed: '#64748b', rejected: '#dc2626', reopened: '#f97316' };
const CAT_COLORS = ['#1d43d8', '#0f766e', '#b45309', '#7c3aed', '#0369a1', '#15803d', '#be123c', '#4f46e5'];

export default function AdminDashboard() {
  const { data, loading, error, reload } = useAsync(() => dashboardService.admin(), []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Admin Dashboard" subtitle="Operations overview" />
        <CardsSkeleton count={4} />
        <div className="mt-6 card"><TableSkeleton /></div>
      </div>
    );
  }
  if (error) return <ErrorState message="Could not load the dashboard" onRetry={reload} />;

  const metrics = data.metrics;
  const statusData = data.statusDistribution.map((s) => ({ name: STATUS_META[s.status]?.label || s.status, value: s.count, status: s.status }));
  const catData = data.categoryDistribution.slice(0, 6);
  const workload = data.staffWorkload.slice(0, 6).map((w) => ({ name: w.name || 'Unassigned', count: w.count, resolved: w.resolved }));

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Operations overview across the municipality"
        actions={<Link to="/admin/assignments" className="btn-primary"><FolderOpen className="h-4 w-4" /> Manage assignments</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={metrics.total} icon={FileText} variant="civic" />
        <StatCard label="Open" value={metrics.open} icon={FolderOpen} variant="amber" />
        <StatCard label="Resolved" value={metrics.resolved} icon={CheckCircle2} variant="green" hint={`${metrics.resolutionRate}% resolution rate`} />
        <StatCard label="Overdue" value={metrics.overdue} icon={AlarmClock} variant="red" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Citizens" value={metrics.citizens} icon={Users} variant="navy" />
        <StatCard label="Active staff" value={metrics.staff} icon={Briefcase} variant="slate" />
        <StatCard label="On-time rate" value={`${metrics.onTimeRate}%`} icon={CheckCircle2} variant="green" />
        <StatCard label="Open rate" value={`${metrics.total ? Math.round((metrics.open / metrics.total) * 100) : 0}%`} icon={Activity} variant="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card">
          <div className="border-b border-navy-100 px-5 py-4"><h2 className="font-semibold text-navy-900">Status distribution</h2></div>
          <div className="p-5">
            {statusData.length === 0 ? (
              <p className="py-10 text-center text-sm text-navy-400">No complaints yet</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={78} paddingAngle={2}>
                      {statusData.map((e) => <Cell key={e.status} fill={CHART_COLORS[e.status] || '#94a3b8'} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="border-b border-navy-100 px-5 py-4"><h2 className="font-semibold text-navy-900">Resolution trend</h2></div>
          <div className="p-5">
            {data.resolutionTrend.length === 0 ? (
              <p className="py-10 text-center text-sm text-navy-400">No resolutions recorded yet</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.resolutionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#1d43d8" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
            <h2 className="font-semibold text-navy-900">Recent activity</h2>
            <Link to="/admin/complaints" className="link text-sm">View all</Link>
          </div>
          {data.recent.length === 0 ? (
            <div className="p-6"><EmptyState title="No complaints yet" message="New complaints will appear here." /></div>
          ) : (
            <ul className="divide-y divide-navy-50">
              {data.recent.map((c) => (
                <li key={c._id}>
                  <Link to={`/admin/complaints/${c._id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-navy-50/60">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-navy-800">{c.title}</p>
                      <p className="text-xs text-navy-400">
                        {c.trackingCode} · {c.category?.name} · {formatDate(c.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="border-b border-navy-100 px-5 py-4"><h2 className="font-semibold text-navy-900">By category</h2></div>
            <div className="p-5">
              {catData.length === 0 ? (
                <p className="py-6 text-center text-sm text-navy-400">No data yet</p>
              ) : (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={catData} layout="vertical" margin={{ left: 10 }}>
                      <XAxis type="number" hide allowDecimals={false} />
                      <YAxis type="category" dataKey="category" width={110} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {catData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="border-b border-navy-100 px-5 py-4"><h2 className="font-semibold text-navy-900">Staff workload</h2></div>
            <div className="p-5">
              {workload.length === 0 ? (
                <p className="py-6 text-center text-sm text-navy-400">No assignments yet</p>
              ) : (
                <ul className="space-y-3">
                  {workload.map((w) => (
                    <li key={w.name} className="flex items-center justify-between text-sm">
                      <span className="truncate text-navy-600">{w.name}</span>
                      <span className="font-semibold text-navy-800">{w.count} <span className="text-xs font-normal text-green-600">({w.resolved} resolved)</span></span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
