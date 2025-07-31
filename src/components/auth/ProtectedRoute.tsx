// src/components/auth/ProtectedRoute.tsx
'use client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !allowedRoles.includes(user.role)) {
      router.push('/login');
    }
  }, [user, allowedRoles, router]);

  if (!user || !allowedRoles.includes(user.role)) {
    return null; // or loading spinner
  }

  return <>{children}</>;
}