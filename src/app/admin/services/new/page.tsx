'use client';

import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ServiceEditor from '@/components/admin/services/ServiceEditor';
import { useAppDispatch } from '@/store/hooks';
import { upsertService } from '@/store/slices/servicesSlice';
import type { IService } from '@/types';

export default function NewServicePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleCreate = async (payload: Partial<IService>) => {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Create failed (${res.status})`);
    }
    const saved = data.data as IService;
    dispatch(upsertService(saved));
    // Go to the edit screen so the admin can review/fine-tune the new record.
    router.push(`/admin/services/${saved._id}`);
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] dark:bg-slate-900">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <AdminSidebar />
          <main className="flex-1 min-w-0">
            <ServiceEditor initial={null} onSubmit={handleCreate} />
          </main>
        </div>
      </div>
    </div>
  );
}
