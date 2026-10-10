/* eslint-disable no-console */
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import { ROLES, COMPLAINT_STATUS } from '../utils/constants.js';
import { generateTrackingCode } from '../utils/generate.js';
import { buildInitialHistory } from '../services/complaintService.js';

const CATEGORIES = [
  { name: 'Roads & Potholes', icon: 'construction', colorHex: '#b45309', defaultDepartment: 'Public Works', defaultPriority: 'high', description: 'Damaged roads, potholes and unsafe surfaces.' },
  { name: 'Garbage Collection', icon: 'trash-2', colorHex: '#15803d', defaultDepartment: 'Sanitation', defaultPriority: 'medium', description: 'Missed pickups and overflowing bins.' },
  { name: 'Streetlights', icon: 'lightbulb', colorHex: '#a16207', defaultDepartment: 'Electrical', defaultPriority: 'medium', description: 'Broken, flickering or missing streetlights.' },
  { name: 'Water Supply', icon: 'droplets', colorHex: '#0369a1', defaultDepartment: 'Water Works', defaultPriority: 'high', description: 'Supply interruptions, leaks and low pressure.' },
  { name: 'Drainage & Sewage', icon: 'waves', colorHex: '#0f766e', defaultDepartment: 'Sanitation', defaultPriority: 'urgent', description: 'Blocked drains, overflow and sewage issues.' },
  { name: 'Public Property Damage', icon: 'building-2', colorHex: '#7c3aed', defaultDepartment: 'Parks & Property', defaultPriority: 'medium', description: 'Damage to public buildings, benches and parks.' },
];

async function seed() {
  await connectDatabase();

  // Categories (idempotent). Compute slugs explicitly since updateOne skips document hooks.
  for (const cat of CATEGORIES) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await Category.updateOne(
      { name: cat.name },
      { $set: { ...cat, slug } },
      { upsert: true }
    );
  }
  console.log(`[seed] Ensured ${CATEGORIES.length} categories.`);

  // Demo accounts (dev only)
  const demoPassword = 'Passw0rd!';
  const accounts = [
    { name: 'Admin User', email: 'admin@civicconnect.local', role: ROLES.ADMIN, department: '' },
    { name: 'Sam Staff', email: 'staff@civicconnect.local', role: ROLES.STAFF, department: 'Public Works' },
    { name: 'Casey Citizen', email: 'citizen@civicconnect.local', role: ROLES.CITIZEN, department: '' },
  ];

  const created = {};
  for (const acc of accounts) {
    let user = await User.findOne({ email: acc.email });
    if (!user) {
      user = await User.create({ ...acc, password: demoPassword });
      console.log(`[seed] Created ${acc.role}: ${acc.email} / ${demoPassword}`);
    }
    created[acc.role] = user;
  }

  // Sample complaints if none exist
  const count = await Complaint.countDocuments();
  if (count === 0) {
    const cats = await Category.find().limit(3);
    const samples = [
      { title: 'Large pothole on Main Street', description: 'A deep pothole near the junction is damaging vehicles and is dangerous at night.', category: cats[0]._id },
      { title: 'Garbage not collected this week', description: 'The bin at the corner of Elm and 2nd has overflowed and is attracting pests.', category: cats[1]._id },
      { title: 'Streetlight out near park entrance', description: 'The streetlight by the north entrance of the park has been dark for several nights.', category: cats[2]._id },
    ];
    for (const s of samples) {
      await Complaint.create({
        trackingCode: generateTrackingCode(),
        title: s.title,
        description: s.description,
        category: s.category,
        citizen: created[ROLES.CITIZEN]._id,
        address: '123 Civic Avenue',
        priority: 'medium',
        status: COMPLAINT_STATUS.SUBMITTED,
        dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        history: buildInitialHistory({ actorId: created[ROLES.CITIZEN]._id, actorRole: ROLES.CITIZEN, note: 'Seeded complaint' }),
      });
    }
    console.log('[seed] Created 3 sample complaints.');
  }

  await disconnectDatabase();
  console.log('[seed] Done.');
}

seed().catch(async (err) => {
  console.error('[seed] Failed:', err.message);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
