'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPages, deletePage } from '@/store/slices/pagesSlice';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminDashboard() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { pages, loading } = useAppSelector((state) => state.pages);

  useEffect(() => { dispatch(fetchPages()); }, [dispatch]);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this page?')) return;
    dispatch(deletePage(id));
  };

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <AdminSidebar />
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#1a202c]">Dashboard</h1>
                <p className="text-sm text-[#718096] mt-1">Welcome back, {user?.email}</p>
              </div>
              <Link href="/admin/pages/new" className="bg-[#1e3a5f] hover:bg-[#2c5282] text-white font-medium px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                New Page
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-[#1e3a5f]">{pages.length}</div>
                <div className="text-sm text-[#718096]">Total Pages</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-green-600">{pages.filter(p => p.isPublished).length}</div>
                <div className="text-sm text-[#718096]">Published</div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-yellow-600">{pages.filter(p => !p.isPublished).length}</div>
                <div className="text-sm text-[#718096]">Drafts</div>
              </div>
            </div>

            {/* Pages Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#1a202c]">Pages</h2>
              </div>
              {loading ? (
                <div className="p-8 text-center text-[#718096]">Loading...</div>
              ) : pages.length === 0 ? (
                <div className="p-8 text-center text-[#718096]">No pages yet.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Title</th>
                      <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Slug</th>
                      <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Status</th>
                      <th className="text-right text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pages.map((page) => (
                      <tr key={page._id} className="hover:bg-gray-50 transition">
                        <td className="p-3 font-medium text-[#1a202c]">{page.title}</td>
                        <td className="p-3 text-[#718096] text-sm">/{page.slug}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${page.isPublished ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                            {page.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-3">
                          <Link href={`/admin/pages/edit/${page._id}`} className="text-[#1e3a5f] hover:underline text-sm font-medium">Edit</Link>
                          <button onClick={() => handleDelete(page._id)} className="text-red-500 hover:underline text-sm font-medium">Delete</button>
                          <Link href={`/${page.slug}`} target="_blank" className="text-green-600 hover:underline text-sm font-medium">View</Link>
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
