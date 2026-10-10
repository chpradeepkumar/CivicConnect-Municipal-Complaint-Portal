export const ROLES = Object.freeze({
  CITIZEN: 'citizen',
  STAFF: 'staff',
  ADMIN: 'admin',
});

export const ROLE_VALUES = Object.values(ROLES);

export const COMPLAINT_STATUS = Object.freeze({
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REJECTED: 'rejected',
  REOPENED: 'reopened',
});

export const COMPLAINT_STATUS_VALUES = Object.values(COMPLAINT_STATUS);

export const COMPLAINT_PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
});

export const COMPLAINT_PRIORITY_VALUES = Object.values(COMPLAINT_PRIORITY);

/**
 * Allowed status transitions. Keys are the current status, values are
 * the set of statuses that may follow.
 */
export const STATUS_TRANSITIONS = Object.freeze({
  [COMPLAINT_STATUS.SUBMITTED]: [
    COMPLAINT_STATUS.UNDER_REVIEW,
    COMPLAINT_STATUS.ASSIGNED,
    COMPLAINT_STATUS.REJECTED,
  ],
  [COMPLAINT_STATUS.UNDER_REVIEW]: [
    COMPLAINT_STATUS.ASSIGNED,
    COMPLAINT_STATUS.REJECTED,
  ],
  [COMPLAINT_STATUS.ASSIGNED]: [
    COMPLAINT_STATUS.IN_PROGRESS,
    COMPLAINT_STATUS.UNDER_REVIEW,
  ],
  [COMPLAINT_STATUS.IN_PROGRESS]: [
    COMPLAINT_STATUS.RESOLVED,
    COMPLAINT_STATUS.UNDER_REVIEW,
  ],
  [COMPLAINT_STATUS.RESOLVED]: [
    COMPLAINT_STATUS.CLOSED,
    COMPLAINT_STATUS.REOPENED,
  ],
  [COMPLAINT_STATUS.CLOSED]: [
    COMPLAINT_STATUS.REOPENED,
  ],
  [COMPLAINT_STATUS.REJECTED]: [
    COMPLAINT_STATUS.REOPENED,
  ],
  [COMPLAINT_STATUS.REOPENED]: [
    COMPLAINT_STATUS.UNDER_REVIEW,
    COMPLAINT_STATUS.ASSIGNED,
    COMPLAINT_STATUS.IN_PROGRESS,
  ],
});

export function canTransition(from, to) {
  return Boolean(STATUS_TRANSITIONS[from]?.includes(to));
}

// Human-friendly labels used by the API responses / client when needed.
export const STATUS_LABELS = Object.freeze({
  submitted: 'Submitted',
  under_review: 'Under Review',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  rejected: 'Rejected',
  reopened: 'Reopened',
});

export const NOTIFICATION_TYPES = Object.freeze({
  COMPLAINT_SUBMITTED: 'complaint_submitted',
  STATUS_CHANGED: 'status_changed',
  ASSIGNED: 'assigned',
  COMMENT: 'comment',
  SYSTEM: 'system',
});

export default {
  ROLES,
  ROLE_VALUES,
  COMPLAINT_STATUS,
  COMPLAINT_STATUS_VALUES,
  COMPLAINT_PRIORITY,
  COMPLAINT_PRIORITY_VALUES,
  STATUS_TRANSITIONS,
  canTransition,
  STATUS_LABELS,
  NOTIFICATION_TYPES,
};
