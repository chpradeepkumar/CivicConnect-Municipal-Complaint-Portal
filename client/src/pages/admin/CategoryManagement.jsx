import { useState } from 'react';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import useAsync from '../../hooks/useAsync.js';
import categoryService from '../../services/categoryService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getErrorMessage } from '../../services/api.js';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Field, Input, Select, Textarea } from '../../components/FormControls.jsx';
import { Modal, ConfirmDialog } from '../../components/Modal.jsx';
import { CardGridSkeleton } from '../../components/LoadingSkeleton.jsx';
import { EmptyState, ErrorState } from '../../components/EmptyState.jsx';
import { CategoryIcon, CATEGORY_ICON_NAMES } from '../../components/CategoryIcon.jsx';
import { PRIORITY_META } from '../../utils/constants.js';

const emptyForm = {
  name: '', description: '', icon: 'alert-circle', colorHex: '#1d4ed8',
  defaultDepartment: 'General', defaultPriority: 'medium', isActive: true,
};

export default function CategoryManagement() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => categoryService.list(), []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [working, setWorking] = useState(false);

  const openCreate = () => { setForm(emptyForm); setEditing('create'); setErrors({}); };
  const openEdit = (c) => {
    setForm({ ...emptyForm, ...c });
    setEditing(c);
    setErrors({});
  };

  const save = async () => {
    if (!form.name.trim() || form.name.trim().length < 2) return setErrors({ name: 'Name is required' });
    if (!/^#[0-9a-fA-F]{6}$/.test(form.colorHex)) return setErrors({ colorHex: 'Use a 6-digit hex color, e.g. #1d4ed8' });
    setErrors({});
    setSaving(true);
    try {
      if (editing === 'create') {
        await categoryService.create(form);
        toast.success('Category created');
      } else {
        await categoryService.update(editing._id, form);
        toast.success('Category updated');
      }
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setWorking(true);
    try {
      const res = await categoryService.remove(removing._id);
      toast.success(res?.message || 'Category deleted');
      setRemoving(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setWorking(false);
    }
  };

  const toggleActive = (c) => categoryService.update(c._id, { isActive: !c.isActive }).then(() => { toast.success('Category updated'); reload(); }).catch((err) => toast.error(getErrorMessage(err)));

  return (
    <div>
      <PageHeader
        title="Category Management"
        subtitle="Define the issue categories citizens can report."
        actions={<button className="btn-primary" onClick={openCreate}><Plus className="h-4 w-4" /> New category</button>}
      />

      {loading ? (
        <CardGridSkeleton />
      ) : error ? (
        <ErrorState message="Could not load categories" onRetry={reload} />
      ) : data.length === 0 ? (
        <EmptyState icon={Layers} title="No categories" message="Create your first category to let citizens report issues." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <div key={c._id} className={`card p-5 ${c.isActive ? '' : 'opacity-60'}`}>
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${c.colorHex}1a`, color: c.colorHex }}>
                  <CategoryIcon name={c.icon} className="h-5 w-5" />
                </span>
                <div className="flex gap-1">
                  <button className="btn-ghost px-2 py-1" onClick={() => openEdit(c)} title="Edit"><Pencil className="h-4 w-4" /></button>
                  <button className="btn-ghost px-2 py-1 text-red-600" onClick={() => setRemoving(c)} title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <h3 className="mt-3 font-semibold text-navy-900">{c.name}</h3>
              <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-navy-500">{c.description || 'No description'}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="badge bg-navy-50 text-navy-600">{c.complaintCount || 0} complaints</span>
                <span className="badge bg-navy-50 text-navy-600">{PRIORITY_META[c.defaultPriority]?.label || c.defaultPriority}</span>
                {!c.isActive ? <span className="badge bg-amber-100 text-amber-800">Inactive</span> : null}
              </div>
              <button className="link mt-3 text-sm" onClick={() => toggleActive(c)}>
                {c.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'create' ? 'New category' : 'Edit category'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Name" error={errors.name} required>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
          </Field>
          <Field label="Description">
            <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Icon">
              <Select value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}>
                {CATEGORY_ICON_NAMES.map((i) => <option key={i} value={i}>{i}</option>)}
              </Select>
            </Field>
            <Field label="Color" error={errors.colorHex}>
              <div className="flex items-center gap-2">
                <input type="color" value={form.colorHex} onChange={(e) => setForm((f) => ({ ...f, colorHex: e.target.value }))} className="h-10 w-12 cursor-pointer rounded border border-navy-200" />
                <Input value={form.colorHex} onChange={(e) => setForm((f) => ({ ...f, colorHex: e.target.value }))} error={errors.colorHex} />
              </div>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Default department">
              <Input value={form.defaultDepartment} onChange={(e) => setForm((f) => ({ ...f, defaultDepartment: e.target.value }))} />
            </Field>
            <Field label="Default priority">
              <Select value={form.defaultPriority} onChange={(e) => setForm((f) => ({ ...f, defaultPriority: e.target.value }))}>
                {Object.entries(PRIORITY_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
              </Select>
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        loading={working}
        title="Delete category"
        confirmLabel="Delete"
        message={`Delete "${removing?.name}"? Categories that already have complaints will be deactivated instead.`}
      />
    </div>
  );
}
