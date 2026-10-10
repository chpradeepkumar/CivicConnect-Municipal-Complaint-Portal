import { STATUS_META, PRIORITY_META } from '../utils/constants.js';

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, badge: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' };
  return (
    <span className={`badge ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const meta = PRIORITY_META[priority] || { label: priority, badge: 'bg-slate-100 text-slate-700' };
  return <span className={`badge ${meta.badge}`}>{meta.label}</span>;
}

export function OverdueBadge() {
  return <span className="badge bg-red-100 text-red-800">Overdue</span>;
}

export default StatusBadge;
