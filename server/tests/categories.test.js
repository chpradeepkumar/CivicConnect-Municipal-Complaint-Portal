import { describe, it, expect } from 'vitest';
import { authedAgent, makeAgent } from './helpers.js';

const API = '/api/v1';

describe('Categories', () => {
  it('allows public listing', async () => {
    const res = await makeAgent().get(`${API}/categories`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });

  it('lets an admin create, update and deactivate a category', async () => {
    const admin = await authedAgent({ name: 'CatAdmin', email: 'catadmin@example.com', role: 'admin' });

    const created = await admin.agent
      .post(`${API}/categories`)
      .set('x-csrf-token', admin.csrf)
      .send({ name: 'Noise Pollution', description: 'Loud noise complaints' });
    expect(created.status).toBe(201);
    const id = created.body.data.category._id;
    expect(created.body.data.category.slug).toBe('noise-pollution');

    const updated = await admin.agent
      .patch(`${API}/categories/${id}`)
      .set('x-csrf-token', admin.csrf)
      .send({ isActive: false });
    expect(updated.status).toBe(200);
    expect(updated.body.data.category.isActive).toBe(false);
  });

  it('forbids citizens from creating categories', async () => {
    const citizen = await authedAgent({ name: 'Plain', email: 'plain@example.com' });
    const res = await citizen.agent
      .post(`${API}/categories`)
      .set('x-csrf-token', citizen.csrf)
      .send({ name: 'Hack Category' });
    expect(res.status).toBe(403);
  });

  it('deactivates a category that still has complaints instead of deleting it', async () => {
    const admin = await authedAgent({ name: 'CatAdmin2', email: 'catadmin2@example.com', role: 'admin' });
    const citizen = await authedAgent({ name: 'Citz', email: 'citz@example.com' });

    const cat = await admin.agent
      .post(`${API}/categories`)
      .set('x-csrf-token', admin.csrf)
      .send({ name: 'Street Cleaning' })
      .expect(201);
    const catId = cat.body.data.category._id;

    await citizen.agent
      .post(`${API}/complaints`)
      .set('x-csrf-token', citizen.csrf)
      .send({
        title: 'Street needs cleaning badly',
        description: 'The street has not been cleaned in a very long time.',
        category: String(catId),
        address: '5 Clean Street',
      })
      .expect(201);

    const del = await admin.agent
      .delete(`${API}/categories/${catId}`)
      .set('x-csrf-token', admin.csrf);
    expect(del.status).toBe(200);
    expect(del.body.data.category.isActive).toBe(false);
  });
});
