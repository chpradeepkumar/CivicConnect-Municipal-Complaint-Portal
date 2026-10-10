import { STATUS_META } from '../utils/constants.js';
import { formatDateTime } from '../utils/formatters.js';

export function Timeline({ history = [] }) {
  if (!history.length) {
    return <p className="text-sm text-navy-500">No history recorded yet.</p>;
  }
  return (
    <ol className="relative space-y-6 border-l border-navy-100 pl-6">
      {history.map((entry, idx) => {
        const meta = STATUS_META[entry.status] || { label: entry.status, dot: 'bg-navy-400' };
        return (
          <li key={entry._id || idx} className="relative">
            <span className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${meta.dot}`} />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-navy-900">{meta.label}</span>
              {entry.actor?.name ? (
                <span className="text-xs text-navy-400">by {entry.actor.name}</span>
              ) : entry.actorRole ? (
                <span className="text-xs text-navy-400">by {entry.actorRole}</span>
              ) : null}
              <span className="text-xs text-navy-400">· {formatDateTime(entry.at || entry.createdAt)}</span>
            </div>
            {entry.note ? <p className="mt-1 text-sm text-navy-600">{entry.note}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}

export default Timeline;
