import AuditLog from '../models/AuditLog.js';

export async function recordAudit({
  actor = null,
  actorRole = 'system',
  action,
  entityType,
  entityId = null,
  description = '',
  metadata = {},
  req = null,
} = {}) {
  try {
    return await AuditLog.create({
      actor: actor || null,
      actorRole,
      action,
      entityType,
      entityId: entityId || null,
      description,
      metadata,
      ip: req?.ip || req?.headers?.['x-forwarded-for'] || '',
      userAgent: req?.headers?.['user-agent'] || '',
    });
  } catch {
    // Audit logging must never break the request lifecycle.
    return null;
  }
}

export default { recordAudit };
