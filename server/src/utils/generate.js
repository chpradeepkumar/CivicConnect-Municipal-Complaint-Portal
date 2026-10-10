import crypto from 'node:crypto';

/**
 * Generates a unique, human-readable public tracking reference,
 * e.g. CC-2026-K7F3A9.
 */
export function generateTrackingCode() {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CC-${year}-${rand}`;
}

export function randomFileName(originalName = '') {
  const ext = (originalName.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeExt = ext && ext.length <= 5 ? `.${ext}` : '';
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt}`;
}

export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

export default { generateTrackingCode, randomFileName, generateToken };
