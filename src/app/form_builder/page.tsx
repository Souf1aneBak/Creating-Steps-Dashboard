"use client";
import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import Navbar from '@/components/dashboard/Navbar';




const TOOLBOX_ELEMENTS = [
  { id: 'text', label: 'Text Input' },
  { id: 'checkbox', label: 'Checkbox' },
  { id: 'radio', label: 'Radio Button' },
  { id: 'button', label: 'Submit Button' },
  { id: 'email', label: 'Email Input' },
  { id: 'phone', label: 'Phone Input' },
  { id: 'textarea', label: 'Textarea' },
  { id: 'time', label: 'Time Input' },
  { id: 'select', label: 'Dropdown Select' },
  { id: 'number', label: 'Number Input' },
  { id: 'question-group', label: 'Radio-group' },

]

type Field = {
  id: string
  label: string
  type : string 
  required : boolean
  options?: string[]
  
  showOtherOption?: boolean
  conditionalOptions?: {
  option: string;  
  inputs: { label: string; value: string }[]; 
  radioQuestion?: string; 
  radioOptions?: string[]; 
  radioSelection?: string; 
}[];


}

type Section = {
  id: string
  title: string
  fields: Field[]
}

export default function BuilderPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [formTitle, setFormTitle] = useState('');
const [formDescription, setFormDescription] = useState('');
const [selectedConditional, setSelectedConditional] = useState<{ [key: string]: string }>({});
const [previewRadioSelection, setPreviewRadioSelection] = useState<string | null>(null);
const [previewCheckedOptions, setPreviewCheckedOptions] = useState<number[]>([]);
const [previewInputValues, setPreviewInputValues] = useState<{ [key: string]: string }>({});

const [previewRadioSelections, setPreviewRadioSelections] = useState<{ [key: string]: string }>({});


const [checkedOptions, setCheckedOptions] = useState<{
  [fieldId: string]: number[]; 
}>({});



const [timeValues, setTimeValues] = useState<{ [fieldId: string]: { date: string; time: string } }>({});


  
  
const handleAddSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      fields: [],
    }
    setSections((prev) => [...prev, newSection])
  }

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return

    const [fromType, fromId] = source.droppableId.split(':')
    const [toType, toId] = destination.droppableId.split(':')

    if (fromType === 'toolbox' && toType === 'section') {
      const dragged = TOOLBOX_ELEMENTS.find((el) => el.id === draggableId)
      if (dragged) {
        const newField: Field = {
          ...dragged,
          id: `${dragged.id}-${Date.now()}`,
          label: dragged.label,
          ...(dragged.id === 'checkbox' || dragged.id === 'radio' ? {
            options: ['Option 1', 'Option 2', 'Option 3'],
            showOtherOption: false,
          } : {})
        }

        setSections((prev) =>
          prev.map((sec) =>
            sec.id === toId ? { ...sec, fields: [...sec.fields, newField] } : sec
          )
        )
        return
      }
    }

    if (fromType === 'section' && toType === 'section' && fromId === toId) {
      const sectionIndex = sections.findIndex((s) => s.id === fromId)
      const section = sections[sectionIndex]
      const items = Array.from(section.fields)
      const [moved] = items.splice(source.index, 1)
      items.splice(destination.index, 0, moved)
      const updatedSection = { ...section, fields: items }
      const newSections = [...sections]
      newSections[sectionIndex] = updatedSection
      setSections(newSections)
    }

    if (fromType === 'section' && toType === 'toolbox') {
      const updatedSections = sections.map((section) =>
        section.id === fromId
          ? {
              ...section,
              fields: section.fields.filter((_, index) => index !== source.index),
            }
          : section
      )
      setSections(updatedSections)
    }
  }

  const updateField = (sectionId: string, fieldIndex: number, changes: Partial<Field>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields.map((f, i) =>
                i === fieldIndex ? { ...f, ...changes } : f
              ),
            }
          : s
      )
    )
  }

  return (
    <>
      <Navbar />
      <div className="flex h-screen">
        {!previewMode ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          {!previewMode && (
          <Droppable droppableId="toolbox:main" isDropDisabled={true}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-1/4 bg-gray-100 p-4 border-r overflow-auto"
              >
                <h2 className="text-lg font-bold mb-4">🧰 Toolbox</h2>
                {TOOLBOX_ELEMENTS.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white p-3 rounded shadow mb-2 cursor-move"
                      >
                        {item.label}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          )}
          <div className="w-3/4 p-6 overflow-auto">
         <div className="flex justify-between items-center mb-4">
  <h2 className="text-lg font-bold">📝 Form Builder</h2>
 <div className="flex items-center gap-4">
  <button
  
  className={`px-4 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700`}
>
  💾 Save Form
</button>

  <button
    onClick={() => setPreviewMode((prev) => !prev)}
    className={`px-4 py-2 rounded text-white ${
      previewMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'
    }`}
  >
    {previewMode ? '🔙  Return to editing ' : '👁️  Preview'}
  </button>

  <button
    onClick={handleAddSection}
    className={`px-4 py-2 rounded text-white transition ${
      previewMode
        ? 'bg-gray-300 cursor-not-allowed'
        : 'bg-blue-500 hover:bg-blue-600'
    }`}
    disabled={previewMode}
  >
    ➕ Add Section
  </button>
</div>

</div>

            <div className="mb-6">
  <label className="block text-sm font-medium mb-1">Form Title</label>
  <input
    type="text"
    className="w-full border rounded px-3 py-2"
    value={formTitle}
    onChange={(e) => setFormTitle(e.target.value)}
    placeholder="Enter the title of your form"
  />
</div>

<div className="mb-6">
  <label className="block text-sm font-medium mb-1">Form Description</label>
  <textarea
    className="w-full border rounded px-3 py-2"
    value={formDescription}
    onChange={(e) => setFormDescription(e.target.value)}
    placeholder="Optional: Describe your form"
  />
</div>


            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.id} className="bg-gray-50 p-4 rounded shadow">
                   {!previewMode ? (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => {
                      const newTitle = e.target.value
                      setSections((prev) =>
                        prev.map((sec) =>
                          sec.id === section.id ? { ...sec, title: newTitle } : sec
                        )
                      )
                    }}
                    className="font-semibold mb-2 text-lg w-full border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                  ) : (
                    <h3 className="font-semibold mb-2 text-lg">{section.title}</h3>
                  )}


                  <Droppable droppableId={`section:${section.id}`}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="min-h-[50px] bg-white p-3 rounded border"
                      >
                        {section.fields.map((field, index) => (
                          <Draggable key={field.id} draggableId={field.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-blue-100 p-3 mb-2 rounded"
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="w-full">
                                     {!previewMode ? (
                                      
                                    <input
                                      type="text"
                                      value={field.label}
                                      onChange={(e) => {
                                        const updatedSections = sections.map((s) =>
                                          s.id === section.id
                                            ? {
                                                ...s,
                                                fields: s.fields.map((f, i) =>
                                                  i === index ? { ...f, label: e.target.value } : f
                                                ),
                                              }
                                            : s
                                        )
                                        setSections(updatedSections)
                                      }}
                                      className="font-medium text-sm text-gray-800 mb-1 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                   />
                                    ) : (
                                      <p className="text-sm font-medium text-gray-800 mb-2">
                                        {field.label}
                                      </p>
                                    )}

                                    {field.id.startsWith("text") && (
                                      <input
                                        type="text"
                                        placeholder="Enter text"
                                        className="w-full px-3 py-2 border rounded mt-1"
                                        disabled
                                      />
                                    )}

                                    {field.id.startsWith("checkbox") && (
                                      <div className="space-y-2 mt-1">
                                        <label className="block text-sm font-medium mb-1">Question:</label>
                                        <input
                                          type="text"
                                          value={field.label}
                                          onChange={(e) => {
                                            updateField(section.id, index, { label: e.target.value })
                                          }}
                                          className="w-full border p-2 rounded"
                                        />

                                        <label className="block mt-3 text-sm font-medium">Options:</label>
                                         {field.options?.map((option, optIndex) => (
                                          <div key={optIndex} className="flex items-center gap-2 mb-1">
                                            <input type="checkbox" disabled />
                                            <input
                                              type="text"
                                              value={option}
                                              onChange={(e) => {
                                                const updatedOptions = [...(field.options || [])]
                                                updatedOptions[optIndex] = e.target.value
                                                updateField(section.id, index, { options: updatedOptions })
                                              }}
                                              className="border px-2 py-1 rounded w-full"
                                            />
                                            <button
                                              onClick={() => {
                                                const updatedOptions = field.options?.filter((_, i) => i !== optIndex) || []
                                                updateField(section.id, index, { options: updatedOptions })
                                              }}
                                              className="text-red-500 text-sm"
                                            >
                                              ❌
                                            </button>
                                          </div>
                                        ))}

                                        <button
                                        
                                          onClick={() => {
                                            console.log("Ajouter option click", field.options);
                                            const updatedOptions = [...(field.options || []), `Option ${field.options!.length + 1}`]
                                            updateField(section.id, index, { options: updatedOptions })
                                          }}
                                          className="text-blue-600 text-sm mt-2 hover:underline"
                                        >
                                          ➕ Ajouter une option
                                        </button>

                                        <div className="mt-2">
                                          {!field.showOtherOption ? (
                                            <button
                                              onClick={() => updateField(section.id, index, { showOtherOption: true })}
                                              className="text-blue-600 text-sm hover:underline"
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
                                                onClick={() => updateField(section.id, index, { showOtherOption: false })}
                                                className="text-red-500 ml-2 text-sm"
                                              >
                                                ❌
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                      {field.id.startsWith("radio") && (
                                      <div className="space-y-2 mt-1">
                                        <label className="block text-sm font-medium mb-1">Question:</label>
                                        <input
                                          type="text"
                                          value={field.label}
                                          onChange={(e) => {
                                            updateField(section.id, index, { label: e.target.value })
                                          }}
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
                                                const updatedOptions = [...(field.options || [])]
                                                updatedOptions[optIndex] = e.target.value
                                                updateField(section.id, index, { options: updatedOptions })
                                              }}
                                              className="border px-2 py-1 rounded w-full"
                                            />
                                            <button
                                              onClick={() => {
                                                const updatedOptions = field.options?.filter((_, i) => i !== optIndex) || []
                                                updateField(section.id, index, { options: updatedOptions })
                                              }}
                                              className="text-red-500 text-sm"
                                            >
                                              ❌
                                            </button>
                                          </div>
                                        ))}

                                        <button
                                          onClick={() => {
                                            const updatedOptions = [...(field.options || []), `Option ${field.options!.length + 1}`]
                                            updateField(section.id, index, { options: updatedOptions })
                                          }}
                                          className="text-blue-600 text-sm mt-2 hover:underline"
                                        >
                                          ➕ Ajouter une option
                                        </button>

                                        <div className="mt-2">
                                          {!field.showOtherOption ? (
                                            <button
                                              onClick={() => updateField(section.id, index, { showOtherOption: true })}
                                              className="text-blue-600 text-sm hover:underline"
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
                                                onClick={() => updateField(section.id, index, { showOtherOption: false })}
                                                className="text-red-500 ml-2 text-sm"
                                              >
                                                ❌
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {field.id.startsWith("time") && (
                                      <div className="flex gap-2 mt-2">
                                        <input
                                          type="date"
                                          className="border px-3 py-2 rounded w-1/2"
                                          disabled
                                        />
                                        <input
                                          type="time"
                                          className="border px-3 py-2 rounded w-1/2"
                                          disabled
                                        />
                                      </div>
                                    )}
                                   {field.id.startsWith("select") && (
  <div className="space-y-2 mt-1">
    <label className="block text-sm font-medium mb-1">Label du menu:</label>
    <input
      type="text"
      value={field.label}
      onChange={(e) => updateField(section.id, index, { label: e.target.value })}
      className="w-full border p-2 rounded"
    />

    <label className="block mt-3 text-sm font-medium">Options:</label>
    {field.options?.map((opt, optIndex) => (
      <div key={optIndex} className="flex items-center gap-2 mb-1">
        <input
          type="text"
          value={opt}
          onChange={(e) => {
            const updated = [...(field.options || [])]
            updated[optIndex] = e.target.value
            updateField(section.id, index, { options: updated })
          }}
          className="border px-2 py-1 rounded w-full"
        />
        <button
          onClick={() => {
            const updated = field.options?.filter((_, i) => i !== optIndex) || []
            updateField(section.id, index, { options: updated })
          }}
          className="text-red-500 text-sm"
        >
          ❌
        </button>
      </div>
    ))}

    <button
      onClick={() => {
        const existingOptions = field.options ?? [];
const updated = [...existingOptions, `Option ${existingOptions.length + 1}`];
updateField(section.id, index, { options: updated });

        updateField(section.id, index, { options: updated })
      }}
      className="text-blue-600 text-sm mt-2 hover:underline"
    >
      ➕ Ajouter une option
    </button>
  </div>
)}


                                  

{field.id.startsWith("question-group") && (
  <div className="space-y-2 mt-1">
    <label className="block text-sm font-medium mb-1">Question:</label>
    <input
      type="text"
      value={field.label}
      onChange={(e) => updateField(section.id, index, { label: e.target.value })}
      className="w-full border p-2 rounded"
    />

    <div className="mt-2">
      <label className="block text-sm font-medium">Choisir Oui / Non :</label>
      <div className="flex gap-4 mt-1">
        <label>
          <input
            type="radio"
            name={`conditional-${field.id}`}
            onChange={() => {
              if (!field.conditionalOptions || field.conditionalOptions.length === 0) {
                updateField(section.id, index, {
                  conditionalOptions: [
                    { option: 'Option 1', inputs: [{ label: 'Input Label 1', value: '' }], radioQuestion: '', radioOptions: [], radioSelection: '' },
                    { option: 'Option 2', inputs: [{ label: 'Input Label 2', value: '' }], radioQuestion: '', radioOptions: [], radioSelection: '' },
                  ],
                });
              }
            }}
          /> Oui
        </label>
        <label>
          <input type="radio" name={`conditional-${field.id}`} /> Non
        </label>
      </div>
    </div>

    {field.conditionalOptions && (
      <div className="mt-4">
        {field.conditionalOptions.map((opt, optIdx) => (
          <div key={optIdx} className="mb-4 border p-3 rounded bg-white">
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={checkedOptions[field.id]?.includes(optIdx) || false}
                onChange={() => {
                  setCheckedOptions((prev) => {
                    const prevList = prev[field.id] || [];
                    const newList = prevList.includes(optIdx)
                      ? prevList.filter((i) => i !== optIdx)
                      : [...prevList, optIdx];
                    return { ...prev, [field.id]: newList };
                  });
                }}
              />
              <input
                type="text"
                value={opt.option}
                onChange={(e) => {
                  const updatedOptions = [...field.conditionalOptions!];
                  updatedOptions[optIdx].option = e.target.value;
                  updateField(section.id, index, { conditionalOptions: updatedOptions });
                }}
                className="border px-2 py-1 rounded w-full"
              />
            </label>

           
            {checkedOptions[field.id]?.includes(optIdx) && (
              <div className="mt-2 pl-6 space-y-4">
               
                {opt.inputs.map((inputItem, inputIdx) => (
                  <div key={inputIdx}>
                    <label className="block text-sm font-medium mb-1">
                      <input
                        type="text"
                        placeholder="Input label"
                        value={inputItem.label}
                        onChange={(e) => {
                          const updatedOptions = [...field.conditionalOptions!];
                          updatedOptions[optIdx].inputs[inputIdx].label = e.target.value;
                          updateField(section.id, index, { conditionalOptions: updatedOptions });
                        }}
                        className="border px-2 py-1 rounded mb-1 w-full"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Enter input"
                      className="border px-2 py-1 rounded w-full"
                      value={inputItem.value}
                      onChange={(e) => {
                        const updatedOptions = [...field.conditionalOptions!];
                        updatedOptions[optIdx].inputs[inputIdx].value = e.target.value;
                        updateField(section.id, index, { conditionalOptions: updatedOptions });
                      }}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  className="text-blue-600 text-sm hover:underline"
                  onClick={() => {
                    const updatedOptions = [...field.conditionalOptions!];
                    updatedOptions[optIdx].inputs.push({ label: '', value: '' });
                    updateField(section.id, index, { conditionalOptions: updatedOptions });
                  }}
                >
                  ➕ Add Input
                </button>

                
<div className="mt-4 space-y-2 border-t pt-3">
  <label className="text-sm font-semibold block">Radio Question (optional)</label>

  {/* Question input */}
  <input
    type="text"
    placeholder="Enter a question"
    className="border px-2 py-1 rounded w-full"
    value={opt.radioQuestion || ''}
    onChange={(e) => {
      const updatedOptions = [...field.conditionalOptions!];
      updatedOptions[optIdx].radioQuestion = e.target.value;
      updateField(section.id, index, { conditionalOptions: updatedOptions });
    }}
  />

  {/* Radio options */}
  {opt.radioOptions && opt.radioOptions.length > 0 && (
    <div className="space-y-2 mt-2">
      {opt.radioOptions.map((rOpt, rIdx) => (
        <div key={rIdx} className="flex items-center gap-2">
          <input
            type="radio"
            name={`radio-${field.id}-${optIdx}`}
            checked={opt.radioSelection === rOpt}
            onChange={() => {
              const updatedOptions = [...field.conditionalOptions!];
              updatedOptions[optIdx].radioSelection = rOpt;
              updateField(section.id, index, { conditionalOptions: updatedOptions });
            }}
          />
          <input
            type="text"
            value={rOpt}
            onChange={(e) => {
              const updatedOptions = [...field.conditionalOptions!];
              updatedOptions[optIdx].radioOptions![rIdx] = e.target.value;
              updateField(section.id, index, { conditionalOptions: updatedOptions });
            }}
            className="border px-2 py-1 rounded w-full"
          />
          <button
            type="button"
            onClick={() => {
              const updatedOptions = [...field.conditionalOptions!];
              updatedOptions[optIdx].radioOptions!.splice(rIdx, 1);
              updateField(section.id, index, { conditionalOptions: updatedOptions });
            }}
            className="text-red-600 hover:underline text-sm"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )}

  {/* Add new radio option */}
  <button
    type="button"
    className="text-blue-600 hover:underline text-sm mt-2"
    onClick={() => {
      const updatedOptions = [...field.conditionalOptions!];
      if (!updatedOptions[optIdx].radioOptions) {
        updatedOptions[optIdx].radioOptions = [];
      }
      updatedOptions[optIdx].radioOptions!.push('');
      updateField(section.id, index, { conditionalOptions: updatedOptions });
    }}
  >
    ➕ Add radio option
  </button>
</div>

              </div>
            )}
          </div>
        ))}
       
<button
  type="button"
  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
  onClick={() => {
    const updatedOptions = [...field.conditionalOptions!];
    updatedOptions.push({
      option: '',
      inputs: [],
      radioQuestion: '',
      radioOptions: [],
      radioSelection: '',
    });
    updateField(section.id, index, { conditionalOptions: updatedOptions });
  }}
>
  ➕ Add Checkbox Option
</button>

      </div>
    )}
  </div>
)}



                                    {field.id.startsWith("button") && (
                                      <button
                                        type="button"
                                        className="bg-blue-500 text-white px-4 py-2 rounded cursor-not-allowed mt-1"
                                        disabled
                                      >
                                        {field.label}
                                      </button>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => {
                                      const updatedSections = sections.map((s) =>
                                        s.id === section.id
                                          ? {
                                              ...s,
                                              fields: s.fields.filter((_, i) => i !== index),
                                            }
                                          : s
                                      )
                                      setSections(updatedSections)
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                    title="Delete field"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
        ) : (
         <div className="relative w-screen h-screen bg-gray-50">
  {/* Top-right preview button */}
  <div className="absolute top-4 right-6 z-10">
    <button
      onClick={() => setPreviewMode((prev) => !prev)}
      className={`px-4 py-2 rounded text-white ${
        previewMode
          ? 'bg-gray-600 hover:bg-gray-700'
          : 'bg-green-600 hover:bg-green-700'
      }`}
    >
      {previewMode ? '🔙  Return to editing ' : '👁️ Preview'}
    </button>
  </div>

  {/* Full-screen form */}
  <form
    onSubmit={(e) => e.preventDefault()}
    className="w-full h-full flex justify-center items-center"
  >
    
    <div className="w-full max-w-4xl bg-white p-8 rounded shadow overflow-y-auto max-h-[90vh]">
      <div className="mb-6">
  <label className="block text-sm font-medium mb-1">Form Title</label>
  <input
    type="text"
    className="w-full border rounded px-3 py-2"
    value={formTitle}
    onChange={(e) => setFormTitle(e.target.value)}
    placeholder="Enter the title of your form"
    disabled={true}
  />
</div>

<div className="mb-6">
  <label className="block text-sm font-medium mb-1">Form Description</label>
  <textarea
    className="w-full border rounded px-3 py-2"
    value={formDescription}
    onChange={(e) => setFormDescription(e.target.value)}
    placeholder="Optional: Describe your form"
    disabled={true}
  />
</div>

      {sections.map((section) => (
        <div
          key={section.id}
          className="bg-white p-4 rounded shadow mb-6"
        >
          <h3 className="text-lg font-bold mb-4">{section.title}</h3>

          {section.fields.map((field, index) => (
            <div key={index} className="mb-4">
              <label className="block font-medium mb-1">
                {field.label}
              </label>

              {field.id.startsWith('text') && (
                <input
                  type="text"
                  placeholder="Entrez votre réponse"
                  className="border px-3 py-2 rounded w-full"
                />
              )}

              {field.id.startsWith('checkbox') && (
                <div className="space-y-1">
                  {field.options?.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span>{opt}</span>
                    </label>
                  ))}
                  {field.showOtherOption && (
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <input
                        type="text"
                        placeholder="Autre..."
                        className="border px-2 py-1 rounded"
                      />
                    </label>
                  )}
                </div>
              )}

              {field.id.startsWith('radio') && (
                <div className="space-y-1">
                  {field.options?.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`radio-${section.id}-${index}`}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                  {field.showOtherOption && (
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`radio-${section.id}-${index}`}
                      />
                      <input
                        type="text"
                        placeholder="Autre..."
                        className="border px-2 py-1 rounded"
                      />
                    </label>
                  )}
                </div>
              )}
              {field.id.startsWith("time") && (
  <div className="flex gap-2 mt-2">
    <input
      type="date"
      className="border px-3 py-2 rounded w-1/2"
      value={timeValues[field.id]?.date || ""}
      onChange={(e) => {
        setTimeValues((prev) => ({
          ...prev,
          [field.id]: {
            date: e.target.value,
            time: prev[field.id]?.time || "",
          },
        }));
      }}
    />
    <input
      type="time"
      className="border px-3 py-2 rounded w-1/2"
      value={timeValues[field.id]?.time || ""}
      onChange={(e) => {
        setTimeValues((prev) => ({
          ...prev,
          [field.id]: {
            date: prev[field.id]?.date || "",
            time: e.target.value,
          },
        }));
      }}
    />
  </div>
)}
{field.id.startsWith("select") && (
  <div className="my-4">
    <label className="block font-medium mb-1">{field.label}</label>
    <select className="border p-2 rounded w-full">
      {field.options?.map((opt, i) => (
        <option key={i} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
)}


{field.id.startsWith("question-group") && (
  <div className="space-y-4 mt-2 border p-4 rounded bg-gray-50">
    <label className="block font-medium mb-2">{field.label}</label>

    {/* Oui / Non choice */}
    <div className="flex gap-4 mb-4">
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name={`preview-conditional-${field.id}`}
          checked={previewRadioSelection === "Oui"}
          onChange={() => setPreviewRadioSelection("Oui")}
        />
        Oui
      </label>
      <label className="flex items-center gap-1">
        <input
          type="radio"
          name={`preview-conditional-${field.id}`}
          checked={previewRadioSelection === "Non"}
          onChange={() => setPreviewRadioSelection("Non")}
        />
        Non
      </label>
    </div>

    {/* Options shown only if Oui is selected */}
    {previewRadioSelection === "Oui" && field.conditionalOptions && (
      <div className="space-y-3 ml-6">
        {field.conditionalOptions.map((opt, optIdx) => (
          <div key={optIdx}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={previewCheckedOptions.includes(optIdx)}
                onChange={() => {
                  if (previewCheckedOptions.includes(optIdx)) {
                    setPreviewCheckedOptions(previewCheckedOptions.filter(i => i !== optIdx));
                  } else {
                    setPreviewCheckedOptions([...previewCheckedOptions, optIdx]);
                  }
                }}
              />
              <span>{opt.option}</span>
            </label>

            {/* Inputs with labels */}
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
                      value={previewInputValues[`${optIdx}-${inputIdx}`] || ""}
                      onChange={(e) =>
                        setPreviewInputValues({
                          ...previewInputValues,
                          [`${optIdx}-${inputIdx}`]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}

                {/* Radio question if exists */}
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
                            setPreviewRadioSelections({
                              ...previewRadioSelections,
                              [`${optIdx}`]: radioOpt,
                            })
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
  </div>
)}


              {field.id.startsWith('button') && (
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {field.label || 'Soumettre'}
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  </form>
</div>

)}

      </div>
    </>
  )
}
