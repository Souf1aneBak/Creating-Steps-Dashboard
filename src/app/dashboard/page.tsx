'use client';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect based on role
  const role = sessionStorage.getItem('userRole');
  
  if (role === 'superadmin') {
    redirect('/dashboard/super-admin');
  }
  if (role === 'commercial') {
    redirect('/dashboard/commercial');
  }
  if (role === 'assistance') {
    redirect('/dashboard/assistance');
  }
  
  
  return null; // Temporary fallback
}