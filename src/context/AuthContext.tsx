import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firebaseConfigured } from '../lib/firebase';
import * as authService from '../services/authService';
import { getProfile } from '../services/userService';
import type { UserProfile } from '../types';

interface AuthValue {
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerStudent: (v: Parameters<typeof authService.registerStudent>[0]) => Promise<void>;
  registerAdviser: (v: Parameters<typeof authService.registerAdviser>[0]) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);
  const registering = useRef(false); // while true, the auth listener must not read the (not yet created) profile

  useEffect(() => {
    if (!firebaseConfigured) return undefined;
    return onAuthStateChanged(auth, async (user) => {
      if (registering.current) return;
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        setProfile(await getProfile(user.uid));
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    const user = auth.currentUser;
    setProfile(user ? await getProfile(user.uid) : null);
  }, []);

  const register = useCallback(
    async (fn: () => Promise<string>) => {
      registering.current = true;
      try {
        const uid = await fn();
        setProfile(await getProfile(uid));
      } finally {
        registering.current = false;
      }
    },
    [],
  );

  const value = useMemo<AuthValue>(
    () => ({
      profile,
      loading,
      login: authService.login,
      logout: async () => {
        await authService.logout();
        setProfile(null);
      },
      registerStudent: (v) => register(() => authService.registerStudent(v)),
      registerAdviser: (v) => register(() => authService.registerAdviser(v)),
      refreshProfile,
    }),
    [profile, loading, register, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
