import { useState } from 'react';
import { ScrollText, Search } from 'lucide-react';
import useAsync from '../../hooks/useAsync.js';
import dashboardService from '../../services/dashboardService.js';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Input, Select } from '../../components/FormControls.jsx';
import { TableSkeleton } from '../../components/LoadingSkeleton.jsx';
import { EmptyState, ErrorState } from '../../components/EmptyState.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { formatDateTime } from '../../utils/formatters.js';

const ENTITY_TYPES = ['Complaint', 'User', 'Category', 'Auth'];

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ action: '', entityType: '' });

  const { data, loading, error, reload } = useAsync(
    () => dashboardService.auditLogs({ page, limit: 20, action: filters.action || undefined, entityType: filters.entityType || undefined }),
    [page, filters.action, filters.entityType]
  );

  const set = (key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="A trail of every significant action in the system." />

      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <Input className="pl-9" placeholder="Filter by action, e.g. complaint.status" value={filters.action} onChange={(e) => set('action', e.target.value)} />
        </div>
        <Select value={filters.entityType} onChange={(e) => set('entityType', e.target.value)}>
          <option value="">All entity types</option>
          {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={10} cols={5} />
        ) : error ? (
          <div className="p-6"><ErrorState message="Could not load audit logs" onRetry={reload} /></div>
        ) : data.items.length === 0 ? (
          <div className="p-6"><EmptyState icon={ScrollText} title="No audit entries" message="Actions will be recorded here as users interact with the system." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-navy-50/70">
                <tr>
                  <th className="table-th">When</th>
                  <th className="table-th">Actor</th>
                  <th className="table-th">Action</th>
                  <th className="table-th">Entity</th>
                  <th className="table-th">Description</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log) => (
                  <tr key={log._id} className="border-b border-navy-50">
                    <td className="table-td whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                    <td className="table-td">
                      {log.actor ? (
                        <span className="text-navy-700">{log.actor.name} <span className="text-xs text-navy-400">({log.actorRole || log.actor.role})</span></span>
                      ) : (
                        <span className="text-navy-400">System</span>
                      )}
                    </td>
                    <td className="table-td"><span className="badge bg-navy-50 text-navy-700">{log.action}</span></td>
                    <td className="table-td">{log.entityType}</td>
                    <td className="table-td max-w-md">{log.description}</td>
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
