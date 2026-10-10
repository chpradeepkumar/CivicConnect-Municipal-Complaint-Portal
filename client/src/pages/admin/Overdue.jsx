import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlarmClock, CalendarX2 } from 'lucide-react';
import useAsync from '../../hooks/useAsync.js';
import complaintService from '../../services/complaintService.js';
import { PageHeader } from '../../components/PageHeader.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { TableSkeleton } from '../../components/LoadingSkeleton.jsx';
import { EmptyState, ErrorState } from '../../components/EmptyState.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';

const CLOSED = ['resolved', 'closed', 'rejected'];
const PER_PAGE = 10;

function daysOverdue(dueAt) {
  return Math.max(1, Math.floor((Date.now() - new Date(dueAt).getTime()) / 86400000));
}

export default function Overdue() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAsync(
    () => complaintService.list({ limit: 100, sort: 'priority' }),
    []
  );

  const list = (data?.items || [])
    .filter((c) => c.dueAt && !CLOSED.includes(c.status) && new Date(c.dueAt) < new Date())
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const paged = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const meta = { page, limit: PER_PAGE, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
  const urgent = list.filter((c) => c.priority === 'urgent').length;

  return (
    <div>
      <PageHeader title="Overdue Complaints" subtitle="Complaints past their due date that still need action." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Overdue" value={total} icon={AlarmClock} variant="red" />
        <StatCard label="Urgent & overdue" value={urgent} icon={CalendarX2} variant="amber" />
        <StatCard label="Unassigned overdue" value={list.filter((c) => !c.assignedTo).length} icon={AlarmClock} variant="slate" />
      </div>

      <div className="card mt-6 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : error ? (
          <div className="p-6"><ErrorState message="Could not load overdue complaints" onRetry={reload} /></div>
        ) : total === 0 ? (
          <div className="p-6"><EmptyState icon={AlarmClock} title="Nothing overdue" message="Great! There are no complaints past their due date." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-navy-50/70">
                <tr>
                  <th className="table-th">Tracking</th>
                  <th className="table-th">Title</th>
                  <th className="table-th">Assigned to</th>
                  <th className="table-th">Priority</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Due</th>
                  <th className="table-th">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((c) => (
                  <tr key={c._id} className="cursor-pointer border-b border-navy-50 hover:bg-navy-50/60" onClick={() => navigate(`/admin/complaints/${c._id}`)}>
                    <td className="table-td font-semibold text-navy-900">{c.trackingCode}</td>
                    <td className="table-td max-w-xs truncate">{c.title}</td>
                    <td className="table-td">{c.assignedTo?.name || <span className="text-navy-400">Unassigned</span>}</td>
                    <td className="table-td"><PriorityBadge priority={c.priority} /></td>
                    <td className="table-td"><StatusBadge status={c.status} /></td>
                    <td className="table-td">{formatDate(c.dueAt)}</td>
                    <td className="table-td"><span className="badge bg-red-100 text-red-800">{daysOverdue(c.dueAt)}d</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
