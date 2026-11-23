"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
      return data.user ?? null;
    } catch (error) {
      console.error("[Auth] Session load failed:", error);
      setUser(null);
      return null;
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async ({ email, password }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || "Login fail ho gaya" };
    }

    setUser(data.user);
    setIsLoaded(true);
    return { ok: true, user: data.user };
  }, []);

  const signup = useCallback(async ({ name, email, password, role }) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || "Account nahi ban saka" };
    }

    setUser(data.user);
    setIsLoaded(true);
    return { ok: true, user: data.user };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("[Auth] Logout request failed:", error);
    }
    setUser(null);
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoaded,
      isSignedIn: !!user,
      login,
      signup,
      logout,
      refresh,
      setUser,
    }),
    [user, isLoaded, login, signup, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth ko AuthProvider ke andar hi use karein");
  }
  return context;
}

/** Clerk ke `useUser()` jaisi shape, taake pages me minimal changes lagen. */
export function useUser() {
  const { user, isLoaded, isSignedIn } = useAuth();
  return { user, isLoaded, isSignedIn };
}
