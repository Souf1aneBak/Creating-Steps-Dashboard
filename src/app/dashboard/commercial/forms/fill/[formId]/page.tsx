'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface ConditionalOption {
  option: string;
  inputs?: { label: string }[];
  radioQuestion?: string;
  radioOptions?: string[];
}

interface Field {
  id: string;
  field_id: string;
  label: string;
  options?: string[];
  showOtherOption?: boolean;
  conditionalOptions?: ConditionalOption[];
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

interface FieldAnswer {
  ouiNon: string;
  options: {
    option: string;
    checked: boolean;
    inputs: Record<string, string>;
    radio: string | null;
  }[];
}

interface Client {
  id: string;
  companyName: string;
}

export default function PreviewFormPage() {
  const params = useParams();
  const id = Array.isArray(params.formId) ? params.formId[0] : params.formId;

  const [formData, setFormData] = useState<FormType | null>(null);
  const [form, setForm] = useState<FormType | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');
  const [previewRadioSelection, setPreviewRadioSelection] = useState<Record<string, 'Oui' | 'Non'>>({});
const [previewCheckedOptions, setPreviewCheckedOptions] = useState<Record<string, number[]>>({});
const [previewInputValues, setPreviewInputValues] = useState<Record<string, Record<string, string>>>({});
const [previewRadioSelections, setPreviewRadioSelections] = useState<Record<string, Record<string, string>>>({});

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

  if (!formData) {
    alert('Form data is missing.');
    return;
  }

  // Type for question-group answers
  type FieldAnswer = {
    ouiNon: 'Oui' | 'Non';
    options: {
      option: string;
      checked: boolean;
      inputs: Record<string, string>;
      radio: string | null;
    }[];
  };

  // Start with already filled answers
  const mergedAnswers: Record<string, FieldAnswer | any> = { ...answers };

  // Loop over all sections & fields
  formData.sections.forEach((section: Section) => {
    section.fields.forEach((field: Field) => {
      if (field.field_id?.startsWith('question-group')) {
        const fieldId = field.id;

        const groupAnswer: FieldAnswer = {
          ouiNon: previewRadioSelection[fieldId] || 'Non',
          options: [],
        };

        if (groupAnswer.ouiNon === 'Oui') {
          (field.conditionalOptions || []).forEach((opt, optIdx) => {
            const checked = previewCheckedOptions[fieldId]?.includes(optIdx) || false;
            if (checked) {
              const optionData = {
                option: opt.option,
                checked: true,
                inputs: {} as Record<string, string>,
                radio: previewRadioSelections[fieldId]?.[`${optIdx}`] || null,
              };

              (opt.inputs || []).forEach((input, inputIdx) => {
                const value = previewInputValues[fieldId]?.[`${optIdx}-${inputIdx}`] || '';
                optionData.inputs[input.label] = value;
              });

              groupAnswer.options.push(optionData);
            }
          });
        }

        mergedAnswers[fieldId] = groupAnswer;
      }
    });
  });

  const payload = {
    formId: id,
    clientId,
    answers: mergedAnswers,
  };

  try {
    const res = await fetch('http://localhost:3001/api/form-responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to submit form');

    alert('Form submitted successfully!');

    // Reset all states
    setAnswers({});
    setClientId('');
    setPreviewRadioSelection({});
    setPreviewCheckedOptions({});
    setPreviewInputValues({});
    setPreviewRadioSelections({});
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
                  

                 {/* Text input */}
{field.field_id?.startsWith('text') && (
  <div className="mb-4">
    <label className="block font-medium mb-1">{field.label}</label>
    <input
      type="text"
      placeholder="Entrez votre réponse"
      className="border px-3 py-2 rounded w-full"
      value={answers[field.id] || ""}
      onChange={(e) =>
        setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))
      }
    />
  </div>
)}

{/* Email input */}
{field.field_id?.startsWith('email') && (
  <div className="mb-4">
    <label className="block font-medium mb-1">{field.label}</label>
    <input
      type="email"
      placeholder="Entrez votre email"
      className="border px-3 py-2 rounded w-full"
      value={answers[field.id] || ""}
      onChange={(e) =>
        setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))
      }
    />
  </div>
)}

{/* Phone input */}
{field.field_id?.startsWith('phone') && (
  <div className="mb-4">
    <label className="block font-medium mb-1">{field.label}</label>
    <input
      type="tel"
      placeholder="Entrez votre numéro de téléphone"
      className="border px-3 py-2 rounded w-full"
      value={answers[field.id] || ""}
      onChange={(e) =>
        setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))
      }
    />
  </div>
)}


                  {field.field_id?.startsWith('checkbox') && (
                    <div className="space-y-1">
                      <label className="block font-medium mb-1">{field.label}</label>
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
                      <label className="block font-medium mb-1">{field.label}</label>
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

                  {field.field_id?.startsWith('question-group') && (
        <div className="border p-4 rounded bg-gray-50 mt-4">
          <label className="block font-medium mb-2">{field.label}</label>

          {/* Oui / Non radio buttons */}
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name={`preview-conditional-${field.id}`}
                checked={previewRadioSelection[field.id] === 'Oui'}
                onChange={() =>
                  setPreviewRadioSelection(prev => ({ ...prev, [field.id]: 'Oui' }))
                }
              />
              Oui
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name={`preview-conditional-${field.id}`}
                checked={previewRadioSelection[field.id] === 'Non'}
                onChange={() =>
                  setPreviewRadioSelection(prev => ({ ...prev, [field.id]: 'Non' }))
                }
              />
              Non
            </label>
          </div>

          {/* Conditional options only if Oui */}
          {previewRadioSelection[field.id] === 'Oui' &&
            field.conditionalOptions?.map((opt, optIdx) => (
              <div key={optIdx} className="mb-4 pl-4 border-l-2 border-blue-300">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={previewCheckedOptions[field.id]?.includes(optIdx) || false}
                    onChange={() => {
                      setPreviewCheckedOptions(prev => {
                        const checked = prev[field.id] || [];
                        if (checked.includes(optIdx)) {
                          return { ...prev, [field.id]: checked.filter(i => i !== optIdx) };
                        } else {
                          return { ...prev, [field.id]: [...checked, optIdx] };
                        }
                      });
                    }}
                  />
                  {opt.option}
                </label>

                {/* Nested inputs for checked options */}
                {previewCheckedOptions[field.id]?.includes(optIdx) && (
                  <div className="mt-2 ml-6 space-y-3">
                    {opt.inputs?.map((input, inputIdx) => (
                      <div key={inputIdx}>
                        <label className="block text-sm font-medium mb-1">{input.label}</label>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          value={previewInputValues[field.id]?.[`${optIdx}-${inputIdx}`] || ''}
                          onChange={e =>
                            setPreviewInputValues(prev => ({
                              ...prev,
                              [field.id]: {
                                ...(prev[field.id] || {}),
                                [`${optIdx}-${inputIdx}`]: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    ))}

                    {/* Nested radio question */}
                    {opt.radioQuestion && (
                      <div className="mt-4 space-y-2 border-t pt-2">
                        <p className="font-medium">{opt.radioQuestion}</p>
                        {opt.radioOptions?.map((radioOpt, rIdx) => (
                          <label key={rIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`preview-radio-${field.id}-${optIdx}`}
                              checked={previewRadioSelections[field.id]?.[`${optIdx}`] === radioOpt}
                              onChange={() =>
                                setPreviewRadioSelections(prev => ({
                                  ...prev,
                                  [field.id]: {
                                    ...(prev[field.id] || {}),
                                    [`${optIdx}`]: radioOpt,
                                  },
                                }))
                              }
                            />
                            <span>{radioOpt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    {field.field_id.startsWith("yes_no") && (
  <div className="space-y-2 mt-1">
    <label className="block text-sm font-medium mb-1">{field.label}</label>

    {/* Radio options */}
    <div className="flex items-center gap-4 mb-1">
      {field.conditionalOptions?.[0]?.radioOptions?.map((option) => (
        <label key={option} className="flex items-center gap-1">
          <input
            type="radio"
            name={`radio-${field.id}`}
            checked={answers[field.id] === option}
            onChange={() =>
              setAnswers(prev => ({ ...prev, [field.id]: option }))
            }
          />
          {option}
        </label>
      ))}
    </div>

    {/* Show inputs only if "Yes" is selected */}
    {answers[field.id]?.toLowerCase() === "yes" && (
      <div className="space-y-3 mt-2">
        <label className="block text-sm font-medium mb-1">
          {field.conditionalOptions?.[0]?.radioQuestion || "Veuillez préciser :"}
        </label>

        {/* Render each input in the group */}
        {field.conditionalOptions?.[0]?.inputs?.map((input, inputIdx) => (
          <input
            key={inputIdx}
            type="text"
            value={answers[`${field.id}-${inputIdx}`] || ""}
            onChange={(e) =>
              setAnswers(prev => ({
                ...prev,
                [`${field.id}-${inputIdx}`]: e.target.value
              }))
            }
            placeholder={input.label || `Réponse ${inputIdx + 1}`}
            className="w-full border p-2 rounded"
          />
        ))}
      </div>
    )}
  </div>
)}
{field.field_id?.startsWith('select') && (
  <div className="mb-4">
    <label className="block font-medium mb-1">{field.label}</label>
    <select
      className="border p-2 rounded w-full"
      value={answers[field.id] || ""}
      onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
    >
      <option value="">-- Select --</option>
      {field.options?.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>

    {/* Conditional options rendered if the selected value has them */}
    {field.conditionalOptions?.map((condOpt, optIdx) => (
      condOpt.option === answers[field.id] && (
        <div key={optIdx} className="mt-2 ml-4 space-y-2 border-l-2 border-blue-300 pl-2">
          {/* Inputs for this option */}
          {condOpt.inputs?.map((input, inputIdx) => (
            <div key={inputIdx}>
              <label className="block text-sm font-medium mb-1">{input.label}</label>
              <input
                type="text"
                value={answers[`${field.id}-${optIdx}-${inputIdx}`] || ""}
                onChange={(e) =>
                  setAnswers(prev => ({
                    ...prev,
                    [`${field.id}-${optIdx}-${inputIdx}`]: e.target.value
                  }))
                }
                placeholder="Réponse"
                className="w-full border p-2 rounded"
              />
            </div>
          ))}

          {/* Optional nested radio question */}
          {condOpt.radioQuestion && (
            <div className="mt-2 space-y-2">
              <p className="font-medium">{condOpt.radioQuestion}</p>
              {condOpt.radioOptions?.map((radioOpt, rIdx) => (
                <label key={rIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`select-radio-${field.id}-${optIdx}`}
                    checked={answers[`${field.id}-radio-${optIdx}`] === radioOpt}
                    onChange={() =>
                      setAnswers(prev => ({
                        ...prev,
                        [`${field.id}-radio-${optIdx}`]: radioOpt
                      }))
                    }
                  />
                  <span>{radioOpt}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )
    ))}
  </div>
)}


                 


{/* Date + Time input */}
{field.field_id?.startsWith('time') && (
  <div className="flex gap-2 mt-2">
    <input
  type="date"
  className="border px-3 py-2 rounded w-1/2"
  value={answers[field.id]?.date || ''}
  onChange={(e) =>
    setAnswers(prev => ({
      ...prev,
      [field.id]: { ...(prev[field.id] || {}), date: e.target.value },
    }))
  }
/>
<input
  type="time"
  className="border px-3 py-2 rounded w-1/2"
  value={answers[field.id]?.time || ''}
  onChange={(e) =>
    setAnswers(prev => ({
      ...prev,
      [field.id]: { ...(prev[field.id] || {}), time: e.target.value },
    }))
  }
/>

  </div>
)}


                </div>
              );
            })}
          </div>
        ))}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
    Submit All
  </button>
      </form>
    </div>
  );
}
