'use client';

import { useState, useEffect } from 'react';
import { Download, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllSubscribers } from '@/lib/subscribers';

interface Subscriber {
  email: string;
  timestamp: string;
  source: string;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    const data = await getAllSubscribers();
    setSubscribers(data);
    setLoading(false);
  };

  const handleExportCSV = () => {
    const headers = ['Email', 'Subscribed Date', 'Source'];
    const rows = subscribers.map((s) => [
      s.email,
      new Date(s.timestamp).toLocaleString('en-IN'),
      s.source,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
          <p className="text-text-light mt-2">Manage email subscriptions from the "Stay Updated" section</p>
        </div>
        {subscribers.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-soft mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-text-light text-sm">Total Subscribers</p>
            <p className="text-3xl font-bold text-text">{subscribers.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-text-light">
            Loading subscribers...
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-12 text-center text-text-light">
            <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No subscribers yet</p>
            <p className="text-sm mt-2">Subscribers will appear here when they sign up via the "Stay Updated" section</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-text-light font-semibold">Email</th>
                    <th className="text-left py-4 px-6 text-text-light font-semibold">Subscribed Date</th>
                    <th className="text-left py-4 px-6 text-text-light font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((subscriber, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium">{subscriber.email}</td>
                        <td className="py-4 px-6 text-text-light">{formatDate(subscriber.timestamp)}</td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {subscriber.source}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

