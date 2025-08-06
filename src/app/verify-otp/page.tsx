'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function VerifyOtp() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Get pending email from sessionStorage
    const storedEmail = sessionStorage.getItem('pendingEmail');
    if (!storedEmail) {
      router.push('/login');
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Verification failed');
        return;
      }

      // Save user info
      sessionStorage.setItem('userRole', data.role);
      sessionStorage.setItem('userToken', data.token);
      sessionStorage.removeItem('pendingEmail'); // cleanup

      // Redirect based on role
      if (data.role === 'superadmin') {
        router.push('/dashboard/super-admin');
      } else if (data.role === 'commercial') {
        router.push('/dashboard/commercial');
      } else if (data.role === 'assistance') {
        router.push('/dashboard/assistance');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Verify OTP</h1>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Enter the code sent to your email</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full mb-6 px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
