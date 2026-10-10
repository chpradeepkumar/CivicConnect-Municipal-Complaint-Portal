import { describe, it, expect } from 'vitest';
import { makeAgent, getCsrf } from './helpers.js';

const API = '/api/v1';

describe('Authentication', () => {
  it('registers a citizen, sets a cookie, and returns the user', async () => {
    const agent = makeAgent();
    const csrf = await getCsrf(agent);
    const res = await agent
      .post(`${API}/auth/register`)
      .set('x-csrf-token', csrf)
      .send({ name: 'Alice Citizen', email: 'Alice@Example.com', password: 'Secret123' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('alice@example.com');
    expect(res.body.data.user.role).toBe('citizen');
    expect(res.body.data.user.password).toBeUndefined();
    const cookies = res.headers['set-cookie'].join(';');
    expect(cookies).toContain('civicconnect_token');
    expect(cookies).toContain('HttpOnly');
  });

  it('rejects duplicate registration', async () => {
    const agent = makeAgent();
    const csrf = await getCsrf(agent);
    const payload = { name: 'Bob', email: 'bob@example.com', password: 'Secret123' };
    await agent.post(`${API}/auth/register`).set('x-csrf-token', csrf).send(payload).expect(201);
    const res = await agent.post(`${API}/auth/register`).set('x-csrf-token', csrf).send(payload);
    expect(res.status).toBe(409);
  });

  it('rejects weak passwords with validation details', async () => {
    const agent = makeAgent();
    const csrf = await getCsrf(agent);
    const res = await agent
      .post(`${API}/auth/register`)
      .set('x-csrf-token', csrf)
      .send({ name: 'Weak', email: 'weak@example.com', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.details.some((d) => d.field === 'password')).toBe(true);
  });

  it('blocks state-changing requests without a CSRF token', async () => {
    const agent = makeAgent();
    await getCsrf(agent);
    const res = await agent
      .post(`${API}/auth/register`)
      .send({ name: 'NoToken', email: 'notoken@example.com', password: 'Secret123' });
    expect(res.status).toBe(403);
  });

  it('logs in, returns /me, then logs out', async () => {
    const agent = makeAgent();
    const csrf = await getCsrf(agent);
    await agent
      .post(`${API}/auth/register`)
      .set('x-csrf-token', csrf)
      .send({ name: 'Carol', email: 'carol@example.com', password: 'Secret123' })
      .expect(201);

    const me = await agent.get(`${API}/auth/me`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe('carol@example.com');

    await agent.post(`${API}/auth/logout`).set('x-csrf-token', csrf).expect(200);
    const meAfter = await agent.get(`${API}/auth/me`);
    expect(meAfter.status).toBe(401);
  });

  it('rejects invalid credentials', async () => {
    const agent = makeAgent();
    const csrf = await getCsrf(agent);
    await agent
      .post(`${API}/auth/register`)
      .set('x-csrf-token', csrf)
      .send({ name: 'Dan', email: 'dan@example.com', password: 'Secret123' })
      .expect(201);
    const res = await agent
      .post(`${API}/auth/login`)
      .set('x-csrf-token', csrf)
      .send({ email: 'dan@example.com', password: 'WrongPass1' });
    expect(res.status).toBe(401);
  });
});
