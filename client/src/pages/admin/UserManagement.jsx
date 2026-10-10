import { useState } from 'react';
import { Plus, Search, Pencil, UserCog } from 'lucide-react';
import useAsync from '../../hooks/useAsync.js';
import useDebounce from '../../hooks/useDebounce.js';
import userService from '../../services/userService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getErrorMessage } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Field, Input, Select } from '../../components/FormControls.jsx';
import { Modal, ConfirmDialog } from '../../components/Modal.jsx';
import { TableSkeleton } from '../../components/LoadingSkeleton.jsx';
import { EmptyState, ErrorState } from '../../components/EmptyState.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { ROLES } from '../../utils/constants.js';
import { ROLE_LABELS } from '../../utils/roles.js';
import { formatDate } from '../../utils/formatters.js';

const emptyForm = { name: '', email: '', password: '', role: ROLES.CITIZEN, phone: '', department: '' };

export default function UserManagement() {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ role: '', active: '', search: '' });
  const debounced = useDebounce(filters.search);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [deactivating, setDeactivating] = useState(null);
  const [working, setWorking] = useState(false);

  const { data, loading, error, reload } = useAsync(
    () => userService.list({ page, limit: 10, role: filters.role || undefined, isActive: filters.active === '' ? undefined : filters.active, search: debounced || undefined }),
    [page, filters.role, filters.active, debounced]
  );

  const set = (key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(1); };

  const openCreate = () => { setForm(emptyForm); setEditing('create'); setErrors({}); };
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '', department: u.department || '' });
    setEditing(u);
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
        await userService.create(form);
        toast.success('User created');
      } else {
        await userService.update(editing._id, {
          name: form.name, phone: form.phone, department: form.department, role: form.role,
        });
        toast.success('User updated');
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
      await userService.update(deactivating._id, { isActive: !deactivating.isActive });
      toast.success(deactivating.isActive ? 'User deactivated' : 'User activated');
      setDeactivating(null);
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
        title="User Management"
        subtitle="Create and manage citizen, staff and admin accounts."
        actions={<button className="btn-primary" onClick={openCreate}><Plus className="h-4 w-4" /> New user</button>}
      />

      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <Input className="pl-9" placeholder="Search name or email" value={filters.search} onChange={(e) => set('search', e.target.value)} />
        </div>
        <Select value={filters.role} onChange={(e) => set('role', e.target.value)}>
          <option value="">All roles</option>
          {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </Select>
        <Select value={filters.active} onChange={(e) => set('active', e.target.value)}>
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : error ? (
          <div className="p-6"><ErrorState message="Could not load users" onRetry={reload} /></div>
        ) : data.items.length === 0 ? (
          <div className="p-6"><EmptyState icon={UserCog} title="No users found" message="Try adjusting your filters." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-navy-50/70">
                <tr>
                  <th className="table-th">Name</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Department</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Joined</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u._id} className="border-b border-navy-50 hover:bg-navy-50/60">
                    <td className="table-td font-medium text-navy-800">{u.name}</td>
                    <td className="table-td">{u.email}</td>
                    <td className="table-td">{ROLE_LABELS[u.role]}</td>
                    <td className="table-td">{u.department || '—'}</td>
                    <td className="table-td">
                      <span className={`badge ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-td">{formatDate(u.createdAt)}</td>
                    <td className="table-td">
                      <div className="flex justify-end gap-1">
                        <button className="btn-ghost px-2 py-1.5" onClick={() => openEdit(u)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        {u._id !== currentUser._id ? (
                          <button className="btn-ghost px-2 py-1.5 text-amber-700" onClick={() => setDeactivating(u)}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        ) : null}
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
        title={editing === 'create' ? 'Create user' : 'Edit user'}
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
            <Field label="Role">
              <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} disabled={editing !== 'create'}>
                {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </Select>
            </Field>
            <Field label="Department">
              <Input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
            </Field>
          </div>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deactivating)}
        onClose={() => setDeactivating(null)}
        onConfirm={toggleActive}
        loading={working}
        title={deactivating?.isActive ? 'Deactivate user' : 'Activate user'}
        confirmLabel={deactivating?.isActive ? 'Deactivate' : 'Activate'}
        message={deactivating?.isActive
          ? `Deactivating ${deactivating?.name} will prevent them from signing in. Continue?`
          : `Reactivate ${deactivating?.name}'s account?`}
      />
    </div>
  );
}
