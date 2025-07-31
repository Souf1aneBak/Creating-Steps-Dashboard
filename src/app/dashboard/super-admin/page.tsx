'use client';
import { useState } from 'react';
import Link from 'next/link';
import BuilderPage from '@/components/dashboard/Form_builder';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createdSteps, setCreatedSteps] = useState<string[]>([]);
  const [editingStep, setEditingStep] = useState<string | null>(null);

  const router=useRouter();

  const handleCreateStep = () => {
    const newStep = `Step ${createdSteps.length + 1}`;
    setCreatedSteps([...createdSteps, newStep]);
    setIsCreateModalOpen(false);
  };

  const handleDeleteStep = (step: string) => {
    setCreatedSteps(createdSteps.filter(s => s !== step));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Super Admin Dashboard</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <span className="mr-2">+</span> Create Steps
        </button>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {createdSteps.map((step) => (
          <div key={step} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <span className="font-medium">{step}</span>
            <div className="space-x-2">
              <Link 
                href={`/dashboard/super-admin/steps/view?step=${encodeURIComponent(step)}`}
                className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded"
              >
                View
              </Link>
              <button 
                onClick={() => setEditingStep(step)}
                className="text-yellow-600 hover:text-yellow-800 px-3 py-1 border border-yellow-200 rounded"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteStep(step)}
                className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Steps Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Creating Steps Page</h2>
            <div className="space-y-4">
              <p className="text-gray-600">You are about to be redirected to the form builder.</p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Step
                </button>
              
<button
  onClick={() => {
    setIsCreateModalOpen(false);
    router.push('/dashboard/super-admin/create-steps'); 
  }}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  Go to Builder
</button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editing: {editingStep}</h2>
            <div className="space-y-4">
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p>Edit interface would go here</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingStep(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle edit logic here
                    setEditingStep(null);
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