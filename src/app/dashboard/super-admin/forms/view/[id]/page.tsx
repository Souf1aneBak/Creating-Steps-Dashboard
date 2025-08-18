'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface FieldOptionInput {
  label: string;
}

interface ConditionalOption {
  option: string;
  inputs?: FieldOptionInput[];
  radioQuestion?: string;
  radioOptions?: string[];
  radioSelection?: string;
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

export default function PreviewFormPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [formData, setFormData] = useState<FormType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States keyed by field.id to handle multiple question-groups independently
  const [previewRadioSelection, setPreviewRadioSelection] = useState<Record<string, string>>({});
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
        console.log('Loaded formData:', data);
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
              return (
                <div key={field.id} className="mb-4">
                  

                  {/* Text Input */}
                  {field.field_id?.startsWith('text') && (
                    <><label className="block font-medium mb-1">{field.label}</label>
                    <input
                      type="text"
                      placeholder="Entrez votre réponse"
                      className="border px-3 py-2 rounded w-full"
                    />
                    </>
                  )}
                  {field.field_id?.startsWith('email') && (
  <div className="space-y-1">
  <label className="block font-medium mb-2">{field.label}</label>
    
    <input
      type="email"
      placeholder="Entrez votre email"
      className="border px-3 py-2 rounded w-full"
      disabled={false}
    />
  </div>
)}

{/* Preview version for Phone Input */}
{field.field_id?.startsWith('phone') && (
  <div className="space-y-1">
  <label className="block font-medium mb-2">{field.label}</label>
   
    <input
      type="tel"
      placeholder="Entrez votre numéro de téléphone"
      className="border px-3 py-2 rounded w-full"
      disabled={false}
    />
  </div>
)}


                  {/* Checkbox Group */}
                  {field.field_id?.startsWith('checkbox') && (
                    <div className="space-y-1">
                      <label className="block font-medium mb-1">{field.label}</label>
                      {field.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <input type="checkbox" />
                          <span>{opt}</span>
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

                  {/* Radio Group */}
                  {field.field_id?.startsWith('radio') && (
                    
                    <div className="space-y-1">
                      <label className="block font-medium mb-1">{field.label}</label>
                      {field.options?.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2">
                          <input type="radio" name={`radio-${section.id}-${index}`} />
                          <span>{opt}</span>
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

                  {/* Time Input */}
                  {field.field_id?.startsWith('time') && (
                    <div className="flex gap-2 mt-2">
                     
                      <input
                        type="date"
                        className="border px-3 py-2 rounded w-1/2"
                      />
                      <input
                        type="time"
                        className="border px-3 py-2 rounded w-1/2"
                      />
                    </div>
                  )}

                  {/* Select Input */}
                  {field.field_id?.startsWith('select') && (
                    <> <label className="block font-medium mb-1">{field.label}</label>
                    <select className="border p-2 rounded w-full">
                      
                      {field.options?.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    </>
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

    {/* Conditional options shown only if Oui selected */}
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
                    return {
                      ...prev,
                      [field.id]: checked.filter(i => i !== optIdx),
                    };
                  } else {
                    return {
                      ...prev,
                      [field.id]: [...checked, optIdx],
                    };
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
                    placeholder="Réponse"
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

    <div className="flex items-center gap-4 mb-1">
      {field.conditionalOptions?.[0]?.radioOptions?.map((option) => (
        <label key={option} className="flex items-center gap-1">
          <input
            type="radio"
            name={`radio-${field.id}`}
            checked={previewRadioSelection[field.id] === option}
            onChange={() =>
              setPreviewRadioSelection(prev => ({ ...prev, [field.id]: option }))
            }
          />
          {option}
        </label>
      ))}
    </div>

    {previewRadioSelection[field.id]?.toLowerCase() === "yes" && (
      <div>
        <label className="block text-sm font-medium mb-1">
          {field.conditionalOptions?.[0]?.radioQuestion || "Veuillez préciser :"}
        </label>
        <input
          type="text"
          value={previewInputValues[field.id]?.[`0-0`] || ""}
          onChange={(e) =>
            setPreviewInputValues(prev => ({
              ...prev,
              [field.id]: { ...(prev[field.id] || {}), [`0-0`]: e.target.value },
            }))
          }
          placeholder="Expliquez pourquoi..."
          className="w-full border p-2 rounded"
        />
      </div>
    )}
  </div>
)}




                  {/* Submit button */}
                  
                </div>
              );
            })}
          </div>
        ))}
      </form>
    </div>
  );
}
