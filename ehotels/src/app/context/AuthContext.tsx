"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/api";

interface AuthContextType {
  user: { userId: number; role: string; fullName: string } | null;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ userId: number; role: string; fullName: string } | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    apiFetch("/auth/me")
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  // Login function
  const login = async (email: string, password: string, role: string) => {
    await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
    const userData = await apiFetch("/auth/me");
    setUser(userData);
  };

  // Logout function
  const logout = async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
