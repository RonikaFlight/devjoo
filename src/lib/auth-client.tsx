'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  roles: string[];
  profile: {
    avatarUrl: string | null;
    headline: string | null;
    bio: string | null;
    city: string | null;
  } | null;
  needsOnboarding: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isFreelancer: boolean;
  isEmployer: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isLoggedIn: false,
  isFreelancer: false,
  isEmployer: false,
  isAdmin: false,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/me');
      if (res.ok) {
        const json = await res.json();
        setUser(json.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    router.push('/');
    router.refresh();
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Redirect to role-select if onboarding incomplete
  useEffect(() => {
    if (!isLoading && user?.needsOnboarding) {
      const publicPaths = ['/', '/projects', '/categories', '/blog', '/hire'];
      const isPublic = publicPaths.some(
        (p) => pathname === p || pathname.startsWith(p + '/')
      );
      if (!isPublic && pathname !== '/auth/role-select' && pathname !== '/auth/login') {
        router.push('/auth/role-select');
      }
    }
  }, [isLoading, user, pathname, router]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isLoggedIn: !!user,
    isFreelancer: user?.roles?.includes('FREELANCER') ?? false,
    isEmployer: user?.roles?.includes('EMPLOYER') ?? false,
    isAdmin: user?.roles?.includes('ADMIN') ?? false,
    refresh,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
