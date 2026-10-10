import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import useAsync from '../../hooks/useAsync.js';
import useDebounce from '../../hooks/useDebounce.js';
import complaintService from '../../services/complaintService.js';
import categoryService from '../../services/categoryService.js';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Input, Select } from '../../components/FormControls.jsx';
import { TableSkeleton } from '../../components/LoadingSkeleton.jsx';
import { EmptyState, ErrorState } from '../../components/EmptyState.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { ComplaintRow } from '../../components/ComplaintRow.jsx';
import { STATUS_META, PRIORITY_META } from '../../utils/constants.js';

export default function AllComplaints() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', sort: 'newest', search: '' });
  const debounced = useDebounce(filters.search);

  const { data: categories } = useAsync(() => categoryService.list(), []);
  const { data, loading, error, reload } = useAsync(
    () => complaintService.list({ page, limit: 10, ...filters, search: debounced || undefined, status: filters.status || undefined, category: filters.category || undefined, priority: filters.priority || undefined }),
    [page, filters.status, filters.category, filters.priority, filters.sort, debounced]
  );

  const set = (key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };

  return (
    <div>
      <PageHeader title="All Complaints" subtitle="Search, filter and review every complaint." />

      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <Input className="pl-9" placeholder="Search…" value={filters.search} onChange={(e) => set('search', e.target.value)} />
        </div>
        <Select value={filters.status} onChange={(e) => set('status', e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </Select>
        <Select value={filters.category} onChange={(e) => set('category', e.target.value)}>
          <option value="">All categories</option>
          {(categories || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </Select>
        <Select value={filters.priority} onChange={(e) => set('priority', e.target.value)}>
          <option value="">All priorities</option>
          {Object.entries(PRIORITY_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </Select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : error ? (
          <div className="p-6"><ErrorState message="Could not load complaints" onRetry={reload} /></div>
        ) : data.items.length === 0 ? (
          <div className="p-6"><EmptyState title="No complaints match" message="Try adjusting your filters." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
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
                  <ComplaintRow key={c._id} complaint={c} onOpen={() => navigate(`/admin/complaints/${c._id}`)} />
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
