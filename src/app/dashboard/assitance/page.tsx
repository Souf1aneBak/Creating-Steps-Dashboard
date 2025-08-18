'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiFileText, FiAlertCircle, FiClock, FiCheckCircle, FiBarChart2, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';

type Form = {
  id: string;
  title: string;
  description: string;
  responseCount?: number;
  lastResponse?: string;
  status?: 'draft' | 'published' | 'archived';
};

export default function CommercialDashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  useEffect(() => {
    async function fetchForms() {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:3001/api/forms');
        if (!res.ok) throw new Error('Failed to fetch forms');
        const data: Form[] = await res.json();
        setForms(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching forms');
      } finally {
        setLoading(false);
      }
    }
    fetchForms();
  }, []);

  const filteredForms = forms.filter(form => {
    if (filter === 'all') return true;
    return form.status === filter;
  });

  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading forms</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try again <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assistant Dashboard</h1>
          
        </div>
        
        
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md text-sm ${filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
        >
          All Forms
        </button>
        
       
       
      </div>

      {filteredForms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <FiFileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {filter === 'all' ? 'No forms available' : `No ${filter} forms`}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            {filter === 'all' 
              ? 'Get started by creating your first form' 
              : `You don't have any ${filter} forms at the moment`}
          </p>
          <Link
            href="/dashboard/commercial/forms/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <FiPlus className="mr-2" size={16} />
            Create New Form
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredForms.map((form) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <FiFileText className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                          {form.title}
                          {form.status}
                        </h2>
                        <p className="text-gray-600 mt-1">{form.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiBarChart2 className="mr-1" size={14} />
                      <span>{form.responseCount || 0} responses</span>
                    </div>
                    {form.lastResponse && (
                      <div className="flex items-center text-sm text-gray-500">
                        <FiClock className="mr-1" size={14} />
                        <span>
                          Last response: {new Date(form.lastResponse).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <Link
                      href={`/dashboard/commercial/forms/responses/${form.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
                    >
                      <FiBarChart2 size={16} />
                      View Analytics
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}