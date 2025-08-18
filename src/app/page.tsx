"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSuperadmin = async () => {
      try {
        const res = await fetch("http://localhost:3001/check-superadmin");
        const data = await res.json();

        if (!data.exists) {
          router.push("/setup");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error checking superadmin:", err);
      }
    };

    checkSuperadmin();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-white">
        <p className="text-gray-500 text-sm animate-pulse">
          Checking system setup...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-100 via-white to-blue-50">
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
            href="/contact"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            contact
          </a>
          <a
            href="/login"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Login
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-grow px-7 py-20">
        <h1 className="text-5xl font-extrabold mb-6 text-blue-600 drop-shadow-lg text-center">
          The Ultimate Form Builder for Your Business ✨
        </h1>

        <p className="text-gray-700 max-w-2xl text-lg mb-12 text-center animate-fadeIn">
          One permanent <strong>Super Admin</strong> designs professional,
          drag-and-drop forms.  
          Your <strong>Commercial Team</strong> fills them in for clients —
          fast, accurate, and paper-free.  
          Works for any industry.
        </p>

        <ul className="max-w-2xl text-left text-gray-700 mb-10 space-y-3">
          <li>
            👑 <strong>Super Admin:</strong> Create powerful custom forms with
            ease.
          </li>
          <li>
            💼 <strong>Commercial Team:</strong> Fill in forms directly for
            clients.
          </li>
          <li>
            🌍 <strong>Any Industry:</strong> Retail, healthcare, events,
            education, and more.
          </li>
        </ul>

        <img
          src="/welcome2.svg"
          alt="Welcome illustration"
          className="w-80 max-w-full mb-12 animate-bounce"
        />

        <a
          href="/login"
          className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition"
        >
          Get Started
        </a>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Ezza_Creative. All rights reserved.
      </footer>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease forwards;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-bounce {
          animation: bounce 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
