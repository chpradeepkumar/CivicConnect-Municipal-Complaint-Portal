import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import useAsync from '../../hooks/useAsync.js';
import useDebounce from '../../hooks/useDebounce.js';
import complaintService from '../../services/complaintService.js';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Input, Select } from '../../components/FormControls.jsx';
import { TableSkeleton } from '../../components/LoadingSkeleton.jsx';
import { EmptyState, ErrorState } from '../../components/EmptyState.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { ComplaintRow } from '../../components/ComplaintRow.jsx';
import { STATUS_META } from '../../utils/constants.js';

export default function AssignedComplaints() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);

  const { data, loading, error, reload } = useAsync(
    () => complaintService.list({ page, limit: 10, status: status || undefined, search: debounced || undefined }),
    [page, status, debounced]
  );

  return (
    <div>
      <PageHeader title="Assigned Complaints" subtitle="Complaints currently assigned to you." />

      <div className="card mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <Input className="pl-9" placeholder="Search assigned complaints" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_META).map(([value, meta]) => (
            <option key={value} value={value}>{meta.label}</option>
          ))}
        </Select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : error ? (
          <div className="p-6"><ErrorState message="Could not load assigned complaints" onRetry={reload} /></div>
        ) : data.items.length === 0 ? (
          <div className="p-6"><EmptyState title="Nothing assigned" message="When a complaint is assigned to you it will appear here." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-navy-50/70">
                <tr>
                  <th className="table-th">Tracking</th>
                  <th className="table-th">Title</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Priority</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((c) => (
                  <ComplaintRow key={c._id} complaint={c} onOpen={() => navigate(`/staff/complaints/${c._id}`)} />
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
