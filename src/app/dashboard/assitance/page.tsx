'use client';
import { useEffect, useState } from 'react';

type EventData = {
  _id: string;
  title: string;
  clientName: string;
  status: string;
};

export default function AssistantDashboard() {
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('http://localhost:3001/api/events');
        if (!res.ok) throw new Error('Failed to fetch events');
        const data: EventData[] = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchEvents();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`http://localhost:3001/api/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setEvents((prev) =>
      prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📦 Assistant Dashboard</h1>

      {events.length === 0 ? (
        <p>No events assigned yet.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{event.title}</h2>
                <p className="text-gray-600">Client: {event.clientName}</p>
                <p className="text-sm text-gray-500">Status: {event.status}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => updateStatus(event._id, 'In Progress')}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  In Progress
                </button>
                <button
                  onClick={() => updateStatus(event._id, 'Completed')}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Completed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
