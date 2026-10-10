/* eslint-disable no-console */
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import Category from '../models/Category.js';

async function clean() {
  await connectDatabase();
  await Category.deleteMany({});
  console.log('[clean] Cleared categories.');
  await disconnectDatabase();
}

clean().catch(async (err) => {
  console.error('[clean] Failed:', err.message);
  await disconnectDatabase().catch(() => {});
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
