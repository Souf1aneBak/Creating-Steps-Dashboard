'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ROLES } from '@/constants/roles';


interface Field {
  id: string;
  label: string;
  field_id: string;
  options?: string[];
}

interface Section {
  id: string;
  title: string;
  fields: Field[];
}

interface FormType {
  _id: string;
  title: string;
  description: string;
  sections: Section[];
}

interface Answer {
  id: string;
  form_id: string;
  answers: Record<string, any>;
  submitted_at: string;
  status: string; 
  client_id:number;
}

export default function FormResponsesPage() {
  const params = useParams();
  const formId = Array.isArray(params.formId) ? params.formId[0] : params.formId;

  const [form, setForm] = useState<FormType | null>(null);
  const [responses, setResponses] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<{ id: number; companyName: string }[]>([]);

 
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
  async function fetchClients() {
    const res = await fetch('http://localhost:3001/api/clients');
    if (!res.ok) throw new Error('Failed to fetch clients');
    const data = await res.json();
    setClients(data);
  }
  fetchClients();
}, []);


  useEffect(() => {
    setRole(sessionStorage.getItem('userRole')); 
  }, []);

  useEffect(() => {
    if (!formId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const formRes = await fetch(`http://localhost:3001/api/forms/${formId}`);
        if (!formRes.ok) throw new Error('Failed to fetch form');
        const formData: FormType = await formRes.json();

        const responsesRes = await fetch(`http://localhost:3001/api/form-responses/form/${formId}`);
        if (!responsesRes.ok) throw new Error('Failed to fetch responses');
        const responsesData: Answer[] = await responsesRes.json();

        setForm(formData);
        setResponses(responsesData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [formId]);

  async function updateStatus(responseId: string, newStatus: string) {
    try {
      const res = await fetch(`http://localhost:3001/api/form-responses/${responseId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      setResponses((prev) =>
        prev.map((resp) =>
          resp.id === responseId ? { ...resp, status: newStatus } : resp
        )
      );
    } catch (err) {
      alert('Error updating status: ' + (err as Error).message);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!form) return <p>Form not found</p>;
  if (responses.length === 0) return <p>No responses submitted yet.</p>;

return (
  <div className="max-w-5xl mx-auto p-6 space-y-12">
    <h1 className="text-4xl font-extrabold mb-8 text-gray-900">
      {form.title} — Submitted Responses
    </h1>

    {responses.map((response) => {
      const client = clients.find(c => c.id === response.client_id);

      return (
        <div
          key={response.id}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300"
        >
          {/* Client info once per response */}
          <p className="mb-4 text-lg font-semibold text-blue-700">
            Client: {client ? client.companyName : 'Unknown client'}
          </p>

          <div className="flex justify-between items-center mb-6">
            <time
              dateTime={response.submitted_at}
              className="text-gray-500 text-sm font-medium"
              title={new Date(response.submitted_at).toLocaleString()}
            >
              Submitted: {new Date(response.submitted_at).toLocaleDateString()}
            </time>

            <div>
              <label htmlFor={`status-select-${response.id}`} className="sr-only">
                Update status
              </label>

              {role === 'assistant' || role === 'superadmin' ? (
                <select
                  id={`status-select-${response.id}`}
                  value={response.status}
                  onChange={(e) => updateStatus(response.id, e.target.value)}
                  className="rounded border border-gray-300 text-sm font-semibold px-3 py-1 cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="needs_correction">Needs Correction</option>
                </select>
              ) : (
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold
                    ${
                      response.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : response.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : response.status === 'needs_correction'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                >
                  {response.status.charAt(0).toUpperCase() + response.status.slice(1).replace('_', ' ')}
                </span>
              )}
            </div>
          </div>

          {form.sections.map((section) => (
            <section key={section.id} className="mb-6">
              <h2 className="text-2xl font-semibold mb-3 border-b border-gray-200 pb-1 text-gray-800">
                {section.title}
              </h2>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {section.fields
                  .filter(field => !field.field_id.startsWith('button'))
                  .map((field) => {
                    const answerValue = response.answers[field.id];
                    const formattedAnswer = Array.isArray(answerValue)
                      ? answerValue.join(', ')
                      : answerValue?.toString() ?? 'No answer';

                    return (
                      <div key={field.id} className="flex flex-col">
                        {/* Question */}
                        <dt className="text-gray-800 font-semibold">{field.label}</dt>
                        {/* Answer */}
                        <dd className="mt-1 text-gray-600 ml-4">{formattedAnswer}</dd>
                      </div>
                    );
                  })}
              </dl>
            </section>
          ))}
        </div>
      );
    })}
  </div>
);}
