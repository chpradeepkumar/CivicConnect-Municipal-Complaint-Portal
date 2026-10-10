import { describe, it, expect, beforeEach } from 'vitest';
import Category from '../src/models/Category.js';
import { authedAgent, makeAgent } from './helpers.js';

const API = '/api/v1';

let category;

beforeEach(async () => {
  category = await Category.create({ name: 'Potholes', description: 'Road damage' });
});

function submitComplaint(agent, csrf, overrides = {}) {
  return agent
    .post(`${API}/complaints`)
    .set('x-csrf-token', csrf)
    .send({
      title: 'Big pothole on Oak Street',
      description: 'There is a deep pothole that damages cars and is dangerous.',
      category: String(category._id),
      address: '10 Oak Street',
      priority: 'high',
      ...overrides,
    });
}

describe('Complaints', () => {
  it('lets a citizen create a complaint with a tracking code and history', async () => {
    const { agent, csrf } = await authedAgent({ name: 'C1', email: 'c1@example.com' });
    const res = await submitComplaint(agent, csrf);
    expect(res.status).toBe(201);
    const c = res.body.data.complaint;
    expect(c.trackingCode).toMatch(/^CC-\d{4}-[A-F0-9]{6}$/);
    expect(c.status).toBe('submitted');
    expect(c.history.length).toBe(1);
  });

  it('validates required fields', async () => {
    const { agent, csrf } = await authedAgent({ name: 'C2', email: 'c2@example.com' });
    const res = await submitComplaint(agent, csrf, { title: 'no' });
    expect(res.status).toBe(400);
  });

  it('scopes the complaint list to the owning citizen', async () => {
    const a = await authedAgent({ name: 'Ann', email: 'a@example.com' });
    const b = await authedAgent({ name: 'Ben', email: 'b@example.com' });
    await submitComplaint(a.agent, a.csrf).expect(201);

    const listA = await a.agent.get(`${API}/complaints`);
    expect(listA.body.data.complaints.length).toBe(1);

    const listB = await b.agent.get(`${API}/complaints`);
    expect(listB.body.data.complaints.length).toBe(0);
  });

  it('prevents one citizen from viewing another citizen complaint', async () => {
    const a = await authedAgent({ name: 'A2', email: 'a2@example.com' });
    const b = await authedAgent({ name: 'B2', email: 'b2@example.com' });
    const created = await submitComplaint(a.agent, a.csrf);
    const id = created.body.data.complaint._id;

    const res = await b.agent.get(`${API}/complaints/${id}`);
    expect(res.status).toBe(403);
  });

  it('supports public tracking without exposing private data', async () => {
    const { agent, csrf } = await authedAgent({ name: 'C3', email: 'c3@example.com' });
    const created = await submitComplaint(agent, csrf);
    const code = created.body.data.complaint.trackingCode;

    const pub = await makeAgent().get(`${API}/complaints/track/${code}`);
    expect(pub.status).toBe(200);
    expect(pub.body.data.complaint.trackingCode).toBe(code);
    expect(pub.body.data.complaint.citizen).toBeUndefined();
    expect(JSON.stringify(pub.body)).not.toContain('c3@example.com');
  });

  it('runs the assignment + status workflow and rejects invalid transitions', async () => {
    const citizen = await authedAgent({ name: 'Owner', email: 'owner@example.com' });
    const admin = await authedAgent({ name: 'Admin', email: 'ad@example.com', role: 'admin' });
    const staff = await authedAgent({ name: 'Staff', email: 'st@example.com', role: 'staff', department: 'Public Works' });

    const created = await submitComplaint(citizen.agent, citizen.csrf);
    const id = created.body.data.complaint._id;

    // invalid direct transition submitted -> resolved
    const bad = await admin.agent
      .patch(`${API}/complaints/${id}/status`)
      .set('x-csrf-token', admin.csrf)
      .send({ status: 'resolved' });
    expect(bad.status).toBe(400);

    // assign
    const assigned = await admin.agent
      .post(`${API}/complaints/${id}/assign`)
      .set('x-csrf-token', admin.csrf)
      .send({ staffId: String(staff.user._id), note: 'Please handle' });
    expect(assigned.status).toBe(200);
    expect(assigned.body.data.complaint.status).toBe('assigned');

    // staff progresses
    const inProgress = await staff.agent
      .patch(`${API}/complaints/${id}/status`)
      .set('x-csrf-token', staff.csrf)
      .send({ status: 'in_progress', note: 'On my way' });
    expect(inProgress.status).toBe(200);
    expect(inProgress.body.data.complaint.status).toBe('in_progress');

    const resolved = await staff.agent
      .patch(`${API}/complaints/${id}/status`)
      .set('x-csrf-token', staff.csrf)
      .send({ status: 'resolved', note: 'Fixed', resolutionNotes: 'Pothole filled' });
    expect(resolved.status).toBe(200);
    expect(resolved.body.data.complaint.status).toBe('resolved');
    expect(resolved.body.data.complaint.resolutionNotes).toBe('Pothole filled');

    // history recorded
    const history = await citizen.agent.get(`${API}/complaints/${id}/history`);
    expect(history.body.data.history.length).toBeGreaterThanOrEqual(4);
  });

  it('prevents staff from acting on complaints not assigned to them', async () => {
    const citizen = await authedAgent({ name: 'Owner2', email: 'owner2@example.com' });
    const staff = await authedAgent({ name: 'Lonely Staff', email: 'ls@example.com', role: 'staff' });
    const created = await submitComplaint(citizen.agent, citizen.csrf);
    const id = created.body.data.complaint._id;

    const res = await staff.agent
      .patch(`${API}/complaints/${id}/status`)
      .set('x-csrf-token', staff.csrf)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(403);
  });

  it('only allows citizens to create complaints', async () => {
    const admin = await authedAgent({ name: 'Admin2', email: 'ad2@example.com', role: 'admin' });
    const res = await submitComplaint(admin.agent, admin.csrf);
    expect(res.status).toBe(403);
  });

  it('allows a citizen to reopen a resolved complaint', async () => {
    const citizen = await authedAgent({ name: 'Owner3', email: 'owner3@example.com' });
    const admin = await authedAgent({ name: 'Admin3', email: 'ad3@example.com', role: 'admin' });
    const staff = await authedAgent({ name: 'Staff3', email: 'st3@example.com', role: 'staff' });

    const created = await submitComplaint(citizen.agent, citizen.csrf);
    const id = created.body.data.complaint._id;
    await admin.agent.post(`${API}/complaints/${id}/assign`).set('x-csrf-token', admin.csrf).send({ staffId: String(staff.user._id) }).expect(200);
    await staff.agent.patch(`${API}/complaints/${id}/status`).set('x-csrf-token', staff.csrf).send({ status: 'in_progress' }).expect(200);
    await staff.agent.patch(`${API}/complaints/${id}/status`).set('x-csrf-token', staff.csrf).send({ status: 'resolved' }).expect(200);

    const reopen = await citizen.agent
      .post(`${API}/complaints/${id}/reopen`)
      .set('x-csrf-token', citizen.csrf)
      .send({ reason: 'Issue returned' });
    expect(reopen.status).toBe(200);
    expect(reopen.body.data.complaint.status).toBe('reopened');
    expect(reopen.body.data.complaint.reopenedCount).toBe(1);
  });

  it('counts complaints in the admin dashboard', async () => {
    const citizen = await authedAgent({ name: 'Owner4', email: 'owner4@example.com' });
    const admin = await authedAgent({ name: 'Admin4', email: 'ad4@example.com', role: 'admin' });
    await submitComplaint(citizen.agent, citizen.csrf);
    const dash = await admin.agent.get(`${API}/dashboard/admin`);
    expect(dash.status).toBe(200);
    expect(dash.body.data.metrics.total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(dash.body.data.statusDistribution)).toBe(true);
  });
});
