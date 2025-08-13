'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';

interface FieldOptionInput {
  label: string;
}

interface ConditionalOption {
  option: string;
  inputs?: FieldOptionInput[];
  radioQuestion?: string;
  radioOptions?: string[];
}

interface Field {
  id: string;
  field_id: string;
  label: string;
  type: string;
  options?: string[];
  showOtherOption?: boolean;
  conditionalOptions?: ConditionalOption[]; // add this!
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
  createdBy: string;
  createdAt?: string;
}

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();

  const formId = Array.isArray(params.formId) ? params.formId[0] : params.formId;

  const [form, setForm] = useState<FormType | null>(null);
  const [loading, setLoading] = useState(true);
  // States keyed by field.id to handle multiple question-groups independently
  const [previewRadioSelection, setPreviewRadioSelection] = useState<Record<string, string>>({});
  const [previewCheckedOptions, setPreviewCheckedOptions] = useState<Record<string, number[]>>({});
  const [previewInputValues, setPreviewInputValues] = useState<Record<string, Record<string, string>>>({});
  const [previewRadioSelections, setPreviewRadioSelections] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
  if (!formId) return;

  async function fetchForm() {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/forms/${formId}`);
      if (!res.ok) throw new Error('Failed to fetch form');
      const data: FormType = await res.json();
      console.log('Fetched form data:', data);
      setForm(data);

      // Initialize preview states based on fetched data:
      const initialRadioSelection: Record<string, string> = {};
      const initialCheckedOptions: Record<string, number[]> = {};
      const initialInputValues: Record<string, Record<string, string>> = {};

      data.sections.forEach(section => {
        section.fields.forEach(field => {
          if (field.field_id?.startsWith('question-group')) {
            // Default radio selection to 'Non' or existing state
            initialRadioSelection[field.id] = 'Non';

            // For checked options, assume all selected initially or customize as needed
            initialCheckedOptions[field.id] = [];

            // For inputs, prepare nested input labels keyed by `${optionIndex}-${inputIndex}`
            const inputsMap: Record<string, string> = {};

            field.conditionalOptions?.forEach((condOpt, optIdx) => {
              // Optional: default to selecting first option
              // initialCheckedOptions[field.id].push(optIdx);

              condOpt.inputs?.forEach((input, inputIdx) => {
                inputsMap[`${optIdx}-${inputIdx}`] = input.label;
              });
            });

            initialInputValues[field.id] = inputsMap;
          }
        });
      });

      setPreviewRadioSelection(initialRadioSelection);
      setPreviewCheckedOptions(initialCheckedOptions);
      setPreviewInputValues(initialInputValues);

    } catch (error) {
      console.error('Failed to fetch form:', error);
      setForm(null);
    } finally {
      setLoading(false);
    }
  }

  fetchForm();
}, [formId]);
  if (!formId)
    return (
      <div className="text-center mt-10 text-red-500">❌ Missing form ID in URL</div>
    );

  if (loading) return <div className="text-center mt-10">⏳ Loading...</div>;

  if (!form)
    return <div className="text-center mt-10 text-red-500">❌ Form not found.</div>;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const updateSectionTitle = (index: number, newTitle: string) => {
    if (!form) return;
    const newSections = [...form.sections];
    newSections[index] = { ...newSections[index], title: newTitle };
    setForm({ ...form, sections: newSections });
  };

  const updateField = (
    sectionId: string,
    fieldIndex: number,
    updatedField: Partial<Field>
  ) => {
    if (!form) return;
    const newSections = form.sections.map((section) => {
      if (section.id !== sectionId) return section;
      const newFields = [...section.fields];
      newFields[fieldIndex] = { ...newFields[fieldIndex], ...updatedField };
      return { ...section, fields: newFields };
    });
    setForm({ ...form, sections: newSections });
  };

  const handleSave = async () => {
    if (!formId || !form) return;

    try {
      const res = await fetch(`http://localhost:3001/api/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to update form');

      alert('Form updated!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to update form:', error);
      alert('Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="max-w-4xl mx-auto bg-white p-8 rounded shadow"
      >
        {/* Form Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Form Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Form Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Form Description</label>
          <textarea
            name="description"
            value={form.description || ''}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Sections */}
        {form.sections.map((section, sIndex) => (
          <div
            key={section.id}
            className="bg-white p-4 rounded shadow mb-6 border border-gray-200"
          >
            <label className="block text-sm font-medium mb-2">Section Title</label>
            
            <input
              type="text"
              value={section.title}
              onChange={(e) => updateSectionTitle(sIndex, e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />

            {/* Fields */}
            {section.fields.map((field, fIndex) => {
              const fieldIdStr = String(field.id);

              return (
                <div key={field.id} className="mb-4 relative">
                   
                  <label className="block text-sm font-medium mb-1">Field Label</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) =>
                      updateField(section.id, fIndex, { label: e.target.value })
                    }
                    className="w-full border rounded px-3 py-2 mb-2"
                  />
                   
                  {/* Checkbox field */}
                  {field.field_id?.startsWith('checkbox') && (
                    <div>
                      <label>Question:</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          updateField(section.id, fIndex, { label: e.target.value })
                        }
                        className="border p-2 rounded w-full"
                      />

                      <label>Options:</label>
                      {field.options?.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2 mb-1">
                          <input type="checkbox" disabled />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updatedOptions = [...(field.options || [])];
                              updatedOptions[optIndex] = e.target.value;
                              updateField(section.id, fIndex, { options: updatedOptions });
                            }}
                            className="border px-2 py-1 rounded w-full"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedOptions =
                                field.options?.filter((_, i) => i !== optIndex) || [];
                              updateField(section.id, fIndex, { options: updatedOptions });
                            }}
                            className="text-red-500 text-sm"
                          >
                            ❌
                          </button>
                        </div>
                      ))}

                      {!field.showOtherOption ? (
                        <button
                          type="button"
                          onClick={() =>
                            updateField(section.id, fIndex, { showOtherOption: true })
                          }
                          className="text-blue-600 text-sm hover:underline mt-2"
                        >
                          ➕ Ajouter une option “Autre”
                        </button>
                      ) : (
                        <div className="flex items-center mt-2">
                          <input type="checkbox" disabled />
                          <input
                            disabled
                            className="ml-2 border px-2 py-1 rounded w-full"
                            value="Autre..."
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateField(section.id, fIndex, { showOtherOption: false })
                            }
                            className="text-red-500 ml-2 text-sm"
                          >
                            ❌
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Radio field */}
                  {field.field_id?.startsWith('radio') && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1">Question:</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          updateField(section.id, fIndex, { label: e.target.value })
                        }
                        className="w-full border p-2 rounded"
                      />

                      <label className="block mt-3 text-sm font-medium">Options:</label>
                      {field.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2 mb-1">
                          <input type="radio" disabled />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const updatedOptions = [...(field.options || [])];
                              updatedOptions[optIndex] = e.target.value;
                              updateField(section.id, fIndex, { options: updatedOptions });
                            }}
                            className="border px-2 py-1 rounded w-full"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedOptions =
                                field.options?.filter((_, i) => i !== optIndex) || [];
                              updateField(section.id, fIndex, { options: updatedOptions });
                            }}
                            className="text-red-500 text-sm"
                          >
                            ❌
                          </button>
                        </div>
                      ))}

                      {!field.showOtherOption ? (
                        <button
                          type="button"
                          onClick={() =>
                            updateField(section.id, fIndex, { showOtherOption: true })
                          }
                          className="text-blue-600 text-sm hover:underline mt-2"
                        >
                          ➕ Ajouter une option “Autre”
                        </button>
                      ) : (
                        <div className="flex items-center mt-2">
                          <input type="radio" disabled />
                          <input
                            disabled
                            className="ml-2 border px-2 py-1 rounded w-full"
                            value="Autre..."
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateField(section.id, fIndex, { showOtherOption: false })
                            }
                            className="text-red-500 ml-2 text-sm"
                          >
                            ❌
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {field.field_id?.startsWith('question-group') && (
  <div className="border p-4 rounded bg-gray-50 mt-4">
    <label className="block font-medium mb-2">{field.label}</label>

    {/* Oui / Non radio buttons to control showing conditional options */}
    <div className="flex gap-4 mb-4">
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name={`edit-conditional-${field.id}`}
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
          name={`edit-conditional-${field.id}`}
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
          {/* Editable option text */}
          <label className="flex items-center gap-2 mb-1">
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

                // You can update form state here if needed
              }}
            />
            <input
              type="text"
              value={opt.option}
              onChange={(e) => {
                const newCondOpts = [...(field.conditionalOptions || [])];
                newCondOpts[optIdx] = { ...newCondOpts[optIdx], option: e.target.value };
                updateField(section.id, fIndex, { conditionalOptions: newCondOpts });
              }}
              className="border px-2 py-1 rounded w-full"
            />
          </label>

          {/* Nested inputs for checked options */}
          {previewCheckedOptions[field.id]?.includes(optIdx) && (
            <div className="mt-2 ml-6 space-y-3">
              {opt.inputs?.map((input, inputIdx) => (
                <div key={inputIdx}>
                  <label className="block text-sm font-medium mb-1">Input Label</label>
                  <input
                    type="text"
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Réponse"
                    value={input.label}
                    onChange={e => {
                      const newCondOpts = [...(field.conditionalOptions || [])];
                      const newInputs = [...(newCondOpts[optIdx].inputs || [])];
                      newInputs[inputIdx] = { label: e.target.value };
                      newCondOpts[optIdx] = { ...newCondOpts[optIdx], inputs: newInputs };
                      updateField(section.id, fIndex, { conditionalOptions: newCondOpts });
                    }}
                  />
                </div>
              ))}

              <button
                type="button"
                className="text-blue-600 text-sm mt-1"
                onClick={() => {
                  const newCondOpts = [...(field.conditionalOptions || [])];
                  const newInputs = [...(newCondOpts[optIdx].inputs || []), { label: '' }];
                  newCondOpts[optIdx] = { ...newCondOpts[optIdx], inputs: newInputs };
                  updateField(section.id, fIndex, { conditionalOptions: newCondOpts });
                }}
              >
                ➕ Add Input
              </button>

              {/* Nested radio question */}
              {opt.radioQuestion && (
                <div className="mt-4 space-y-2 border-t pt-2">
                  <label className="font-medium">Radio Question</label>
                  <input
                    type="text"
                    value={opt.radioQuestion}
                    onChange={(e) => {
                      const newCondOpts = [...(field.conditionalOptions || [])];
                      newCondOpts[optIdx] = { ...newCondOpts[optIdx], radioQuestion: e.target.value };
                      updateField(section.id, fIndex, { conditionalOptions: newCondOpts });
                    }}
                    className="border px-2 py-1 rounded w-full mb-2"
                  />
                  {opt.radioOptions?.map((radioOpt, rIdx) => (
                    <label key={rIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`edit-radio-${field.id}-${optIdx}`}
                        checked={false /* You can handle checked state here */}
                        onChange={() => {
                          // Handle radio option change if needed
                        }}
                      />
                      <input
                        type="text"
                        value={radioOpt}
                        onChange={(e) => {
                          const newCondOpts = [...(field.conditionalOptions || [])];
                          const newRadioOpts = [...(newCondOpts[optIdx].radioOptions || [])];
                          newRadioOpts[rIdx] = e.target.value;
                          newCondOpts[optIdx] = { ...newCondOpts[optIdx], radioOptions: newRadioOpts };
                          updateField(section.id, fIndex, { conditionalOptions: newCondOpts });
                        }}
                        className="border px-2 py-1 rounded w-full"
                      />
                      <button
                        type="button"
                        className="text-red-500"
                        onClick={() => {
                          const newCondOpts = [...(field.conditionalOptions || [])];
                          const newRadioOpts = [...(newCondOpts[optIdx].radioOptions || [])];
                          newRadioOpts.splice(rIdx, 1);
                          newCondOpts[optIdx] = { ...newCondOpts[optIdx], radioOptions: newRadioOpts };
                          updateField(section.id, fIndex, { conditionalOptions: newCondOpts });
                        }}
                      >
                        ❌
                      </button>
                    </label>
                  ))}
                  <button
                    type="button"
                    className="text-blue-600 text-sm mt-1"
                    onClick={() => {
                      const newCondOpts = [...(field.conditionalOptions || [])];
                      const newRadioOpts = [...(newCondOpts[optIdx].radioOptions || []), ''];
                      newCondOpts[optIdx] = { ...newCondOpts[optIdx], radioOptions: newRadioOpts };
                      updateField(section.id, fIndex, { conditionalOptions: newCondOpts });
                    }}
                  >
                    ➕ Add Radio Option
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
  </div>
)}


                  {/* Select field */}
                  {field.field_id?.startsWith('select')  && (
                    <div className="space-y-2 mt-1">
                      <label className="block text-sm font-medium mb-1">Label du menu:</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          updateField(section.id, fIndex, { label: e.target.value })
                        }
                        className="w-full border p-2 rounded"
                      />

                      <label className="block mt-3 text-sm font-medium">Options:</label>
                      {field.options?.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2 mb-1">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...(field.options || [])];
                              updated[optIndex] = e.target.value;
                              updateField(section.id, fIndex, { options: updated });
                            }}
                            className="border px-2 py-1 rounded w-full"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated =
                                field.options?.filter((_, i) => i !== optIndex) || [];
                              updateField(section.id, fIndex, { options: updated });
                            }}
                            className="text-red-500 text-sm"
                          >
                            ❌
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const existingOptions = field.options ?? [];
                          const updated = [
                            ...existingOptions,
                            `Option ${existingOptions.length + 1}`,
                          ];
                          updateField(section.id, fIndex, { options: updated });
                        }}
                        className="text-blue-600 text-sm mt-2 hover:underline"
                      >
                        ➕ Ajouter une option
                      </button>
                    </div>
                  )}
                   
                 {/* Delete field button */}
                  <button
                    type="button"
                    onClick={() => {
                      const updatedSections = form.sections.map((s) =>
                        s.id === section.id
                          ? {
                              ...s,
                              fields: s.fields.filter((_, i) => i !== fIndex),
                            }
                          : s
                      );
                      setForm({ ...form, sections: updatedSections });
                    }}
                    className="text-red-500 ml-2 text-sm"
                    title="Delete field"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </form>
    </div>
  );
}
