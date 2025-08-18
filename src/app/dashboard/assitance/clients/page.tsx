'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Client {
  id: number;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

interface ClientSummary {
  client: Client;
  lastSubmission?: string;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  needsCorrectionCount: number;
}

export default function ClientDirectoryPage() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('http://localhost:3001/api/clients/summary');
        if (!res.ok) throw new Error('Failed to fetch clients');
        const data: ClientSummary[] = await res.json();
        setClients(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  if (loading) return <p>Loading clients...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const filteredClients = clients.filter((c) =>
  c.client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  c.client.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
);

return (
  <div className="max-w-7xl mx-auto px-6 py-8">
    <h1 className="text-3xl font-bold mb-6">Client Directory</h1>

    {/* Search input */}
    <input
      type="text"
      placeholder="Search by company or contact name..."
      className="mb-6 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />

    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-md">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Company</th>
            <th className="px-4 py-2 text-left">Contact</th>
            <th className="px-4 py-2 text-left">Last Submission</th>
            <th className="px-4 py-2 text-left">Pending</th>
            <th className="px-4 py-2 text-left">Approved</th>
            <th className="px-4 py-2 text-left">Rejected</th>
            <th className="px-4 py-2 text-left">Needs Correction</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.map(({ client, lastSubmission, pendingCount, approvedCount, rejectedCount, needsCorrectionCount }) => (
            <tr key={client.id} className="border-b hover:bg-gray-50 cursor-pointer">
              <td className="px-4 py-2">{client.companyName}</td>
              <td className="px-4 py-2">{client.contactPerson || '—'}</td>
              <td className="px-4 py-2">{lastSubmission ? new Date(lastSubmission).toLocaleDateString() : 'No submissions'}</td>
              <td className="px-4 py-2 text-yellow-600 font-medium">{pendingCount}</td>
              <td className="px-4 py-2 text-green-600 font-medium">{approvedCount}</td>
              <td className="px-4 py-2 text-red-600 font-medium">{rejectedCount}</td>
              <td className="px-4 py-2 text-orange-600 font-medium">{needsCorrectionCount}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => router.push(`/dashboard/assitance/clients/${client.id}/responses`)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  View Responses
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

}
