import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { makeAgent, getCsrf } from './helpers.js';

describe('Health & public endpoints', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.environment).toBe('test');
  });

  it('GET /api/v1/dashboard/public-stats returns numeric metrics', async () => {
    const res = await request(app).get('/api/v1/dashboard/public-stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('resolutionRate');
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });

  it('CSRF cookie is issued on GET /api/v1/auth/csrf', async () => {
    const agent = makeAgent();
    const token = await getCsrf(agent);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
  });

  it('unknown routes return a structured 404', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
