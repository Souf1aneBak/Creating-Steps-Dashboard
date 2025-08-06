'use client';

import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function Home() {
     const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSuperadmin = async () => {
      try {
        const res = await fetch('http://localhost:3001/check-superadmin');
        const data = await res.json();

        if (!data.exists) {
          router.push('/setup');
        } else {
          setLoading(false); 
        }
      } catch (err) {
        console.error('Error checking superadmin:', err);
      }
    };

    checkSuperadmin();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Checking system setup...</p>
      </div>
    );
  }


  
  return (
    <div className="p-4">
      <h1>Welcome to the Dashboard</h1>
      <a href="/login" className="text-blue-500 underline">
        Go to Login
      </a>
    </div>
  );
}