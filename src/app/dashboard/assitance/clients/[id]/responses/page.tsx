'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Response {
  id: number;
  form_id: number;
  answers: Record<string, any>;
  submitted_at: string;
  status: string;
}

function formatAnswerRecursive(ans: any): string {
  if (ans === null || ans === undefined) return 'Non renseigné';

  // Primitive values
  if (typeof ans === 'string' || typeof ans === 'number' || typeof ans === 'boolean') {
    return ans.toString();
  }

  // Array → map recursively
  if (Array.isArray(ans)) {
    return ans.map(formatAnswerRecursive).join(', ');
  }

  // Object → handle question groups / conditional fields
  if (typeof ans === 'object') {
    // Oui/Non with options (question-group)
    if ('ouiNon' in ans && Array.isArray(ans.options)) {
      const opts = ans.options
        .map((opt: any) => {
          let line = opt.option || '';
          if (opt.inputs) {
            line += ' ' + Object.entries(opt.inputs)
              .map(([k, v]) => v ? `${k}: ${v}` : '')
              .filter(Boolean)
              .join(', ');
          }
          return line;
        })
        .filter(Boolean)
        .join('; ');
      return `Oui/Non: ${ans.ouiNon}${opts ? '; Options: ' + opts : ''}`;
    }

    // Single radio
    if ('radio' in ans) return `Radio: ${ans.radio}`;

    // Single value
    if ('value' in ans) return ans.value?.toString() || 'Non renseigné';

    // Conditional data
    if (Array.isArray(ans._conditionalData)) {
      return ans._conditionalData
        .map((cond: any) => {
          let line = cond.optionText || '';
          if (Array.isArray(cond.inputs)) {
            line += ' ' + cond.inputs
              .map((input: any) => input.value ? `${input.label || input.key}: ${input.value}` : '')
              .filter(Boolean)
              .join(', ');
          }
          return line;
        })
        .filter(Boolean)
        .join('; ');
    }

    // Fallback → stringify simple objects
    return Object.entries(ans)
      .map(([k, v]) => `${k}: ${formatAnswerRecursive(v)}`)
      .join('; ');
  }

  return String(ans);
}

export default function ClientResponsesPage() {
  const params = useParams();
  const clientId = params.id;
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/clients/${clientId}/responses`)
      .then(res => res.json())
      .then(setResponses)
      .catch(console.error);
  }, [clientId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Client Responses</h1>

      {responses.length === 0 ? (
        <p>No responses found for this client.</p>
      ) : (
        <div className="space-y-4">
          {responses.map((response) => (
            <div
              key={response.id}
              className="border rounded-md p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Form ID: {response.form_id}</span>
                <span
                  className={`px-2 py-1 rounded text-white text-sm ${
                    response.status === 'approved'
                      ? 'bg-green-500'
                      : response.status === 'pending'
                      ? 'bg-yellow-500'
                      : response.status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-gray-500'
                  }`}
                >
                  {response.status}
                </span>
              </div>

              <div className="mb-2 text-gray-600 text-sm">
                Submitted on: {new Date(response.submitted_at).toLocaleString()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(response.answers).map(([fieldLabel, value]) => (
                  <div key={fieldLabel} className="bg-gray-100 p-2 rounded flex flex-col">
                    <span className="font-medium">{fieldLabel}:</span>
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {formatAnswerRecursive(value)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
