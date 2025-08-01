'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import Footer from '@/components/dashboard/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    if (!role) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      <Navbar />

      
      <div className="flex flex-1 overflow-hidden">
        
        <Sidebar />

        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

     
      <Footer />
    </div>
  );
}
