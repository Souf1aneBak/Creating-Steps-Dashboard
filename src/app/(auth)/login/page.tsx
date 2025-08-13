'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      if (data.status === 'otp_required') {
        sessionStorage.setItem('pendingEmail', data.email);
        router.push('/verify-otp');
        return;
      }

      sessionStorage.setItem('userRole', data.role);
      sessionStorage.setItem('userToken', data.token);

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
      setError('Network error. Please try again.');
    }
  };

  return (
    <>
    {/* Navbar */}
      <nav className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-700">Ezza_Creative</div>
        <div className="space-x-6">
          <a
            href="/"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Home
          </a>
          <a
            href="/about"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            About
          </a>
          <a
            href="/login"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Login
          </a>
          <a
            href="/contact"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            contact
          </a>
        </div>
      </nav>
   
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 via-white to-blue-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        {/* Branding */}
        <h1 className="text-3xl font-extrabold text-center text-blue-600 mb-2">
          Ezza_Creative
        </h1>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Sign in to manage or fill your business forms
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        {/* Footer Links */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Having trouble?{' '}
          <a href="/contact" className="text-blue-600 hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
     </>
  );
}
