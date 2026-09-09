'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface Section {
  _id: string;
  pageTitle: string;
  pageSlug: string;
  sectionType: string;
  title?: string;
  order: number;
  isActive: boolean;
}

export default function SectionsAdmin() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSections(); }, []);

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/sections');
      const data = await res.json();
      if (data.success) setSections(data.data);
    } catch (err) { console.error('Failed'); } finally { setLoading(false); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/sections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchSections();
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    await fetch(`/api/sections/${id}`, { method: 'DELETE' });
    fetchSections();
  };

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <AdminSidebar />
          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1a202c]">Sections</h1>
              <p className="text-sm text-[#718096] mt-1">All page sections</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-[#718096]">Loading...</div>
              ) : sections.length === 0 ? (
                <div className="p-8 text-center text-[#718096]">No sections yet.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Order</th>
                      <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Page</th>
                      <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Type</th>
                      <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Title</th>
                      <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Status</th>
                      <th className="text-right text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sections.map((sec) => (
                      <tr key={sec._id} className="hover:bg-gray-50 transition">
                        <td className="p-3 text-sm">{sec.order}</td>
                        <td className="p-3 text-sm text-[#718096]">/{sec.pageSlug}</td>
                        <td className="p-3"><span className="bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-1 rounded text-xs font-medium">{sec.sectionType}</span></td>
                        <td className="p-3 text-sm">{sec.title || '-'}</td>
                        <td className="p-3">
                          <button onClick={() => toggleActive(sec._id, sec.isActive)} className={`px-2 py-1 rounded-full text-xs font-medium ${sec.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {sec.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => deleteSection(sec._id)} className="text-red-500 hover:underline text-sm font-medium">Delete</button>
                        </td>
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
