/* eslint-disable no-console */
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import User from '../models/User.js';
import { ROLES } from '../utils/constants.js';

async function createAdmin() {
  const name = process.env.ADMIN_NAME || 'City Administrator';
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    console.error('[create-admin] ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment.');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('[create-admin] ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  await connectDatabase();

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== ROLES.ADMIN) {
      existing.role = ROLES.ADMIN;
      await existing.save({ validateBeforeSave: false });
      console.log(`[create-admin] Promoted existing user ${email} to admin.`);
    } else {
      console.log(`[create-admin] Admin ${email} already exists.`);
    }
    await disconnectDatabase();
    return;
  }

  await User.create({ name, email, password, role: ROLES.ADMIN });
  console.log(`[create-admin] Created administrator account: ${email}`);
  await disconnectDatabase();
}

createAdmin().catch(async (err) => {
  console.error('[create-admin] Failed:', err.message);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
