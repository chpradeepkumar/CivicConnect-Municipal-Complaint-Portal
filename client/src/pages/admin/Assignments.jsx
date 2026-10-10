import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search } from 'lucide-react';
import useAsync from '../../hooks/useAsync.js';
import useDebounce from '../../hooks/useDebounce.js';
import complaintService from '../../services/complaintService.js';
import userService from '../../services/userService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getErrorMessage } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Input, Select } from '../../components/FormControls.jsx';
import { Modal } from '../../components/Modal.jsx';
import { TableSkeleton } from '../../components/LoadingSkeleton.jsx';
import { EmptyState, ErrorState } from '../../components/EmptyState.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';

export default function Assignments() {
  const navigate = useNavigate();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [target, setTarget] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [staffId, setStaffId] = useState('');

  const { data: staff } = useAsync(() => userService.listStaff({ limit: 100 }), []);
  const { data, loading, error, reload } = useAsync(
    () => complaintService.list({ page, limit: 10, status: statusFilter || undefined, search: debounced || undefined, sort: 'oldest' }),
    [page, statusFilter, debounced]
  );

  const assign = async () => {
    setAssigning(true);
    try {
      await complaintService.assign(target._id, { staffId, note: `Assigned by administrator` });
      toast.success('Complaint assigned');
      setTarget(null);
      setStaffId('');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div>
      <PageHeader title="Assignment Management" subtitle="Route complaints to the right staff member." />

      <div className="card mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <Input className="pl-9" placeholder="Search complaints" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All unassigned-relevant</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="reopened">Reopened</option>
        </Select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : error ? (
          <div className="p-6"><ErrorState message="Could not load complaints" onRetry={reload} /></div>
        ) : data.items.length === 0 ? (
          <div className="p-6"><EmptyState title="Nothing to assign" message="No complaints match this view." /></div>
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
                  <th className="table-th">Submitted</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((c) => (
                  <tr key={c._id} className="border-b border-navy-50 hover:bg-navy-50/60">
                    <td className="table-td font-semibold text-navy-900">{c.trackingCode}</td>
                    <td className="table-td max-w-xs truncate">{c.title}</td>
                    <td className="table-td">{c.assignedTo?.name || <span className="text-navy-400">Unassigned</span>}</td>
                    <td className="table-td"><PriorityBadge priority={c.priority} /></td>
                    <td className="table-td"><StatusBadge status={c.status} /></td>
                    <td className="table-td">{formatDate(c.createdAt)}</td>
                    <td className="table-td">
                      <div className="flex justify-end gap-2">
                        <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => { setTarget(c); setStaffId(c.assignedTo?._id || ''); }}>
                          <UserPlus className="h-3.5 w-3.5" /> {c.assignedTo ? 'Reassign' : 'Assign'}
                        </button>
                        <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => navigate(`/admin/complaints/${c._id}`)}>View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title={`Assign ${target?.trackingCode || ''}`}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setTarget(null)} disabled={assigning}>Cancel</button>
            <button className="btn-primary" onClick={assign} disabled={assigning || !staffId}>{assigning ? 'Assigning…' : 'Assign'}</button>
          </>
        }
      >
        {target ? (
          <div className="space-y-3">
            <p className="text-sm text-navy-600">{target.title}</p>
            <label className="label" htmlFor="assign-staff">Staff member</label>
            <Select id="assign-staff" value={staffId} onChange={(e) => setStaffId(e.target.value)}>
              <option value="">Select staff…</option>
              {(staff?.items || []).map((s) => (
                <option key={s._id} value={s._id}>{s.name}{s.department ? ` · ${s.department}` : ''}</option>
              ))}
            </Select>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
