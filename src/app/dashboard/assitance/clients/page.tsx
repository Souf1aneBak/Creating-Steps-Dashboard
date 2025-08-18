'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiUser, FiMail, FiPhone, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiEye, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Client {
  id: number;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  logo?: string;
}

interface ClientSummary {
  client: Client;
  lastSubmission?: string;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  needsCorrectionCount: number;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  needsCorrection: 'bg-orange-100 text-orange-800',
};

export default function ClientDirectoryPage() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

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

  const filteredClients = clients.filter((c) =>
    c.client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusPercentage = (client: ClientSummary) => {
    const total = client.pendingCount + client.approvedCount + client.rejectedCount + client.needsCorrectionCount;
    if (total === 0) return { approved: 0, rejected: 0, pending: 0, needsCorrection: 0 };
    
   return {
  approved: Math.round((client.approvedCount / total) * 100),
  rejected: Math.round((client.rejectedCount / total) * 100),
  pending: Math.round((client.pendingCount / total) * 100),
  needsCorrection: Math.round((client.needsCorrectionCount / total) * 100),
};

  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return <p className="text-red-600 text-center p-8">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Directory</h1>
          <p className="text-gray-600 mt-2">
            {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} found
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 rounded-lg ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Cards
            </button>
            
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Summary
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map(({ client, lastSubmission, pendingCount, approvedCount, rejectedCount, needsCorrectionCount }) => (
                <motion.tr 
                  key={client.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {client.logo ? (
                        <img className="h-10 w-10 rounded-full object-cover mr-3" src={client.logo} alt={client.companyName} />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-3">
                          {client.companyName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{client.companyName}</div>
                        <div className="text-gray-500 text-sm flex items-center">
                          <FiMail className="mr-1" size={12} />
                          {client.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiUser className="mr-1 text-gray-400" size={14} />
                      <span>{client.contactPerson || '—'}</span>
                    </div>
                    {client.phone && (
                      <div className="text-gray-500 text-sm flex items-center mt-1">
                        <FiPhone className="mr-1" size={12} />
                        {client.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiClock className="mr-1 text-gray-400" size={14} />
                      <span>
                        {lastSubmission ? new Date(lastSubmission).toLocaleDateString() : 'No submissions'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.approved}`}>
                        <FiCheckCircle className="inline mr-1" size={12} />
                        {approvedCount} Approved
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.pending}`}>
                        <FiClock className="inline mr-1" size={12} />
                        {pendingCount} Pending
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.rejected}`}>
                        <FiXCircle className="inline mr-1" size={12} />
                        {rejectedCount} Rejected
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.needsCorrection}`}>
                        <FiAlertCircle className="inline mr-1" size={12} />
                        {needsCorrectionCount} Needs Fix
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => router.push(`/dashboard/assitance/clients/${client.id}/responses`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                    >
                      <FiEye size={14} />
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(({ client, lastSubmission, pendingCount, approvedCount, rejectedCount, needsCorrectionCount }) => {
            const percentages = getStatusPercentage({ client, pendingCount, approvedCount, rejectedCount, needsCorrectionCount });
            
            return (
              <motion.div
                key={client.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {client.logo ? (
                      <img className="h-12 w-12 rounded-full object-cover mr-4" src={client.logo} alt={client.companyName} />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xl mr-4">
                        {client.companyName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{client.companyName}</h3>
                      {client.contactPerson && (
                        <p className="text-gray-600 flex items-center">
                          <FiUser className="mr-1" size={14} />
                          {client.contactPerson}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Last activity:</span>
                      <span className="text-gray-900">
                        {lastSubmission ? new Date(lastSubmission).toLocaleDateString() : 'No submissions'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Email:</span>
                      <span className="text-gray-900 truncate max-w-[150px]">
                        {client.email || '—'}
                      </span>
                    </div>
                    {client.phone && (
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Phone:</span>
                        <span className="text-gray-900">{client.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div className="h-full flex">
                        {approvedCount > 0 && (
                          <div 
                            className={`${statusColors.approved}`} 
                            style={{ width: `${percentages.approved}%` }}
                          ></div>
                        )}
                        {pendingCount > 0 && (
                          <div 
                            className={`${statusColors.pending}`} 
                            style={{ width: `${percentages.pending}%` }}
                          ></div>
                        )}
                        {rejectedCount > 0 && (
                          <div 
                            className={`${statusColors.rejected}`} 
                            style={{ width: `${percentages.rejected}%` }}
                          ></div>
                        )}
                        {needsCorrectionCount > 0 && (
                          <div 
                            className={`${statusColors.needsCorrection}`} 
                            style={{ width: `${percentages.needsCorrection}%` }}
                          ></div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Status distribution</span>
                      <span>Total: {approvedCount + pendingCount + rejectedCount + needsCorrectionCount}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.approved}`}>
                      {approvedCount} Approved
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.pending}`}>
                      {pendingCount} Pending
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.rejected}`}>
                      {rejectedCount} Rejected
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.needsCorrection}`}>
                      {needsCorrectionCount} Needs Fix
                    </span>
                  </div>

                  <button
                    onClick={() => router.push(`/dashboard/assitance/clients/${client.id}/responses`)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <FiEye size={16} />
                    View Responses
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiSearch size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No clients found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm ? 'Try adjusting your search query' : 'It looks like there are no clients in the system yet'}
          </p>
          <button
            onClick={() => router.push('/dashboard/assitance/clients/add')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <FiPlus size={16} />
            Add New Client
          </button>
        </div>
      )}
    </div>
  );
}