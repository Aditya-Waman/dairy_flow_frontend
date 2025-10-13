import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, setAuthToken, clearAuthToken } from "@/lib/api";

export type Role = "superadmin" | "admin";
export type User = { name: string; mobile: string; role: Role };

type AuthContextType = {
  user: User | null;
  login: (mobile: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_KEY = "auth:user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch {}
    }
  }, []);

  const login = useCallback(async (mobile: string, password: string) => {
    try {
      // Call backend API for authentication
      const response = await authApi.login(mobile.trim(), password);

      if (response.success && response.user && response.token) {
        const userRec: User = {
          name: response.user.name,
          mobile: response.user.mobile,
          role: response.user.role,
        };

        setUser(userRec);
        // Store both user data and token in localStorage
        localStorage.setItem(LS_KEY, JSON.stringify({
          ...userRec,
          token: response.token
        }));
        // Also set the token for API calls
        setAuthToken(response.token);

        return { ok: true as const };
      } else {
        return { ok: false as const, error: (response as any).error || "Login failed" };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        ok: false as const,
        error: error.message || "Network error occurred"
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call backend logout API
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    }

    setUser(null);
    clearAuthToken();
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return children as any; // The router will handle redirection in route elements
  return children;
}

export function hasRole(user: User | null, role: Role) {
  return !!user && user.role === role;
}
