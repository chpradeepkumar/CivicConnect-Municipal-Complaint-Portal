export const ROLES = { CITIZEN: 'citizen', STAFF: 'staff', ADMIN: 'admin' };

export const STATUS_META = {
  submitted: { label: 'Submitted', badge: 'bg-civic-100 text-civic-800', dot: 'bg-civic-500' },
  under_review: { label: 'Under Review', badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  assigned: { label: 'Assigned', badge: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500' },
  in_progress: { label: 'In Progress', badge: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  resolved: { label: 'Resolved', badge: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  closed: { label: 'Closed', badge: 'bg-slate-200 text-slate-700', dot: 'bg-slate-500' },
  rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
  reopened: { label: 'Reopened', badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
};

export const PRIORITY_META = {
  low: { label: 'Low', badge: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Medium', badge: 'bg-sky-100 text-sky-800' },
  high: { label: 'High', badge: 'bg-amber-100 text-amber-800' },
  urgent: { label: 'Urgent', badge: 'bg-red-100 text-red-800' },
};

export const STATUS_ORDER = [
  'submitted',
  'under_review',
  'assigned',
  'in_progress',
  'resolved',
  'closed',
];

// Statuses a given actor may move a complaint to, mirroring server transitions.
export const STATUS_OPTIONS = ['under_review', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected', 'reopened'];

export const STATUS_TRANSITIONS = {
  submitted: ['under_review', 'assigned', 'rejected'],
  under_review: ['assigned', 'rejected'],
  assigned: ['in_progress', 'under_review'],
  in_progress: ['resolved', 'under_review'],
  resolved: ['closed', 'reopened'],
  closed: ['reopened'],
  rejected: ['reopened'],
  reopened: ['under_review', 'assigned', 'in_progress'],
};

export function nextStatuses(current, role) {
  const allowed = STATUS_TRANSITIONS[current] || [];
  if (role === 'staff') return allowed.filter((s) => !['rejected', 'closed'].includes(s));
  return allowed;
}

export const CATEGORY_ICON_OPTIONS = [
  'construction', 'trash-2', 'lightbulb', 'droplets', 'waves',
  'building-2', 'alert-circle', 'traffic-cone', 'tree-pine', 'volume-2',
];
