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
  options?: FieldOption[];
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

export default function PreviewFormPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [formData, setFormData] = useState<FormType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeValues, setTimeValues] = useState<Record<string, { date: string; time: string }>>({});
  const [previewRadioSelection, setPreviewRadioSelection] = useState<string>('');
  const [previewCheckedOptions, setPreviewCheckedOptions] = useState<number[]>([]);
  const [previewInputValues, setPreviewInputValues] = useState<Record<string, string>>({});
  const [previewRadioSelections, setPreviewRadioSelections] = useState<Record<string, string>>({});

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

    fetchForm();
  }, [id]);

  if (!id) return <div className="text-center mt-10 text-red-500">❌ Missing form ID in URL</div>;
  if (loading) return <div className="text-center mt-10">⏳ Loading preview...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">❌ {error}</div>;
  if (!formData) return <div className="text-center mt-10 text-red-500">❌ Form not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <form onSubmit={(e) => e.preventDefault()} className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
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
              const fieldIdStr = String(field.id);

              return (
                <div key={index} className="mb-4">
                  <label className="block font-medium mb-1">{field.label}</label>

                  {field.field_id?.startsWith('text') && (
                    <input
                      type="text"
                      placeholder="Entrez votre réponse"
                      className="border px-3 py-2 rounded w-full"
                    />
                  )}

                  {field.field_id?.startsWith('checkbox')&& (
                    <div className="space-y-1">
                      {field.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <input type="checkbox" />
                          <span>{opt.value}</span>
                        </label>
                      ))}
                      {field.showOtherOption && (
                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          <input type="text" placeholder="Autre..." className="border px-2 py-1 rounded" />
                        </label>
                      )}
                    </div>
                  )}

                  {field.field_id?.startsWith('radio') && (
                    <div className="space-y-1">
                      {field.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <input type="radio" name={`radio-${section.id}-${index}`} />
                          <span>{opt.value}</span>
                        </label>
                      ))}
                      {field.showOtherOption && (
                        <label className="flex items-center gap-2">
                          <input type="radio" name={`radio-${section.id}-${index}`} />
                          <input type="text" placeholder="Autre..." className="border px-2 py-1 rounded" />
                        </label>
                      )}
                    </div>
                  )}

                  {field.field_id?.startsWith('time') && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="date"
                        className="border px-3 py-2 rounded w-1/2"
                        value={timeValues[field.id]?.date || ''}
                        onChange={(e) =>
                          setTimeValues((prev) => ({
                            ...prev,
                            [field.id]: {
                              date: e.target.value,
                              time: prev[field.id]?.time || '',
                            },
                          }))
                        }
                      />
                      <input
                        type="time"
                        className="border px-3 py-2 rounded w-1/2"
                        value={timeValues[field.id]?.time || ''}
                        onChange={(e) =>
                          setTimeValues((prev) => ({
                            ...prev,
                            [field.id]: {
                              date: prev[field.id]?.date || '',
                              time: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  )}

                  {field.field_id?.startsWith('select') && (
                    <select className="border p-2 rounded w-full">
                      {field.options?.map((opt, i) => (
                        <option key={i} value={opt.value}>
  {opt.value}
</option>

                      ))}
                    </select>
                  )}

                  {field.field_id?.startsWith('question-group') && (
                    <div className="space-y-4 mt-2 border p-4 rounded bg-gray-50">
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name={`preview-conditional-${field.id}`}
                            checked={previewRadioSelection === 'Oui'}
                            onChange={() => setPreviewRadioSelection('Oui')}
                          />
                          Oui
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name={`preview-conditional-${field.id}`}
                            checked={previewRadioSelection === 'Non'}
                            onChange={() => setPreviewRadioSelection('Non')}
                          />
                          Non
                        </label>
                      </div>

                      {previewRadioSelection === 'Oui' &&
                        field.conditionalOptions?.map((opt, optIdx) => (
                          <div key={optIdx}>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={previewCheckedOptions.includes(optIdx)}
                                onChange={() => {
                                  if (previewCheckedOptions.includes(optIdx)) {
                                    setPreviewCheckedOptions((prev) => prev.filter((i) => i !== optIdx));
                                  } else {
                                    setPreviewCheckedOptions((prev) => [...prev, optIdx]);
                                  }
                                }}
                              />
                              <span>{opt.option}</span>
                            </label>

                            {previewCheckedOptions.includes(optIdx) && (
                              <div className="mt-2 space-y-4 pl-6">
                                {opt.inputs?.map((input, inputIdx) => (
                                  <div key={inputIdx}>
                                    {input.label && (
                                      <label className="block text-sm font-medium mb-1">{input.label}</label>
                                    )}
                                    <input
                                      type="text"
                                      className="border rounded px-2 py-1 w-full"
                                      placeholder="Réponse"
                                      value={previewInputValues[`${optIdx}-${inputIdx}`] || ''}
                                      onChange={(e) =>
                                        setPreviewInputValues((prev) => ({
                                          ...prev,
                                          [`${optIdx}-${inputIdx}`]: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                ))}

                                {opt.radioQuestion && (
                                  <div className="mt-4 space-y-2 border-t pt-2">
                                    <p className="font-medium">{opt.radioQuestion}</p>
                                    {opt.radioOptions?.map((radioOpt, rIdx) => (
                                      <label key={rIdx} className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name={`preview-radio-${field.id}-${optIdx}`}
                                          checked={previewRadioSelections[`${optIdx}`] === radioOpt}
                                          onChange={() =>
                                            setPreviewRadioSelections((prev) => ({
                                              ...prev,
                                              [`${optIdx}`]: radioOpt,
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

                  {field.field_id?.startsWith('button') && (
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                      {field.label || 'Soumettre'}
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
