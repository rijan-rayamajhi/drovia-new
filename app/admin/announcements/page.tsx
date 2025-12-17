'use client';

import { useState, useEffect } from 'react';
import { isAdminAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [text, setText] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!isAdminAuthenticated()) {
            router.push('/admin/login');
            return;
        }
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        const res = await fetch('/api/announcements?admin=true', { cache: 'no-store' });
        const data = await res.json();
        setAnnouncements(data);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        const res = await fetch('/api/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (res.ok) {
            setText('');
            loadAnnouncements();
        } else {
            const err = await res.json();
            alert('Error: ' + err.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete?')) return;
        await fetch('/api/announcements', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        loadAnnouncements();
    };

    const handleToggle = async (id: string) => {
        await fetch('/api/announcements', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        loadAnnouncements();
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Manage Announcements</h1>

            <form onSubmit={handleCreate} className="mb-8 flex gap-4">
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="New announcement text..."
                    className="flex-1 p-2 border rounded"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Add
                </button>
            </form>

            <div className="bg-white shadow rounded overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Text</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {announcements.map(a => (
                            <tr key={a.id} className="border-b">
                                <td className="p-4">{a.text}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-sm ${a.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {a.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => handleToggle(a.id)} className="text-blue-600 hover:underline">
                                        Toggle
                                    </button>
                                    <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {announcements.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-gray-500">No announcements found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
