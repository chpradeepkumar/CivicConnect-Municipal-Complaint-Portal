import { ROLES } from './constants.js';

export function dashboardHome(role) {
  if (role === ROLES.ADMIN) return '/admin';
  if (role === ROLES.STAFF) return '/staff';
  if (role === ROLES.CITIZEN) return '/citizen';
  return '/';
}

export const ROLE_LABELS = {
  [ROLES.CITIZEN]: 'Citizen',
  [ROLES.STAFF]: 'Municipal Staff',
  [ROLES.ADMIN]: 'Administrator',
};
