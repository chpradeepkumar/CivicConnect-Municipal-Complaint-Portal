import Notification from '../models/Notification.js';

export async function createNotification({ recipient, type, title, message, complaint = null, link = '' }) {
  if (!recipient) return null;
  return Notification.create({ recipient, type, title, message, complaint, link });
}

export async function createManyNotifications(docs = []) {
  if (!docs.length) return [];
  return Notification.insertMany(docs);
}

export default { createNotification, createManyNotifications };
