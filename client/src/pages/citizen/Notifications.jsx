import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import useAsync from '../../hooks/useAsync.js';
import notificationService from '../../services/notificationService.js';
import { PageHeader } from '../../components/PageHeader.jsx';
import { EmptyState, ErrorState } from '../../components/EmptyState.jsx';
import { TableSkeleton } from '../../components/LoadingSkeleton.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { timeAgo } from '../../utils/formatters.js';

export default function Notifications() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload, setData } = useAsync(
    () => notificationService.list({ page, limit: 15 }),
    [page]
  );

  const markAll = async () => {
    await notificationService.markAllRead();
    setData({ ...data, items: data.items.map((n) => ({ ...n, isRead: true })) });
  };

  const markOne = async (n) => {
    if (n.isRead) return;
    await notificationService.markRead(n._id);
    setData({ ...data, items: data.items.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)) });
  };

  const unread = data?.meta?.unread || 0;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle="Updates about your complaints and account."
        actions={unread > 0 ? <button className="btn-secondary" onClick={markAll}><CheckCheck className="h-4 w-4" /> Mark all read</button> : null}
      />

      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={2} />
        ) : error ? (
          <div className="p-6"><ErrorState message="Could not load notifications" onRetry={reload} /></div>
        ) : data.items.length === 0 ? (
          <div className="p-6"><EmptyState icon={Bell} title="No notifications" message="You are all caught up." /></div>
        ) : (
          <>
            <ul className="divide-y divide-navy-50">
              {data.items.map((n) => (
                <li key={n._id} className={`flex gap-3 px-5 py-4 ${n.isRead ? '' : 'bg-civic-50/40'}`}>
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${n.isRead ? 'bg-navy-200' : 'bg-civic-600'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-navy-800">{n.title}</p>
                    <p className="mt-0.5 text-sm text-navy-500">{n.message}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-navy-400">
                      <span>{timeAgo(n.createdAt)}</span>
                      {n.link ? <Link to={n.link.replace(/^\/(citizen|staff|admin)/, '/citizen')} className="link" onClick={() => markOne(n)}>View</Link> : null}
                      {!n.isRead ? <button onClick={() => markOne(n)} className="link">Mark read</button> : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
