'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAppDispatch } from '@/store/hooks';
import { upsertService, removeService } from '@/store/slices/servicesSlice';
import type { IService } from '@/types';

export default function ServicesAdmin() {
  const dispatch = useAppDispatch();
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/services?all=1');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || `Failed to load services (${res.status})`);
        return;
      }
      setServices((data.data || []).filter((s: IService) => !s.isArchived));
    } catch (err: any) {
      setError(err?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const togglePublished = async (service: IService) => {
    if (!service._id) return;
    const next = { ...service, isPublished: !service.isPublished };
    const res = await fetch(`/api/services/${service._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: next.isPublished }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      dispatch(upsertService(data.data));
      setServices((prev) => prev.map((s) => (s._id === data.data._id ? data.data : s)));
    } else {
      setError(data.error || 'Update failed');
    }
  };

  const toggleMenu = async (service: IService) => {
    if (!service._id) return;
    const next = { ...service, showInMenu: !service.showInMenu };
    const res = await fetch(`/api/services/${service._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showInMenu: next.showInMenu }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      dispatch(upsertService(data.data));
      setServices((prev) => prev.map((s) => (s._id === data.data._id ? data.data : s)));
    } else {
      setError(data.error || 'Update failed');
    }
  };

  const archiveService = async (service: IService) => {
    if (!service._id) return;
    if (!confirm(`Archive “${service.title}”?\n\nIt will be hidden from the site (cards, menu, and /services/${service.slug} will 404). It can be restored by a developer from the database.`)) return;
    const res = await fetch(`/api/services/${service._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok && data.success) {
      dispatch(removeService({ id: service._id }));
      setServices((prev) => prev.filter((s) => s._id !== service._id));
    } else {
      setError(data.error || 'Archive failed');
    }
  };

  const sorted = [...services].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="min-h-screen bg-[#f7fafc] dark:bg-slate-900">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <AdminSidebar />
          <main className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#1a202c] dark:text-slate-100">Services</h1>
                <p className="text-sm text-[#718096] mt-1">
                  Add, edit, publish and reorder services. Each becomes a page at /services/{'{slug}'} automatically.
                </p>
              </div>
              <Link
                href="/admin/services/new"
                className="bg-[#1e3a5f] hover:bg-[#2c5282] text-white font-medium px-4 py-2 rounded-lg text-sm transition flex items-center gap-2 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Service
              </Link>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-500/20">
                {error}
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-[#718096]">Loading…</div>
              ) : sorted.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-[#718096]">No services yet.</p>
                  <Link
                    href="/admin/services/new"
                    className="inline-block mt-3 text-teal-700 hover:underline text-sm font-medium"
                  >
                    Add your first service →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-800/60">
                        <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">#</th>
                        <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Service</th>
                        <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Slug</th>
                        <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Menu</th>
                        <th className="text-left text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Status</th>
                        <th className="text-right text-xs font-medium text-[#718096] uppercase tracking-wider p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                      {sorted.map((service, i) => {
                        const published = service.isPublished !== false && service.isArchived !== true;
                        return (
                          <tr key={service._id || service.slug} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition">
                            <td className="p-3 text-sm text-[#a0aec0]">{i + 1}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <span className="w-9 h-9 bg-teal-600/10 dark:bg-teal-400/20 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                                  {service.icon || '📄'}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-medium text-[#1a202c] dark:text-slate-100 truncate">{service.title}</p>
                                  <p className="text-xs text-[#a0aec0] truncate">
                                    Card order {service.order ?? 0} · Menu order {service.menuOrder ?? 0}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-sm text-[#718096]">/{service.slug}</td>
                            <td className="p-3">
                              <button
                                onClick={() => toggleMenu(service)}
                                title={service.showInMenu ? 'Shown in nav dropdown — click to hide' : 'Hidden from nav dropdown — click to show'}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  service.showInMenu
                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                    : 'bg-gray-100 dark:bg-slate-700 text-[#718096]'
                                }`}
                              >
                                {service.showInMenu ? 'In menu' : 'Hidden'}
                              </button>
                            </td>
                            <td className="p-3">
                              {service.isArchived ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-slate-700 text-[#718096]">
                                  Archived
                                </span>
                              ) : (
                                <button
                                  onClick={() => togglePublished(service)}
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    published
                                      ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                                      : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                                  }`}
                                >
                                  {published ? 'Published' : 'Draft'}
                                </button>
                              )}
                            </td>
                            <td className="p-3 text-right whitespace-nowrap space-x-3">
                              <Link
                                href={`/admin/services/${service._id}`}
                                className="text-[#1e3a5f] dark:text-teal-400 hover:underline text-sm font-medium"
                              >
                                Edit
                              </Link>
                              {published && (
                                <Link
                                  href={`/services/${service.slug}`}
                                  target="_blank"
                                  className="text-green-600 dark:text-green-400 hover:underline text-sm font-medium"
                                >
                                  View
                                </Link>
                              )}
                              {!service.isArchived && (
                                <button
                                  onClick={() => archiveService(service)}
                                  className="text-red-500 hover:underline text-sm font-medium"
                                >
                                  Archive
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
