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
  
  // State for form answers
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [previewRadioSelection, setPreviewRadioSelection] = useState<Record<string, 'Oui' | 'Non'>>({});
  const [previewCheckedOptions, setPreviewCheckedOptions] = useState<Record<string, number[]>>({});
  const [previewInputValues, setPreviewInputValues] = useState<Record<string, Record<string, string>>>({});
  const [previewRadioSelections, setPreviewRadioSelections] = useState<Record<string, Record<string, string>>>({});

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

    type FieldAnswer = {
      ouiNon: 'Oui' | 'Non';
      options: {
        option: string;
        checked: boolean;
        inputs: Record<string, string>;
        radio: string | null;
      }[];
    };

    const mergedAnswers: Record<string, FieldAnswer | any> = { ...answers };

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

  // Loading and error states
  if (!id) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <div className="text-red-500 text-5xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Missing Form ID</h2>
        <p className="text-gray-600">Please check the URL and try again.</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Loading Form Preview</h2>
        <p className="text-gray-500 mt-1">Please wait while we prepare your form...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Form</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (!formData) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <div className="text-gray-500 text-5xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Form Not Found</h2>
        <p className="text-gray-600">The requested form could not be located.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Form Preview</h1>
          <p className="text-lg text-gray-600">Complete the form for your client</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Client Selection */}
          <div className="p-6 border-b border-gray-200 bg-indigo-50">
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
              <div className="relative">
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg shadow-sm"
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
            </div>
          </div>

          {/* Form Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{formData.title}</h2>
            <p className="text-gray-600">{formData.description}</p>
          </div>

          {/* Form Sections */}
          {formData.sections.map((section) => (
            <div key={section.id} className="p-6 border-b border-gray-200 last:border-b-0">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full mr-3">
                    {section.title.charAt(0)}
                  </span>
                  {section.title}
                </h3>
              </div>

              {section.fields.map((field, index) => (
                <div key={index} className="mb-8 last:mb-0">
                  {/* Text/Email/Phone Inputs */}
                  {(field.field_id?.startsWith('text') || 
                    field.field_id?.startsWith('email') || 
                    field.field_id?.startsWith('phone')) && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type={field.field_id.startsWith('email') ? 'email' : 
                             field.field_id.startsWith('phone') ? 'tel' : 'text'}
                        placeholder={field.field_id.startsWith('email') ? "Enter your email" : 
                                     field.field_id.startsWith('phone') ? "Enter phone number" : "Enter your answer"}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={answers[field.id] || ""}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                      />
                    </div>
                  )}

                  {/* Checkbox Group */}
                  {field.field_id?.startsWith('checkbox') && (
                    <fieldset className="space-y-3">
                      <legend className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </legend>
                      <div className="space-y-2">
                        {field.options?.map((opt, i) => (
                          <div key={i} className="flex items-center">
                            <input
                              id={`checkbox-${field.id}-${i}`}
                              name={`checkbox-${field.id}`}
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                            <label htmlFor={`checkbox-${field.id}-${i}`} className="ml-3 block text-sm text-gray-700">
                              {opt}
                            </label>
                          </div>
                        ))}

                        {field.showOtherOption && (
                          <div className="flex items-center">
                            <input
                              id={`checkbox-${field.id}-other`}
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                            <div className="ml-3 flex-1">
                              <input
                                type="text"
                                placeholder="Other..."
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                            </div>
                          </div>
                        )}
                      </div>
                    </fieldset>
                  )}

                  {/* Radio Group */}
                  {field.field_id?.startsWith('radio') && (
                    <fieldset className="space-y-3">
                      <legend className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </legend>
                      <div className="space-y-2">
                        {field.options?.map((opt, i) => (
                          <div key={i} className="flex items-center">
                            <input
                              id={`radio-${field.id}-${i}`}
                              name={`radio-${field.id}`}
                              type="radio"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                              checked={answers[field.id] === opt}
                              onChange={() => setAnswers(prev => ({ ...prev, [field.id]: opt }))}
                            />
                            <label htmlFor={`radio-${field.id}-${i}`} className="ml-3 block text-sm text-gray-700">
                              {opt}
                            </label>
                          </div>
                        ))}

                        {field.showOtherOption && (
                          <div className="flex items-center">
                            <input
                              id={`radio-${field.id}-other`}
                              name={`radio-${field.id}`}
                              type="radio"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
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
                            <div className="ml-3 flex-1">
                              <input
                                type="text"
                                placeholder="Other..."
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                            </div>
                          </div>
                        )}
                      </div>
                    </fieldset>
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

                  {/* Question Group */}
                  {field.field_id?.startsWith('question-group') && (
                    <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                      <legend className="block text-sm font-medium text-gray-700 mb-3">
                        {field.label}
                      </legend>

                      <div className="flex gap-6 mb-4">
                        {['Oui', 'Non'].map((option) => (
                          <div key={option} className="flex items-center">
                            <input
                              id={`preview-conditional-${field.id}-${option}`}
                              type="radio"
                              name={`preview-conditional-${field.id}`}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                              checked={previewRadioSelection[field.id] === option}
                              onChange={() =>
                                setPreviewRadioSelection(prev => ({ ...prev, [field.id]: option }))
                              }
                            />
                            <label htmlFor={`preview-conditional-${field.id}-${option}`} className="ml-2 block text-sm text-gray-700">
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>

                      {previewRadioSelection[field.id] === 'Oui' &&
                        field.conditionalOptions?.map((opt, optIdx) => (
                          <div key={optIdx} className="mb-4 pl-4 border-l-2 border-indigo-300">
                            <div className="flex items-center">
                              <input
                                id={`checkbox-${field.id}-${optIdx}`}
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                              <label htmlFor={`checkbox-${field.id}-${optIdx}`} className="ml-3 block text-sm text-gray-700">
                                {opt.option}
                              </label>
                            </div>

                            {previewCheckedOptions[field.id]?.includes(optIdx) && (
                              <div className="mt-3 ml-7 space-y-4">
                                {opt.inputs?.map((input, inputIdx) => (
                                  <div key={inputIdx}>
                                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                      {input.label}
                                    </label>
                                    <input
                                      type="text"
                                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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

                                {opt.radioQuestion && (
                                  <div className="mt-4 space-y-2 border-t pt-3">
                                    <p className="text-sm font-medium text-gray-700">{opt.radioQuestion}</p>
                                    <div className="space-y-2 mt-2">
                                      {opt.radioOptions?.map((radioOpt, rIdx) => (
                                        <div key={rIdx} className="flex items-center">
                                          <input
                                            id={`preview-radio-${field.id}-${optIdx}-${rIdx}`}
                                            type="radio"
                                            name={`preview-radio-${field.id}-${optIdx}`}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
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
                                          <label htmlFor={`preview-radio-${field.id}-${optIdx}-${rIdx}`} className="ml-3 block text-sm text-gray-700">
                                            {radioOpt}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Select Dropdown */}
                  {field.field_id?.startsWith('select') && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <select
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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

                      {/* Conditional options */}
                      {field.conditionalOptions?.map((condOpt, optIdx) => (
                        condOpt.option === answers[field.id] && (
                          <div key={optIdx} className="mt-4 ml-4 space-y-3 border-l-2 border-indigo-300 pl-4">
                            {condOpt.inputs?.map((input, inputIdx) => (
                              <div key={inputIdx}>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                  {input.label}
                                </label>
                                <input
                                  type="text"
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                  value={answers[`${field.id}-${optIdx}-${inputIdx}`] || ""}
                                  onChange={(e) =>
                                    setAnswers(prev => ({
                                      ...prev,
                                      [`${field.id}-${optIdx}-${inputIdx}`]: e.target.value
                                    }))
                                  }
                                />
                              </div>
                            ))}

                            {condOpt.radioQuestion && (
                              <div className="mt-3 space-y-2">
                                <p className="text-sm font-medium text-gray-700">{condOpt.radioQuestion}</p>
                                <div className="space-y-2">
                                  {condOpt.radioOptions?.map((radioOpt, rIdx) => (
                                    <div key={rIdx} className="flex items-center">
                                      <input
                                        id={`select-radio-${field.id}-${optIdx}-${rIdx}`}
                                        type="radio"
                                        name={`select-radio-${field.id}-${optIdx}`}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        checked={answers[`${field.id}-radio-${optIdx}`] === radioOpt}
                                        onChange={() =>
                                          setAnswers(prev => ({
                                            ...prev,
                                            [`${field.id}-radio-${optIdx}`]: radioOpt
                                          }))
                                        }
                                      />
                                      <label htmlFor={`select-radio-${field.id}-${optIdx}-${rIdx}`} className="ml-2 block text-sm text-gray-700">
                                        {radioOpt}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {/* Date + Time Input */}
                  {field.field_id?.startsWith('time') && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="date"
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          value={answers[field.id]?.time || ''}
                          onChange={(e) =>
                            setAnswers(prev => ({
                              ...prev,
                              [field.id]: { ...(prev[field.id] || {}), time: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Submit Section */}
          <div className="px-6 py-5 bg-gray-50 text-right">
            <button
              type="submit"
              className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Submit Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}