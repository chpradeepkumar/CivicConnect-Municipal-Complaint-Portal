import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
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

export default function MyComplaints() {
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
      <PageHeader
        title="My Complaints"
        subtitle="Every issue you have reported, with live status."
        actions={<Link to="/citizen/submit" className="btn-primary"><PlusCircle className="h-4 w-4" /> New complaint</Link>}
      />

      <div className="card mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <Input
            className="pl-9"
            placeholder="Search by title, address or tracking code"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            aria-label="Search complaints"
          />
        </div>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
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
          <div className="p-6"><ErrorState message="Could not load your complaints" onRetry={reload} /></div>
        ) : data.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No complaints found"
              message={search || status ? 'Try adjusting your filters.' : 'You have not reported any issues yet.'}
              action={<Link to="/citizen/submit" className="btn-primary mt-2">Report an issue</Link>}
            />
          </div>
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
                  <ComplaintRow key={c._id} complaint={c} onOpen={() => navigate(`/citizen/complaints/${c._id}`)} />
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
