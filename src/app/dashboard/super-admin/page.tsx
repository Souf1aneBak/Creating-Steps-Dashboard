'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Form = {
  id: number;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
};

export default function SuperAdminDashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<number | null>(null);

  const router = useRouter();

  
  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await fetch('http://localhost:3001/api/forms');
        if (!res.ok) throw new Error('Failed to fetch forms');
        const data: Form[] = await res.json();
        setForms(data);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    }

    fetchForms();
  }, []);

  const handleDeleteForm = async (formId: number) => {
    try {
      const res = await fetch(`http://localhost:3001/api/forms/${formId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete form');

      setForms(forms.filter((f) => f.id !== formId));
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Super Admin Dashboard</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <span className="mr-2">+</span> Create New Form
        </button>
      </div>

      {/* Forms List */}
      <div className="space-y-4">
        {forms.length === 0 ? (
          <p>No forms found.</p>
        ) : (
          forms.map((form) => (
            <div
              key={form.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold text-lg">{form.title}</h2>
                <p className="text-gray-600">{form.description}</p>
                <small className="text-gray-400">
                  Created by {form.createdBy} on {new Date(form.createdAt).toLocaleDateString()}
                </small>
              </div>
              <div className="space-x-2">
               <Link
  href={`/dashboard/super-admin/forms/view/${form.id}`}
  className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded"
>
  View
</Link>

                 <Link
  href={`/dashboard/super-admin/forms/edit/${form.id}`}
  className="text-yellow-600 hover:text-yellow-800 px-3 py-1 border border-yellow-200 rounded"
>
  Edit
</Link>
                <button
                  onClick={() => handleDeleteForm(form.id)}
                  className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Form Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Form</h2>
            <p className="text-gray-600">Redirect to form builder to create a new form.</p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  router.push('/form_builder');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Builder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (simplified) */}
      {editingFormId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editing Form ID: {editingFormId}</h2>
            <div className="space-y-4">
              <p>Edit interface here (to be implemented)</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingFormId(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    
                    setEditingFormId(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
