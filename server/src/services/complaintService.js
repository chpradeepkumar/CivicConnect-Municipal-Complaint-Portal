import { canTransition, COMPLAINT_STATUS, STATUS_LABELS } from '../utils/constants.js';
import ApiError from '../utils/ApiError.js';

/**
 * Applies a status change to a complaint document, validating the transition
 * and appending a history entry. Does not persist — caller saves.
 */
export function applyStatusChange(complaint, {
  toStatus,
  actorId,
  actorRole = 'system',
  note = '',
  isPublic = true,
} = {}) {
  const fromStatus = complaint.status;
  if (fromStatus === toStatus) {
    throw ApiError.badRequest(`Complaint is already in "${STATUS_LABELS[toStatus] || toStatus}" status`);
  }
  if (!canTransition(fromStatus, toStatus)) {
    throw ApiError.badRequest(
      `Invalid status transition from "${STATUS_LABELS[fromStatus] || fromStatus}" to "${STATUS_LABELS[toStatus] || toStatus}"`
    );
  }

  complaint.status = toStatus;
  complaint.history.push({
    status: toStatus,
    previousStatus: fromStatus,
    note,
    actor: actorId || null,
    actorRole,
    isPublic,
    at: new Date(),
  });

  const now = new Date();
  if (toStatus === COMPLAINT_STATUS.RESOLVED) complaint.resolvedAt = now;
  if (toStatus === COMPLAINT_STATUS.CLOSED) complaint.closedAt = now;
  if (toStatus === COMPLAINT_STATUS.REOPENED) {
    complaint.reopenedCount = (complaint.reopenedCount || 0) + 1;
    complaint.resolvedAt = null;
    complaint.closedAt = null;
  }

  return complaint;
}

export function buildInitialHistory({ status = COMPLAINT_STATUS.SUBMITTED, actorId, actorRole = 'citizen', note = '' }) {
  return [
    {
      status,
      previousStatus: null,
      note,
      actor: actorId || null,
      actorRole,
      isPublic: true,
      at: new Date(),
    },
  ];
}

export default { applyStatusChange, buildInitialHistory };
