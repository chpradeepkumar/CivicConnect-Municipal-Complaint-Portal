import { useState } from 'react';
import { Plus, Search, Pencil, Briefcase } from 'lucide-react';
import useAsync from '../../hooks/useAsync.js';
import useDebounce from '../../hooks/useDebounce.js';
import userService from '../../services/userService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getErrorMessage } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Field, Input, Select } from '../../components/FormControls.jsx';
import { Modal, ConfirmDialog } from '../../components/Modal.jsx';
import { TableSkeleton } from '../../components/LoadingSkeleton.jsx';
import { EmptyState, ErrorState } from '../../components/EmptyState.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { ROLES } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatters.js';

const DEPARTMENTS = ['Public Works', 'Sanitation', 'Electricity', 'Water Supply', 'Parks & Trees', 'Traffic', 'General'];
const emptyForm = { name: '', email: '', password: '', role: ROLES.STAFF, phone: '', department: 'General' };

export default function StaffManagement() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [removing, setRemoving] = useState(null);
  const [working, setWorking] = useState(false);

  const { data, loading, error, reload } = useAsync(
    () => userService.list({ page, limit: 10, role: ROLES.STAFF, search: debounced || undefined }),
    [page, debounced]
  );

  const openCreate = () => { setForm(emptyForm); setEditing('create'); setErrors({}); };
  const openEdit = (s) => {
    setForm({ name: s.name, email: s.email, password: '', role: ROLES.STAFF, phone: s.phone || '', department: s.department || 'General' });
    setEditing(s);
    setErrors({});
  };

  const save = async () => {
    const nextErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) nextErrors.name = 'Name is required';
    if (editing === 'create') {
      if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Valid email required';
      if ((form.password || '').length < 8) nextErrors.password = 'At least 8 characters';
    }
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    setSaving(true);
    try {
      if (editing === 'create') {
        await userService.create({ ...form, role: ROLES.STAFF });
        toast.success('Staff member added');
      } else {
        await userService.update(editing._id, { name: form.name, phone: form.phone, department: form.department });
        toast.success('Staff member updated');
      }
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    setWorking(true);
    try {
      await userService.update(removing._id, { isActive: !removing.isActive });
      toast.success(removing.isActive ? 'Staff deactivated' : 'Staff reactivated');
      setRemoving(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setWorking(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Staff Management"
        subtitle="Manage municipal staff and their departments."
        actions={<button className="btn-primary" onClick={openCreate}><Plus className="h-4 w-4" /> Add staff</button>}
      />

      <div className="card mb-4 p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <Input className="pl-9" placeholder="Search staff by name, email or department" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : error ? (
          <div className="p-6"><ErrorState message="Could not load staff" onRetry={reload} /></div>
        ) : data.items.length === 0 ? (
          <div className="p-6"><EmptyState icon={Briefcase} title="No staff found" message="Add your first staff member to start assigning complaints." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-navy-50/70">
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Phone</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Joined</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((s) => (
                  <tr key={s._id} className="border-b border-navy-50 hover:bg-navy-50/60">
                    <td className="table-td font-medium text-navy-800">{s.name}</td>
                    <td className="table-td">{s.email}</td>
                    <td className="table-td">{s.department || '—'}</td>
                    <td className="table-td">{s.phone || '—'}</td>
                    <td className="table-td">
                      <span className={`badge ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-td">{formatDate(s.createdAt)}</td>
                    <td className="table-td">
                      <div className="flex justify-end gap-1">
                        <button className="btn-ghost px-2 py-1.5" onClick={() => openEdit(s)} title="Edit"><Pencil className="h-4 w-4" /></button>
                        <button className="btn-ghost px-2 py-1.5 text-amber-700" onClick={() => setRemoving(s)}>
                          {s.isActive ? 'Deactivate' : 'Activate'}
                        </button>
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
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'create' ? 'Add staff member' : 'Edit staff member'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Full name" error={errors.name} required>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
          </Field>
          <Field label="Email" error={errors.email} required>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} disabled={editing !== 'create'} />
          </Field>
          {editing === 'create' ? (
            <Field label="Temporary password" error={errors.password} required hint="Minimum 8 characters">
              <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password} />
            </Field>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Department">
              <Select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={toggleActive}
        loading={working}
        title={removing?.isActive ? 'Deactivate staff' : 'Reactivate staff'}
        confirmLabel={removing?.isActive ? 'Deactivate' : 'Activate'}
        message={removing?.isActive
          ? `${removing?.name} will no longer be able to sign in or receive assignments. Continue?`
          : `Reactivate ${removing?.name}'s account?`}
      />
    </div>
  );
}
