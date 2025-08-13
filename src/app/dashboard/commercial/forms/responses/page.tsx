'use client';

import { useEffect, useState } from 'react';

interface FormResponse {
  id: string;
  formTitle: string;
  submittedAt: string;
  status: string; // e.g. 'pending', 'approved', etc.
  clientName:string;
  answersSummary: string; // short summary of answers
}

export default function FormResponsesPage() {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResponses() {
      try {
        const res = await fetch('http://localhost:3001/api/form-responses');

        if (!res.ok) throw new Error('Failed to fetch responses');
        const data: FormResponse[] = await res.json();
        setResponses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchResponses();
  }, []);

  if (loading) return <p>Loading responses...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (responses.length === 0) return <p>No form responses found.</p>;

  return (
  <div className="p-6 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-6">Form Responses</h1>
    <ul className="space-y-4">
      {responses.map(({ id, formTitle, submittedAt, status, answersSummary, clientName }) => (
  <li key={id} className="p-4 border rounded shadow hover:shadow-md transition">
    <h2 className="font-semibold text-lg">{formTitle}</h2>
    <p className="text-sm text-gray-600">Submitted at: {new Date(submittedAt).toLocaleString()}</p>
    <p>Client: <span className="font-medium">{clientName || 'Unknown Client'}</span></p>
    <p>Status: <span className={`font-medium ${status === 'approved' ? 'text-green-600' : status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>{status}</span></p>
    <p className="mt-2 text-gray-700">{answersSummary}</p>

    {/* Download PDF Report button */}
    <a
      href={`http://localhost:3001/api/reports/generate/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
    >
      Download Report (PDF)
    </a>
  </li>
))}

    </ul>
  </div>
);
}
