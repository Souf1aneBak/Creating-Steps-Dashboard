'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Form = {
  id: string;
  title: string;
  description: string;
};

export default function CommercialDashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await fetch('http://localhost:3001/api/forms');
        if (!res.ok) throw new Error('Failed to fetch forms');
        const data: Form[] = await res.json();
        setForms(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchForms();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Commercial Forms</h1>
        <p className="text-gray-600">Manage client forms and responses</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : forms.length === 0 ? (
        <div className="bg-white rounded-lg p-6 shadow-sm text-center border border-gray-100">
          <p className="text-gray-500">No forms available yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-700">Available Forms</h2>
            <span className="text-sm px-2 py-1 bg-teal-100 text-teal-800 rounded-full">
              {forms.length} {forms.length === 1 ? 'form' : 'forms'}
            </span>
          </div>

          {forms.map((form) => (
            <div 
              key={form.id} 
              className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow transition-shadow"
            >
              <h3 className="font-medium text-gray-900 mb-1">{form.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{form.description}</p>
              
              <div className="flex space-x-3">
                <Link
                  href={`/dashboard/commercial/forms/fill/${form.id}`}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors shadow-sm"
                >
                  Fill for Client
                </Link>
                <Link
                  href={`/dashboard/commercial/forms/responses/${form.id}`}
                  className="px-4 py-2 bg-teal-500 text-white text-sm rounded-md hover:bg-teal-600 transition-colors shadow-sm"
                >
                  View Responses
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}