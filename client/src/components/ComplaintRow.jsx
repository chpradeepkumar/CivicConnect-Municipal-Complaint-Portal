import { StatusBadge, PriorityBadge } from './StatusBadge.jsx';
import CategoryIcon from './CategoryIcon.jsx';
import { formatDate } from '../utils/formatters.js';

export function ComplaintRow({ complaint, onOpen }) {
  return (
    <tr className="cursor-pointer border-b border-navy-50 transition hover:bg-navy-50/60" onClick={() => onOpen?.(complaint)}>
      <td className="table-td">
        <div className="font-semibold text-navy-900">{complaint.trackingCode}</div>
        <div className="text-xs text-navy-400">{formatDate(complaint.createdAt)}</div>
      </td>
      <td className="table-td max-w-xs">
        <div className="font-medium text-navy-800">{complaint.title}</div>
      </td>
      <td className="table-td">
        <span className="inline-flex items-center gap-1.5 text-navy-600">
          <CategoryIcon name={complaint.category?.icon} className="h-4 w-4 text-civic-600" />
          {complaint.category?.name || '—'}
        </span>
      </td>
      <td className="table-td"><PriorityBadge priority={complaint.priority} /></td>
      <td className="table-td"><StatusBadge status={complaint.status} /></td>
    </tr>
  );
}

export default ComplaintRow;
