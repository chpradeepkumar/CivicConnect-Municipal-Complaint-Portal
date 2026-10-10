import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { signToken } from '../src/utils/jwt.js';
import env from '../src/config/env.js';

export function makeAgent() {
  return request.agent(app);
}

export async function getCsrf(agent) {
  const res = await agent.get('/api/v1/auth/csrf');
  return res.body.data.csrfToken;
}

export async function createUser({ name = 'Test User', email, password = 'Passw0rd!', role = 'citizen', department = '' }) {
  return User.create({ name, email, password, role, department });
}

/**
 * Creates a user, logs them in on a fresh agent, and returns the agent,
 * csrf token and user document.
 */
export async function authedAgent({ name, email, password = 'Passw0rd!', role = 'citizen', department = '' } = {}) {
  const user = await createUser({ name, email, password, role, department });
  const agent = makeAgent();
  const csrf = await getCsrf(agent);
  const res = await agent
    .post('/api/v1/auth/login')
    .set('x-csrf-token', csrf)
    .send({ email, password });
  if (res.status !== 200) throw new Error(`login failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { agent, csrf, user };
}

/**
 * Directly signs a JWT cookie without going through login.
 * Useful for tests that do not exercise the auth endpoints.
 */
export function authCookieFor(user) {
  const token = signToken(user);
  return `${env.COOKIE_NAME}=${token}`;
}

export const CSRF_HEADER = 'x-csrf-token';
