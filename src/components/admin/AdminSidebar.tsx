'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { CMS_CONTENT_TYPES } from '@/lib/cmsContent';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/pages', label: 'Pages', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/admin/sections', label: 'Sections', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { href: '/admin/services', label: 'Services', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { href: '/admin/media', label: 'Media', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: '/admin/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const homeDefs = CMS_CONTENT_TYPES.filter((d) => d.scope === 'home');
  const globalDefs = CMS_CONTENT_TYPES.filter((d) => d.scope === 'global');

  return (
    <aside className="w-56 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-22 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive(item.href)
                  ? 'bg-[#1e3a5f]/5 text-[#1e3a5f] font-medium'
                  : 'text-[#718096] hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Website content menu (driven by CMS_CONTENT_TYPES) */}
        <div className="pt-3 mt-3 border-t border-gray-100">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#a0aec0]">Website Content</p>
          {homeDefs.length > 0 && (
            <>
              <p className="px-3 pb-0.5 text-[10px] text-[#cbd5e0] uppercase tracking-wider">Home</p>
              {homeDefs.map((def) => (
                <Link
                  key={def.type}
                  href={`/admin/content/${def.type}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition ${
                    pathname === `/admin/content/${def.type}`
                      ? 'bg-teal-600/10 text-teal-700 font-medium'
                      : 'text-[#718096] hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm leading-none">{def.icon}</span>
                  {def.label}
                </Link>
              ))}
            </>
          )}
          {globalDefs.length > 0 && (
            <>
              <p className="px-3 pt-2 pb-0.5 text-[10px] text-[#cbd5e0] uppercase tracking-wider">Global</p>
              {globalDefs.map((def) => (
                <Link
                  key={def.type}
                  href={`/admin/content/${def.type}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition ${
                    pathname === `/admin/content/${def.type}`
                      ? 'bg-teal-600/10 text-teal-700 font-medium'
                      : 'text-[#718096] hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm leading-none">{def.icon}</span>
                  {def.label}
                </Link>
              ))}
            </>
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
