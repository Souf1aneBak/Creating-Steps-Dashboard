'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';

interface Field {
  id: string;
  label: string;
  type: string;
  options?: string[];
  showOtherOption?: boolean;
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

  useEffect(() => {
    if (!formId) return;

    async function fetchForm() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3001/api/forms/${formId}`);
        if (!res.ok) throw new Error('Failed to fetch form');
        const data: FormType = await res.json();
        setForm(data);
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
                  {field.type === 'checkbox' && (
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
                  {fieldIdStr.startsWith('radio') && (
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

                  {/* Select field */}
                  {fieldIdStr.startsWith('select') && (
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
                    className="text-red-600 hover:text-red-800 text-sm absolute top-2 right-2"
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
