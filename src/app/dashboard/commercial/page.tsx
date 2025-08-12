'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Form = {
  _id: string;
  title: string;
  description: string;
};

export default function CommercialDashboard() {
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await fetch('http://localhost:3001/api/forms');
        if (!res.ok) throw new Error('Failed to fetch forms');
        const data: Form[] = await res.json();
        setForms(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchForms();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📋 Commercial Dashboard</h1>

      {forms.length === 0 ? (
        <p>No forms available from Super Admin yet.</p>
      ) : (
        <div className="space-y-4">
          {forms.map((form) => (
            <div key={form._id} className="bg-white shadow p-4 rounded-lg flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{form.title}</h2>
                <p className="text-gray-600">{form.description}</p>
              </div>
              <div className="space-x-2">
                <Link href={`/dashboard/commercial/forms/fill/${form._id || form.id}`}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
  Fill for Client
</Link>
<Link href={`/dashboard/commercial/forms/responses/${form.id}`}
className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
  View Responses
</Link>

                <Link
                  href={`/quotes/generate/${form._id}`}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Generate Quote
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
