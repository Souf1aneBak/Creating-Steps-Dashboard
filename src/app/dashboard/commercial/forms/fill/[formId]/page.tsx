'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface FieldOption {
  id: string;
  value: string;
}

interface Field {
  id: string;
  field_id: string; 
  label: string;
  options?:string[];
  showOtherOption?: boolean;
  conditionalOptions?: {
    option: string;
    inputs?: { label: string }[];
    radioQuestion?: string;
    radioOptions?: string[];
  }[];
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

interface Client {
  id: string;
  companyName: string;
}

export default function PreviewFormPage() {
  const params = useParams();
  const id = Array.isArray(params.formId) ? params.formId[0] : params.formId;

  const [formData, setFormData] = useState<FormType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');

  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!id) return;

    async function fetchForm() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`http://localhost:3001/api/forms/${id}`);
        if (!res.ok) throw new Error(`Error fetching form: ${res.statusText}`);
        const data: FormType = await res.json();
        setFormData(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    async function fetchClients() {
      try {
        const res = await fetch(`http://localhost:3001/api/clients`);
        if (!res.ok) throw new Error(`Error fetching clients: ${res.statusText}`);
        const data: Client[] = await res.json();
        setClients(data);
      } catch (err: any) {
        console.error(err);
      }
    }

    fetchForm();
    fetchClients();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      alert('Please select a client before submitting.');
      return;
    }

    const payload = {
      formId: id,
      clientId,
      answers,
    };

    try {
      const res = await fetch('http://localhost:3001/api/form-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to submit form');

      alert('Form submitted successfully!');
      setAnswers({});
      setClientId('');
    } catch (err: any) {
      alert('Submission error: ' + err.message);
    }
  };

  if (!id) return <div className="text-center mt-10 text-red-500">❌ Missing form ID in URL</div>;
  if (loading) return <div className="text-center mt-10">⏳ Loading preview...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">❌ {error}</div>;
  if (!formData) return <div className="text-center mt-10 text-red-500">❌ Form not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
        {/* Client selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Select Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="border rounded px-3 py-2 w-full max-w-sm"
            required
          >
            <option value="">-- Choose a client --</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Form Title</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={formData.title} disabled />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Form Description</label>
          <textarea className="w-full border rounded px-3 py-2" value={formData.description} disabled />
        </div>

        {formData.sections.map((section) => (
          <div key={section.id} className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-bold mb-4">{section.title}</h3>

            {section.fields.map((field, index) => {
              return (
                <div key={index} className="mb-4">
                  <label className="block font-medium mb-1">{field.label}</label>

                  {field.field_id?.startsWith('text') && (
                    <input
                      type="text"
                      placeholder="Enter your answer"
                      className="border px-3 py-2 rounded w-full"
                      value={answers[field.id] || ''}
                      onChange={(e) =>
                        setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))
                      }
                    />
                  )}

                  {field.field_id?.startsWith('checkbox') && (
                    <div className="space-y-1">
                      {field.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Array.isArray(answers[field.id]) && answers[field.id].includes(opt)}
                            onChange={(e) => {
                              setAnswers(prev => {
                                const selected = Array.isArray(prev[field.id]) ? [...prev[field.id]] : [];
                                if (e.target.checked) {
                                  return { ...prev, [field.id]: [...selected, opt] };
                                } else {
                                  return { ...prev, [field.id]: selected.filter(o => o !== opt) };
                                }
                              });
                            }}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}

                      {field.showOtherOption && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={answers[`${field.id}-other`]?.checked || false}
                            onChange={(e) =>
                              setAnswers(prev => ({
                                ...prev,
                                [`${field.id}-other`]: {
                                  ...prev[`${field.id}-other`],
                                  checked: e.target.checked,
                                },
                              }))
                            }
                          />
                          <input
                            type="text"
                            placeholder="Other..."
                            className="border px-2 py-1 rounded"
                            value={answers[`${field.id}-other`]?.text || ''}
                            onChange={(e) =>
                              setAnswers(prev => ({
                                ...prev,
                                [`${field.id}-other`]: {
                                  ...prev[`${field.id}-other`],
                                  text: e.target.value,
                                },
                              }))
                            }
                            disabled={!answers[`${field.id}-other`]?.checked}
                          />
                        </label>
                      )}
                    </div>
                  )}

                  {field.field_id?.startsWith('radio') && (
                    <div className="space-y-1">
                      {field.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`radio-${section.id}-${index}`}
                            checked={answers[field.id] === opt}
                            onChange={() => setAnswers(prev => ({ ...prev, [field.id]: opt }))}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}

                      {field.showOtherOption && (
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={answers[`${field.id}-other`]?.checked || false}
                            onChange={(e) =>
                              setAnswers(prev => ({
                                ...prev,
                                [`${field.id}-other`]: {
                                  ...prev[`${field.id}-other`],
                                  checked: e.target.checked,
                                },
                              }))
                            }
                          />
                          <input
                            type="text"
                            placeholder="Other..."
                            className="border px-2 py-1 rounded"
                            value={answers[`${field.id}-other`]?.text || ''}
                            onChange={(e) =>
                              setAnswers(prev => ({
                                ...prev,
                                [`${field.id}-other`]: {
                                  ...prev[`${field.id}-other`],
                                  text: e.target.value,
                                },
                              }))
                            }
                            disabled={!answers[`${field.id}-other`]?.checked}
                          />
                        </label>
                      )}
                    </div>
                  )}

                  {/* Add other field types here if needed */}

                  {field.field_id?.startsWith('button') && (
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                      {field.label || 'Submit'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </form>
    </div>
  );
}
