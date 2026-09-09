'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white dark:bg-[#1e293b] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/png/productLogo.png" alt="ATILA" className="h-8 w-auto" />
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="text-sm text-[#718096] dark:text-gray-400">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#718096] dark:text-gray-400 hidden sm:inline">{user?.email}</span>
            <ThemeToggle />
            <Link href="/" className="text-sm text-[#718096] dark:text-gray-400 hover:text-[#1e3a5f] dark:hover:text-white transition">View Site</Link>
            <button onClick={logout} className="text-sm text-red-500 hover:text-red-600 font-medium transition">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
