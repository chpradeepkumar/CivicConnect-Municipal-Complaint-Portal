import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, User as UserIcon, Wrench, Paperclip,
  XCircle, RotateCcw, Pencil, Image as ImageIcon, Printer,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import complaintService from '../../services/complaintService.js';
import userService from '../../services/userService.js';
import useAsync from '../../hooks/useAsync.js';
import { getErrorMessage } from '../../services/api.js';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge.jsx';
import { Timeline } from '../../components/Timeline.jsx';
import { PageLoader } from '../../components/Spinner.jsx';
import { ErrorState } from '../../components/EmptyState.jsx';
import { Modal } from '../../components/Modal.jsx';
import { Field, Input, Select, Textarea } from '../../components/FormControls.jsx';
import { ImageUploader } from '../../components/ImageUploader.jsx';
import { CategoryIcon } from '../../components/CategoryIcon.jsx';
import { Emblem } from '../../components/Emblem.jsx';
import { SITE } from '../../config/site.js';
import { formatDate, formatDateTime, timeAgo } from '../../utils/formatters.js';
import { nextStatuses, STATUS_META, ROLES } from '../../utils/constants.js';

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const { data: complaint, loading, error, reload, setData } = useAsync(
    () => complaintService.get(id),
    [id]
  );
  const { data: history, reload: reloadHistory } = useAsync(() => complaintService.history(id), [id]);
  const { data: staffList } = useAsync(
    () => (user.role === ROLES.ADMIN ? userService.listStaff({ limit: 100 }) : Promise.resolve(null)),
    [user.role]
  );

  const [modal, setModal] = useState(null); // 'status' | 'assign' | 'reject' | 'reopen' | 'edit'
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ status: '', note: '', resolutionNotes: '', reason: '', staffId: '' });
  const [files, setFiles] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  if (loading) return <PageLoader label="Loading complaint…" />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={reload} />;
  if (!complaint) return <ErrorState message="Complaint not found" />;

  const isOwner = String(complaint.citizen?._id || complaint.citizen) === String(user._id);
  const isStaffActor = user.role === ROLES.STAFF;
  const isAdmin = user.role === ROLES.ADMIN;
  const canManage = isAdmin || isStaffActor;
  const canEdit = (isOwner || isAdmin) && ['submitted', 'under_review', 'assigned', 'in_progress', 'reopened'].includes(complaint.status);
  const canReopen = (isOwner || isAdmin) && ['resolved', 'closed', 'rejected'].includes(complaint.status);
  const statusChoices = nextStatuses(complaint.status, user.role);

  const refresh = async () => {
    await Promise.all([reload(), reloadHistory()]);
  };

  const run = async (fn, successMsg) => {
    setBusy(true);
    try {
      await fn();
      toast.success(successMsg);
      setModal(null);
      setForm({ status: '', note: '', resolutionNotes: '', reason: '', staffId: '' });
      setFiles([]);
      setFieldErrors({});
      await refresh();
    } catch (err) {
      const details = err?.response?.data?.details;
      if (Array.isArray(details)) {
        setFieldErrors(Object.fromEntries(details.map((d) => [d.field, d.message])));
      }
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const openStatus = (status = '') => {
    setForm({ status, note: '', resolutionNotes: '', reason: '', staffId: '' });
    setModal('status');
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 px-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
              {complaint.trackingCode}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <h1 className="mt-2 text-2xl font-bold text-navy-900">{complaint.title}</h1>
          <p className="mt-1 text-sm text-navy-400">Updated {timeAgo(complaint.updatedAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit ? (
            <button className="btn-secondary" onClick={() => setModal('edit')}>
              <Pencil className="h-4 w-4" /> Edit
            </button>
          ) : null}
          {canReopen ? (
            <button className="btn-secondary" onClick={() => setModal('reopen')}>
              <RotateCcw className="h-4 w-4" /> Reopen
            </button>
          ) : null}
          {canManage && statusChoices.length ? (
            <button className="btn-primary" onClick={() => openStatus(statusChoices[0])}>
              <Wrench className="h-4 w-4" /> Update status
            </button>
          ) : null}
          {isOwner || isAdmin ? (
            <button className="btn-secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print receipt
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-navy-900">Description</h2>
            <p className="mt-3 whitespace-pre-line text-sm text-navy-600">{complaint.description}</p>

            {complaint.attachments?.length ? (
              <div className="mt-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-700">
                  <Paperclip className="h-4 w-4" /> Attachments
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {complaint.attachments.map((img) => (
                    <a
                      key={img._id || img.filename}
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-lg border border-navy-100"
                    >
                      <img src={img.url} alt={img.originalName} className="h-24 w-full object-cover transition group-hover:scale-105" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {complaint.resolutionAttachments?.length ? (
              <div className="mt-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-700">
                  <ImageIcon className="h-4 w-4" /> Resolution evidence
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {complaint.resolutionAttachments.map((img) => (
                    <a key={img._id || img.filename} href={img.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-navy-100">
                      <img src={img.url} alt={img.originalName} className="h-24 w-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {complaint.resolutionNotes ? (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-semibold text-green-800">Resolution notes</p>
                <p className="mt-1 whitespace-pre-line text-sm text-green-700">{complaint.resolutionNotes}</p>
              </div>
            ) : null}
            {complaint.rejectionReason ? (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">Rejection reason</p>
                <p className="mt-1 text-sm text-red-700">{complaint.rejectionReason}</p>
              </div>
            ) : null}
          </div>

          <div className="card p-6">
            <h2 className="mb-5 text-lg font-semibold text-navy-900">Status history</h2>
            <Timeline history={history || complaint.history || []} />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="text-base font-semibold text-navy-900">Details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <CategoryIcon name={complaint.category?.icon} className="mt-0.5 h-4 w-4 text-civic-600" />
                <div>
                  <dt className="text-navy-400">Category</dt>
                  <dd className="font-medium text-navy-800">{complaint.category?.name}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-civic-600" />
                <div>
                  <dt className="text-navy-400">Address</dt>
                  <dd className="font-medium text-navy-800">{complaint.address}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserIcon className="mt-0.5 h-4 w-4 text-civic-600" />
                <div>
                  <dt className="text-navy-400">Reported by</dt>
                  <dd className="font-medium text-navy-800">{complaint.citizen?.name || 'You'}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wrench className="mt-0.5 h-4 w-4 text-civic-600" />
                <div>
                  <dt className="text-navy-400">Assigned to</dt>
                  <dd className="font-medium text-navy-800">
                    {complaint.assignedTo?.name || 'Not assigned'}
                    {complaint.assignedTo?.department ? ` · ${complaint.assignedTo.department}` : ''}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-civic-600" />
                <div>
                  <dt className="text-navy-400">Submitted</dt>
                  <dd className="font-medium text-navy-800">{formatDateTime(complaint.createdAt)}</dd>
                </div>
              </div>
            </dl>
          </div>

          {isAdmin ? (
            <div className="card p-6">
              <h2 className="text-base font-semibold text-navy-900">Administration</h2>
              <div className="mt-4 flex flex-col gap-2">
                <button className="btn-secondary w-full" onClick={() => setModal('assign')}>
                  <Wrench className="h-4 w-4" /> {complaint.assignedTo ? 'Reassign' : 'Assign'} staff
                </button>
                {complaint.status !== 'rejected' ? (
                  <button className="btn-danger w-full" onClick={() => setModal('reject')}>
                    <XCircle className="h-4 w-4" /> Reject complaint
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {/* Printable receipt */}
      <div className="print-area hidden">
        <div className="flex items-center gap-4 border-b-2 border-navy-900 pb-4">
          <Emblem className="h-16 w-16" />
          <div>
            <p className="font-display text-xl font-bold text-navy-900">{SITE.corpName}</p>
            <p className="text-sm text-navy-700">{SITE.corpNameHi}</p>
            <p className="text-xs text-navy-500">{SITE.address}</p>
          </div>
        </div>

        <h1 className="mt-6 text-center font-display text-lg font-bold uppercase tracking-wide text-navy-900">
          Complaint Acknowledgement Receipt
        </h1>

        <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          {[
            ['Tracking code', complaint.trackingCode, false],
            ['Status', (complaint.status || '').replace(/_/g, ' '), false],
            ['Priority', complaint.priority || '—', false],
            ['Category', complaint.category?.name || '—', false],
            ['Title', complaint.title || '—', true],
            ['Location', complaint.address || '—', true],
            ['Reported by', complaint.citizen?.name || '—', false],
            ['Submitted on', formatDateTime(complaint.createdAt), false],
            ['Assigned department', complaint.department?.name || complaint.assignedTo?.department || '—', false],
            ['Assigned to', complaint.assignedTo?.name || 'Not yet assigned', false],
            ['Target date', complaint.dueAt ? formatDate(complaint.dueAt) : '—', false],
            ['Last updated', formatDateTime(complaint.updatedAt), false],
          ].map(([label, value, full]) => (
            <div key={label} className={full ? 'col-span-2' : ''}>
              <dt className="text-xs uppercase tracking-wide text-navy-400">{label}</dt>
              <dd className="font-medium text-navy-900">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex items-end justify-between gap-8 border-t border-navy-200 pt-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-navy-400">Tracking code</p>
            <p className="font-mono text-xl font-bold text-navy-900">{complaint.trackingCode}</p>
          </div>
          <div className="text-center">
            <div className="h-10 w-48 border-b border-navy-400" />
            <p className="mt-1 text-xs text-navy-500">Authorised signatory</p>
          </div>
        </div>

        <p className="mt-6 text-xs text-navy-500">
          This is a computer-generated acknowledgement from the {SITE.portalName} grievance portal.
          Retain this receipt for future reference.
        </p>
      </div>

      {/* Status modal */}
      <Modal
        open={modal === 'status'}
        onClose={() => setModal(null)}
        title="Update complaint status"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModal(null)} disabled={busy}>Cancel</button>
            <button
              className="btn-primary"
              disabled={busy || !form.status}
              onClick={() =>
                run(
                  () =>
                    complaintService.changeStatus(id, {
                      status: form.status,
                      note: form.note,
                      resolutionNotes: form.resolutionNotes,
                      images: files,
                    }),
                  'Status updated'
                )
              }
            >
              {busy ? 'Saving…' : 'Save update'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="New status" error={fieldErrors.status} required>
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="">Select a status…</option>
              {statusChoices.map((s) => (
                <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Note" error={fieldErrors.note} hint="Visible on the public timeline">
            <Textarea rows={3} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Add context for this update" />
          </Field>
          {form.status === 'resolved' ? (
            <>
              <Field label="Resolution notes" error={fieldErrors.resolutionNotes}>
                <Textarea rows={3} value={form.resolutionNotes} onChange={(e) => setForm((f) => ({ ...f, resolutionNotes: e.target.value }))} placeholder="Describe how the issue was resolved" />
              </Field>
              <Field label="Resolution evidence (optional)">
                <ImageUploader files={files} onChange={setFiles} max={3} />
              </Field>
            </>
          ) : null}
        </div>
      </Modal>

      {/* Assign modal */}
      <Modal
        open={modal === 'assign'}
        onClose={() => setModal(null)}
        title="Assign staff"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModal(null)} disabled={busy}>Cancel</button>
            <button className="btn-primary" disabled={busy || !form.staffId} onClick={() => run(() => complaintService.assign(id, { staffId: form.staffId, note: form.note }), 'Complaint assigned')}>
              {busy ? 'Assigning…' : 'Assign'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Staff member" error={fieldErrors.staffId} required>
            <Select value={form.staffId} onChange={(e) => setForm((f) => ({ ...f, staffId: e.target.value }))}>
              <option value="">Select staff…</option>
              {(staffList?.items || []).map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}{s.department ? ` · ${s.department}` : ''}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Note (optional)">
            <Textarea rows={3} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
          </Field>
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal
        open={modal === 'reject'}
        onClose={() => setModal(null)}
        title="Reject complaint"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModal(null)} disabled={busy}>Cancel</button>
            <button className="btn-danger" disabled={busy || form.reason.trim().length < 5} onClick={() => run(() => complaintService.reject(id, form.reason), 'Complaint rejected')}>
              {busy ? 'Rejecting…' : 'Reject'}
            </button>
          </>
        }
      >
        <Field label="Reason" error={fieldErrors.reason} required hint="At least 5 characters. Shown to the citizen.">
          <Textarea rows={3} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
        </Field>
      </Modal>

      {/* Reopen modal */}
      <Modal
        open={modal === 'reopen'}
        onClose={() => setModal(null)}
        title="Reopen complaint"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModal(null)} disabled={busy}>Cancel</button>
            <button className="btn-primary" disabled={busy} onClick={() => run(() => complaintService.reopen(id, form.reason), 'Complaint reopened')}>
              {busy ? 'Reopening…' : 'Reopen'}
            </button>
          </>
        }
      >
        <Field label="Reason (optional)">
          <Textarea rows={3} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Why are you reopening this complaint?" />
        </Field>
      </Modal>

      {/* Edit modal */}
      <EditComplaintModal
        open={modal === 'edit'}
        complaint={complaint}
        busy={busy}
        onClose={() => setModal(null)}
        onSave={(payload) => run(() => complaintService.update(id, payload).then(setData), 'Complaint updated')}
        fieldErrors={fieldErrors}
      />
    </div>
  );
}

function EditComplaintModal({ open, complaint, onClose, onSave, busy, fieldErrors }) {
  const [form, setForm] = useState({
    title: complaint.title,
    description: complaint.description,
    address: complaint.address,
    priority: complaint.priority,
  });
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit complaint"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-primary" disabled={busy} onClick={() => onSave(form)}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" error={fieldErrors.title} required>
          <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </Field>
        <Field label="Description" error={fieldErrors.description} required>
          <Textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </Field>
        <Field label="Address" error={fieldErrors.address} required>
          <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </Field>
        <Field label="Priority">
          <Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
