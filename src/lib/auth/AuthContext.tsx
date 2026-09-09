'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  userId: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth?action=me');
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
      } else {
        // Try refresh token
        const refreshRes = await fetch('/api/auth?action=refresh', { method: 'POST' });
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          // Retry me after refresh
          const retryRes = await fetch('/api/auth?action=me');
          const retryData = await retryRes.json();
          if (retryData.success) {
            setUser(retryData.data);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshAuth().finally(() => setLoading(false));

    // Refresh token every 14 minutes (token expires in 15 min)
    const interval = setInterval(() => {
      refreshAuth();
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshAuth]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setUser(data.data.user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    setUser(data.data.user);
  };

  const logout = async () => {
    await fetch('/api/auth?action=logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
