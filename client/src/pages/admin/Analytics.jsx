import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts';
import useAsync from '../../hooks/useAsync.js';
import dashboardService from '../../services/dashboardService.js';
import { PageHeader } from '../../components/PageHeader.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { CardsSkeleton, ChartSkeleton } from '../../components/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/EmptyState.jsx';
import { STATUS_META } from '../../utils/constants.js';
import { FileText, CheckCircle2, Percent, Gauge } from 'lucide-react';

const CHART_COLORS = { submitted: '#2557eb', under_review: '#d97706', assigned: '#6366f1', in_progress: '#3b82f6', resolved: '#16a34a', closed: '#64748b', rejected: '#dc2626', reopened: '#f97316' };
const CAT_COLORS = ['#1d43d8', '#0f766e', '#b45309', '#7c3aed', '#0369a1', '#15803d', '#be123c', '#4f46e5'];

export default function Analytics() {
  const { data, loading, error, reload } = useAsync(() => dashboardService.admin(), []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="Insights into complaint trends and performance." />
        <CardsSkeleton count={4} />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }
  if (error) return <ErrorState message="Could not load analytics" onRetry={reload} />;

  const { metrics, statusDistribution, categoryDistribution, resolutionTrend } = data;
  const statusData = statusDistribution.map((s) => ({ name: STATUS_META[s.status]?.label || s.status, value: s.count, status: s.status }));
  const catData = categoryDistribution.map((c) => ({ name: c.category, value: c.count }));

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Insights into complaint trends and performance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={metrics.total} icon={FileText} variant="civic" />
        <StatCard label="Resolved" value={metrics.resolved} icon={CheckCircle2} variant="green" />
        <StatCard label="Resolution rate" value={`${metrics.resolutionRate}%`} icon={Percent} variant="navy" />
        <StatCard label="On-time rate" value={`${metrics.onTimeRate}%`} icon={Gauge} variant="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="border-b border-navy-100 px-5 py-4"><h2 className="font-semibold text-navy-900">Status distribution</h2></div>
          <div className="p-5">
            {statusData.length === 0 ? (
              <p className="py-16 text-center text-sm text-navy-400">No data available</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                      {statusData.map((e) => <Cell key={e.status} fill={CHART_COLORS[e.status] || '#94a3b8'} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="border-b border-navy-100 px-5 py-4"><h2 className="font-semibold text-navy-900">Complaints by category</h2></div>
          <div className="p-5">
            {catData.length === 0 ? (
              <p className="py-16 text-center text-sm text-navy-400">No data available</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={catData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {catData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 card">
        <div className="border-b border-navy-100 px-5 py-4"><h2 className="font-semibold text-navy-900">Resolution trend (monthly)</h2></div>
        <div className="p-5">
          {resolutionTrend.length === 0 ? (
            <p className="py-16 text-center text-sm text-navy-400">No resolutions recorded yet</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resolutionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#1d43d8" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
