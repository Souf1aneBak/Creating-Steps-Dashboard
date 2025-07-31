import { ROLES } from '../constants/roles';

type User = {
  email: string;
  role: typeof ROLES[keyof typeof ROLES];
};

// Mock users database
const MOCK_USERS: User[] = [
  { email: 'super@admin.com', role: ROLES.SUPERADMIN },
  { email: 'commercial@test.com', role: ROLES.COMMERCIAL },
  { email: 'assistance@test.com', role: ROLES.ASSISTANCE }
];

export const mockLogin = (email: string, role: string) => {
  const user = MOCK_USERS.find(u => u.email === email && u.role === role);
  return user || null;
};

export const mockLogout = () => {
  return true;
};