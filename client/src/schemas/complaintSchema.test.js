import { describe, it, expect } from 'vitest';
import { complaintSchema, zodErrors } from './complaintSchema.js';

const valid = {
  title: 'Pothole on Main Street',
  description: 'A large pothole has formed near the intersection.',
  category: 'cat123',
  address: '12 Main Street',
  priority: 'high',
};

describe('complaintSchema', () => {
  it('accepts a valid payload', () => {
    expect(complaintSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a missing category', () => {
    const parsed = complaintSchema.safeParse({ ...valid, category: '' });
    expect(parsed.success).toBe(false);
  });

  it('rejects a title that is too short', () => {
    const parsed = complaintSchema.safeParse({ ...valid, title: 'no' });
    expect(parsed.success).toBe(false);
  });

  it('converts issues into a field->message map', () => {
    const parsed = complaintSchema.safeParse({ ...valid, title: 'x', address: '' });
    const errors = zodErrors(parsed.error);
    expect(errors.title).toBeTruthy();
    expect(errors.address).toBeTruthy();
  });
});
