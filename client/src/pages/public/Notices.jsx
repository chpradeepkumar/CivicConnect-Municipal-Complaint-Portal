import { useState } from 'react';
import { CalendarDays, Tag } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { NOTICES } from '../../config/site.js';
import { formatDate } from '../../utils/formatters.js';

export default function Notices() {
  const [tag, setTag] = useState('All');
  const tags = ['All', ...Array.from(new Set(NOTICES.map((n) => n.tag)))];
  const list = (tag === 'All' ? NOTICES : NOTICES.filter((n) => n.tag === tag))
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="container-page py-12">
      <PageHeader
        title="Public Notices"
        subtitle="Official announcements, advisories and service updates from the Corporation."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {tags.map((tg) => (
          <button
            key={tg}
            onClick={() => setTag(tg)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              tag === tg
                ? 'border-civic-700 bg-civic-700 text-white'
                : 'border-navy-200 bg-white text-navy-600 hover:bg-navy-50'
            }`}
          >
            {tg}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No notices" message="There are no notices in this category." />
      ) : (
        <ul className="space-y-4">
          {list.map((n) => (
            <li key={n.id} className="card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="badge bg-saffron-100 text-saffron-800">
                  <Tag className="h-3.5 w-3.5" /> {n.tag}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-navy-400">
                  <CalendarDays className="h-3.5 w-3.5" /> {formatDate(n.date)}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-navy-900">{n.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
