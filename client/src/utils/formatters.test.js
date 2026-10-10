import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, timeAgo, truncate } from './formatters.js';

describe('formatters', () => {
  it('returns an em dash for empty date values', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
    expect(timeAgo(null)).toBe('—');
  });

  it('formats ISO dates into a readable date', () => {
    const out = formatDate('2026-01-15T10:00:00.000Z');
    expect(out).toMatch(/2026/);
    expect(out).toMatch(/Jan/);
  });

  it('reports relative time for the recent past', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(twoHoursAgo)).toBe('2 hours ago');
  });

  it('truncates long strings with an ellipsis', () => {
    expect(truncate('abcdef', 4)).toBe('abcd…');
    expect(truncate('abc', 10)).toBe('abc');
    expect(truncate('')).toBe('');
  });
});
