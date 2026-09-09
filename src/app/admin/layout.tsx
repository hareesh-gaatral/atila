'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import AdminAuth from '@/components/admin/AdminAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminContent>{children}</AdminContent>;
}

function AdminContent({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#718096] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminAuth />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#f7fafc] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-4a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#1a202c] mb-2">Access Denied</h1>
          <p className="text-sm text-[#718096] mb-6">
            Your account does not have administrator privileges. Please contact the site administrator.
          </p>
          <button
            onClick={() => logout()}
            className="w-full bg-[#1e3a5f] hover:bg-[#2c5282] text-white font-medium py-2.5 rounded-lg transition text-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
