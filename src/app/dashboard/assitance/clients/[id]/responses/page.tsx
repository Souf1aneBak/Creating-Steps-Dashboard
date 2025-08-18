'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Response {
  id: number;
  form_id: number;
  answers: Record<string, any>;
  submitted_at: string;
  status: string;
}

export default function ClientResponsesPage() {
  const params = useParams();
  const clientId = params.id;
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/clients/${clientId}/responses`)
      .then(res => res.json())
      .then(setResponses)
      .catch(console.error);
  }, [clientId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Client Responses</h1>

      {responses.length === 0 ? (
        <p>No responses found for this client.</p>
      ) : (
        <div className="space-y-4">
          {responses.map((response) => (
            <div
              key={response.id}
              className="border rounded-md p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Form ID: {response.form_id}</span>
                <span
                  className={`px-2 py-1 rounded text-white text-sm ${
                    response.status === 'approved'
                      ? 'bg-green-500'
                      : response.status === 'pending'
                      ? 'bg-yellow-500'
                      : response.status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-gray-500'
                  }`}
                >
                  {response.status}
                </span>
              </div>

              <div className="mb-2 text-gray-600 text-sm">
                Submitted on:{' '}
                {new Date(response.submitted_at).toLocaleString()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(response.answers).map(([fieldLabel, value]) => (
  <div key={fieldLabel} className="bg-gray-100 p-2 rounded flex justify-between">
    <span className="font-medium">{fieldLabel}:</span>
    <span>{value}</span>
  </div>
))}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
