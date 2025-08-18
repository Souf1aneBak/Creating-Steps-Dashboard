'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ROLES } from '@/constants/roles';

interface ConditionalOption {
  id: string;
  optionText: string;
  inputs?: { label: string }[];
  radioQuestion?: string;
  radioOptions?: string[];
}
interface Field {
  id: string;
  label: string;
  field_id: string;
  options?: string[];
  field_type?: string;
  conditionalOptions?: ConditionalOption[]; // Replaced 'any[]' with proper type
}

interface AnswerValue {
  value?: string | boolean | number;
  conditionalValues?: Record<string, string>;
  options?: Record<string, string>;
  // For question_group fields
  [key: string]: string | number | boolean | Record<string, any> | undefined;
}

interface FormResponse {
  id: string;
  form_id: string;
  answers: Record<string, AnswerValue>; // Replaced 'any' with proper type
  submitted_at: string;
  status: string;
  client_id: number;
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
  submittedAt: string;
  status: string; 
  clientId:number;
}

function AlertNotification({ 
  message, 
  type = 'success' 
}: { 
  message: string; 
  type?: 'success' | 'error' 
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transition-all duration-300
      ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
    >
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button 
          onClick={() => setShow(false)}
          className="ml-4 text-lg font-bold"
        >
          &times;
        </button>
      </div>
    </div>
  );
}


export default function FormResponsesPage() {
  const params = useParams();
  const formId = Array.isArray(params.formId) ? params.formId[0] : params.formId;
  
  const [form, setForm] = useState<FormType | null>(null);
  const [responses, setResponses] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<{ id: number; companyName: string }[]>([]);
    const [alert, setAlert] = useState<{message: string; type: 'success' | 'error'} | null>(null);

 
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
  console.log('Responses:', responses);
}, [responses]);


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
      console.log('Attempting to update status:', responseId, newStatus);
      const res = await fetch(`http://localhost:3001/api/form-responses/${responseId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      const data = await res.json();
      console.log('Update successful:', data);

      setResponses(prev => prev.map(resp => 
        resp.id === responseId ? { ...resp, status: newStatus } : resp
      ));
      
      setAlert({
        message: `Status successfully changed to ${newStatus}`,
        type: 'success'
      });
    } catch (err: unknown) {
      console.error('Update error:', err);
      setAlert({
        message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        type: 'error'
      });
    }
  }
  if (loading || clients.length === 0) return <p>Loading...</p>;

  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!form) return <p>Form not found</p>;
  if (responses.length === 0) return <p>No responses submitted yet.</p>;

return (
  <div className="max-w-7xl mx-auto px-6 py-8">
    {/* Alert Notification - positioned fixed at top */}
    {alert && (
      <div className="fixed top-6 right-6 z-50 animate-fade-in">
        <AlertNotification message={alert.message} type={alert.type} />
      </div>
    )}

    {/* Header Section */}
    <div className="mb-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {form.title} — Response Management
      </h1>
      <p className="text-gray-600">
        Review and manage all submitted responses for this form
      </p>
    </div>

    {/* Responses Grid */}
    <div className="space-y-8">
      {responses.map((response) => {
        const client = clients.find(c => Number(c.id) === Number(response.clientId));







     


        return (
          <div
            key={response.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            {/* Response Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
               <h2>{client ? client.companyName : `Client ID: ${response.clientId}`}</h2>
                <div className="flex items-center mt-1 space-x-4">
                  <span className="text-sm text-gray-500">
                <span className="text-gray-500 text-sm font-medium">
Submitted: {response.submittedAt ? new Date(response.submittedAt).toLocaleString() : 'Pending'}

</span>




                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full 
                    ${
                      response.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : response.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : response.status === 'needs_correction'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {response.status.charAt(0).toUpperCase() + response.status.slice(1).replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href={`http://localhost:3001/api/reports/generate/${response.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  Export PDF
                </a>

                {role === 'assistance' || role === 'superadmin' ? (
                  response.status === 'approved' ? (
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-green-600 mr-2">
                        Approved
                      </span>
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <select
                      value={response.status}
                      onChange={(e) => updateStatus(response.id, e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                      <option value="needs_correction">Request Corrections</option>
                    </select>
                  )
                ) : null}
              </div>
            </div>

            {/* Form Sections */}
            <div className="px-6 py-5">
              {form.sections.map((section) => (
                <section key={section.id} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    {section.title}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields
  .filter(field => !field.field_id.startsWith('button'))
  .map((field) => {
    const answerValue = response.answers[field.id];

    // 1️⃣ Question-group fields (ouiNon + options)
    if (answerValue && typeof answerValue === 'object' && 'ouiNon' in answerValue) {
      return (
        <div key={field.id} className="space-y-2">
          <label className="block font-medium">{field.label}</label>
          <div className="text-sm">Answer: {answerValue.ouiNon}</div>

          {Array.isArray(answerValue.options) && answerValue.options.map((opt: any, idx: number) => (
            <div key={idx} className="ml-4 space-y-1">
              <div>Option: {opt.option}</div>
              {opt.inputs && Object.entries(opt.inputs).map(([label, val], i) => (
                <div key={i} className="text-sm text-gray-900">
                  <span className="text-gray-600">{label}:</span> {val || 'Not provided'}
                </div>
              ))}
              {opt.radio && (
                <div className="ml-4 text-sm text-gray-900">
                  <span className="text-gray-600">{field.conditionalOptions?.[idx]?.radioQuestion || 'Question'}:</span> {opt.radio}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    // 2️⃣ Conditional fields (_conditionalData)
  // 2️⃣ Conditional fields (_conditionalData)
if (answerValue && typeof answerValue === 'object' && '_conditionalData' in answerValue) {
  return (
    <div key={field.id} className="space-y-2">
      <label className="block font-medium">{field.label}</label>
      <div className="text-sm text-gray-900">{answerValue.value || ''}</div>

      {Array.isArray(answerValue._conditionalData) && answerValue._conditionalData.map((cond: any, idx: number) => (
        <div key={idx} className="ml-4 pl-4 border-l-2 border-gray-200 space-y-1">
          {/* Only show the optionText if it has inputs */}
          {cond.inputs?.length > 0 && (
            <>
              
              {cond.inputs.map((input: any) => input.value && ( // <-- only show if value exists
                <div key={input.key} className="text-sm text-gray-900">
                  <span className="text-gray-600">{input.label || 'Answer'}:</span> {input.value}
                </div>
              ))}
            </>
          )}
          {/* Skip radioQuestion if no value */}
          {cond.radioQuestion && answerValue[`radio_${idx}`] && (
            <div className="text-sm text-gray-900 mt-1">
              <span className="text-gray-600">{cond.radioQuestion}:</span> {answerValue[`radio_${idx}`]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


    // 3️⃣ Fallback: normal or simple value
    return (
      <div key={field.id} className="space-y-1">
        <label className="block font-medium">{field.label}</label>
        <div className="text-sm text-gray-900">
          {Array.isArray(answerValue) ? answerValue.join(', ') :
           typeof answerValue === 'object' ? JSON.stringify(answerValue) :
           answerValue || 'Not answered'}
        </div>
      </div>
    );
  })}


                  </div>
                </section>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);}
