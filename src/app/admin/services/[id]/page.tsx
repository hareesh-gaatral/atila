'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ServiceEditor from '@/components/admin/services/ServiceEditor';
import { useAppDispatch } from '@/store/hooks';
import { upsertService } from '@/store/slices/servicesSlice';
import type { IService } from '@/types';

export default function EditServicePage() {
  const params = useParams();
  const id = params?.id as string;
  const dispatch = useAppDispatch();

  const [service, setService] = useState<IService | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/services/${id}?admin=1`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoadError(data.error || `Failed to load service (${res.status})`);
        return;
      }
      setService(data.data);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load service');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (payload: Partial<IService>) => {
    const res = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Save failed (${res.status})`);
    }
    const saved = data.data as IService;
    dispatch(upsertService(saved));
    setService(saved);
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] dark:bg-slate-900">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <AdminSidebar />
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center text-[#718096]">
                Loading…
              </div>
            ) : loadError || !service ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
                <h1 className="text-lg font-bold text-[#1a202c] dark:text-slate-100">Service not found</h1>
                <p className="text-sm text-[#718096] mt-2">
                  {loadError || 'This service could not be loaded. It may have been archived or removed.'}
                </p>
                <Link
                  href="/admin/services"
                  className="inline-block mt-4 text-teal-700 hover:underline text-sm font-medium"
                >
                  ← Back to Services
                </Link>
              </div>
            ) : (
              <ServiceEditor initial={service} onSubmit={handleSave} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
