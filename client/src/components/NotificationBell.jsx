import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import notificationService from '../services/notificationService.js';
import { timeAgo } from '../utils/formatters.js';
import { EmptyState } from './EmptyState.jsx';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const fetchCount = async () => {
    try {
      setUnread(await notificationService.unreadCount());
    } catch {
      /* ignore polling errors */
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      try {
        const { items: list } = await notificationService.list({ limit: 6 });
        setItems(list);
      } finally {
        setLoading(false);
      }
    }
  };

  const markAll = async () => {
    await notificationService.markAllRead();
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative rounded-lg p-2 text-navy-600 hover:bg-navy-50"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-navy-100 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-navy-100 px-4 py-2.5">
            <span className="text-sm font-semibold text-navy-800">Notifications</span>
            {items.some((n) => !n.isRead) ? (
              <button onClick={markAll} className="flex items-center gap-1 text-xs font-medium text-civic-700 hover:underline">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-navy-400">Loading…</p>
            ) : items.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No notifications" message="You are all caught up." />
              </div>
            ) : (
              <ul>
                {items.map((n) => (
                  <li key={n._id} className={`border-b border-navy-50 px-4 py-3 ${n.isRead ? '' : 'bg-civic-50/50'}`}>
                    <p className="text-sm font-medium text-navy-800">{n.title}</p>
                    <p className="mt-0.5 text-xs text-navy-500">{n.message}</p>
                    <p className="mt-1 text-[11px] text-navy-400">{timeAgo(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;
