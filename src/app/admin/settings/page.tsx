'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Setting { _id: string; key: string; value: string; type: string; }

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ key: '', value: '', type: 'text' });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) setSettings(data.data);
    } catch (err) { console.error('Failed'); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.key || !form.value) return;
    await fetch('/api/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    setForm({ key: '', value: '', type: 'text' });
    fetchSettings();
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/settings?key=${key}`, { method: 'DELETE' });
    fetchSettings();
  };

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <AdminSidebar />
          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1a202c]">Settings</h1>
              <p className="text-sm text-[#718096] mt-1">Manage site settings</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="font-semibold text-[#1a202c] mb-4">Add / Update Setting</h3>
              <div className="grid grid-cols-4 gap-3">
                <input placeholder="Key" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" value={form.key} onChange={e => setForm({...form, key: e.target.value})} />
                <input placeholder="Value" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
                <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="text">Text</option>
                  <option value="image">Image URL</option>
                  <option value="json">JSON</option>
                </select>
                <button onClick={handleSave} className="bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2c5282] text-sm font-medium transition">Save</button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-[#718096]">Loading...</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Key</th>
                      <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Value</th>
                      <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Type</th>
                      <th className="text-right text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {settings.map(s => (
                      <tr key={s._id} className="hover:bg-gray-50 transition">
                        <td className="p-3 font-mono text-sm">{s.key}</td>
                        <td className="p-3 text-sm max-w-xs truncate">{s.value}</td>
                        <td className="p-3 text-sm">{s.type}</td>
                        <td className="p-3 text-right"><button onClick={() => handleDelete(s.key)} className="text-red-500 hover:underline text-sm font-medium">Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
