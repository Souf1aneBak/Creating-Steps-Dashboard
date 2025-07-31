'use client';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect based on role
  const role = sessionStorage.getItem('userRole');
  
  if (role === 'superadmin') {
    redirect('/dashboard/super-admin');
  }
  // Add other role redirects here
  
  return null; // Temporary fallback
}