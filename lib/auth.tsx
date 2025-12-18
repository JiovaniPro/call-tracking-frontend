"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "../types/api";
import { authApi, getAccessToken, clearTokens, setAccessToken } from "./api";

// =============================================
// Auth Context Types
// =============================================

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// =============================================
// Auth Provider
// =============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.me();
        setUser(userData);
      } catch (error: any) {
        // Check if account is disabled
        if (error.message?.includes("désactivé") || error.message?.includes("disabled") || error.code === "ACCOUNT_DISABLED") {
          clearTokens();
          setUser(null);
          setIsLoading(false);
          // Redirect to login with message
          router.push("/login");
          return;
        }
        
        // Token invalid, try refresh
        try {
          const refreshed = await authApi.refresh();
          if (refreshed) {
            setUser(refreshed.user);
          } else {
            clearTokens();
          }
        } catch (refreshError: any) {
          // Check if account is disabled during refresh
          if (refreshError.message?.includes("désactivé") || refreshError.message?.includes("disabled") || refreshError.code === "ACCOUNT_DISABLED") {
            clearTokens();
            setUser(null);
            router.push("/login");
            return;
          }
          clearTokens();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      setUser(res.user);
      // Redirect admin to admin dashboard, user to regular dashboard
      if (res.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    // Clear state immediately to prevent flash and errors
    setUser(null);
    setIsLoading(false);
    clearTokens();
    setAccessToken(null);
    
    // Redirect immediately using window.location to avoid React Router issues
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      router.push("/login");
    }
    
    // Call logout API in background (don't block or throw errors)
    // Use setTimeout to ensure redirect happens first
    setTimeout(async () => {
      try {
        await authApi.logout();
      } catch {
        // Silently ignore logout API errors - we're already logged out locally
      }
    }, 0);
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch {
      // Silent fail
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================
// Hooks
// =============================================

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

// Protected route wrapper
export function useRequireAuth(redirectTo = "/login") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

// Admin-only route wrapper
export function useRequireAdmin(redirectTo = "/dashboard") {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.push(redirectTo);
    }
  }, [user, isAuthenticated, isLoading, router, redirectTo]);

  return { isAdmin: user?.role === "ADMIN", isLoading };
}

