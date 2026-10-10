import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History } from 'lucide-react';
import useAsync from '../../hooks/useAsync.js';
import complaintService from '../../services/complaintService.js';
import { PageHeader } from '../../components/PageHeader.jsx';
import { TableSkeleton } from '../../components/LoadingSkeleton.jsx';
import { EmptyState, ErrorState } from '../../components/EmptyState.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';

export default function WorkHistory() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAsync(
    () => complaintService.list({ page, limit: 10, status: 'resolved', sort: 'updated' }),
    [page]
  );

  return (
    <div>
      <PageHeader title="Work History" subtitle="Complaints you have resolved." />

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : error ? (
          <div className="p-6"><ErrorState message="Could not load your history" onRetry={reload} /></div>
        ) : data.items.length === 0 ? (
          <div className="p-6"><EmptyState icon={History} title="No resolved work yet" message="Resolved complaints will be listed here." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-navy-50/70">
                <tr>
                  <th className="table-th">Tracking</th>
                  <th className="table-th">Title</th>
                  <th className="table-th">Priority</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Resolved</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((c) => (
                  <tr key={c._id} className="cursor-pointer border-b border-navy-50 hover:bg-navy-50/60" onClick={() => navigate(`/staff/complaints/${c._id}`)}>
                    <td className="table-td font-semibold text-navy-900">{c.trackingCode}</td>
                    <td className="table-td max-w-xs truncate">{c.title}</td>
                    <td className="table-td"><PriorityBadge priority={c.priority} /></td>
                    <td className="table-td"><StatusBadge status={c.status} /></td>
                    <td className="table-td">{formatDate(c.resolvedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
