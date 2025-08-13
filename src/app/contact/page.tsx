'use client';

import { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to send message');
        setStatus('error');
        return;
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError('Network error. Please try again later.');
      setStatus('error');
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
   
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 via-white to-blue-50 px-7 py-20">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-600 drop-shadow-lg">
        Contact Support
      </h1>

      <p className="max-w-xl text-gray-700 mb-8 text-center">
        Need help or have questions? Fill out the form below and our support team will get back to you as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        {status === 'success' && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            Your message has been sent successfully!
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <label className="block mb-2 font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full mb-4 px-3 py-2 border rounded"
          placeholder="Your full name"
        />

        <label className="block mb-2 font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-3 py-2 border rounded"
          placeholder="you@example.com"
        />

        <label className="block mb-2 font-medium text-gray-700">Message</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          rows={5}
          className="w-full mb-6 px-3 py-2 border rounded resize-y"
          placeholder="Write your message here..."
        />

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
     </>
  );
}
