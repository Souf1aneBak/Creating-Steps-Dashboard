'use client';
import { useState } from 'react';
import { ROLES } from '@/constants/roles';

export const useAuth = () => {
  const [user, setUser] = useState<{ email: string; role: string } | null>({
    email: 'super@admin.com',
    role: ROLES.SUPERADMIN, // Force Super Admin by default
  });

  const login = (email: string, role: string) => {
    setUser({ email, role }); // Auto-login with any input
    return true;
  };

  const logout = () => setUser(null);

  return { user, login, logout };
};