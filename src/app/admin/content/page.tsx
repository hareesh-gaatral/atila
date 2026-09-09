'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { CMS_CONTENT_TYPES } from '@/lib/cmsContent';

interface SectionDoc {
  _id: string;
  sectionType: string;
  isActive?: boolean;
}

export default function ContentAdminIndex() {
  const [sections, setSections] = useState<SectionDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/sections');
        const data = await res.json();
        if (data.success) setSections(data.data);
      } catch {
        // Offline / DB down — show zero statuses.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusFor = (type: string) => {
    const found = sections.filter((s) => s.sectionType === type);
    return found.length > 0 ? (found.some((s) => s.isActive !== false) ? 'active' : 'inactive') : 'missing';
  };

  const homeDefs = CMS_CONTENT_TYPES.filter((d) => d.scope === 'home');
  const globalDefs = CMS_CONTENT_TYPES.filter((d) => d.scope === 'global');

  const badge: Record<string, { label: string; cls: string }> = {
    active: { label: 'Live', cls: 'bg-green-50 text-green-700' },
    inactive: { label: 'Inactive', cls: 'bg-yellow-50 text-yellow-700' },
    missing: { label: 'Not seeded', cls: 'bg-gray-100 text-gray-500' },
  };

  const renderGroup = (title: string, defs: typeof CMS_CONTENT_TYPES) => (
    <div className="mb-8">
      <h2 className="font-semibold text-[#1a202c] mb-3">{title}</h2>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {defs.map((def) => {
          const st = statusFor(def.type);
          const b = badge[st];
          return (
            <Link
              key={def.type}
              href={`/admin/content/${def.type}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition p-5 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{def.icon}</span>
                  <div>
                    <p className="font-semibold text-[#1a202c] group-hover:text-teal-700 transition">{def.label}</p>
                    <p className="text-xs text-[#a0aec0] uppercase tracking-wider mt-0.5">{def.scope}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${b.cls}`}>{loading ? '…' : b.label}</span>
              </div>
              <p className="text-sm text-[#718096] mt-3 leading-relaxed line-clamp-2">{def.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <AdminSidebar />
          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#1a202c]">Website Content</h1>
              <p className="text-sm text-[#718096] mt-1">
                Edit the live content of every section. Each screen edits one MongoDB section — the public site
                reflects your changes immediately.
              </p>
            </div>

            {renderGroup('Home Page Sections', homeDefs)}
            {renderGroup('Global Site Elements', globalDefs)}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-[#1a202c] mb-2">Advanced sections</h3>
              <p className="text-sm text-[#718096] leading-relaxed">
                Any section that lives in MongoDB but has no dedicated editor here (for example a future custom block)
                can still be managed from the{' '}
                <Link href="/admin/sections" className="text-teal-700 hover:underline font-medium">Sections</Link>{' '}
                page, or restored from the JSON defaults by re-running{' '}
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">npm run seed</code>.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
