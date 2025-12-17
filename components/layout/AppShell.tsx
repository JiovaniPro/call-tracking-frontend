"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Sidebar } from "../navigation/Sidebar";
import { Header } from "../navigation/Header";

type ThemeContextValue = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeContext");
  return ctx;
};

type AppShellProps = {
  children: React.ReactNode;
};

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  // Toujours commencer avec false pour éviter l'hydratation mismatch
  // Le script dans layout.tsx applique déjà les styles au body avant le rendu
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Lire le thème depuis localStorage après le montage
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const currentTheme = saved === "dark";
    setIsDark(currentTheme);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Sauvegarder et appliquer le thème à chaque changement
      localStorage.setItem("theme", isDark ? "dark" : "light");
      document.body.style.backgroundColor = isDark ? "#0f172a" : "#F5F7FB";
      document.body.style.color = isDark ? "#f8fafc" : "#0f172a";
    }
  }, [isDark, mounted]);

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme: () => setIsDark((v) => !v),
    }),
    [isDark]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={`min-h-screen bg-transparent ${
          isDark ? "text-slate-50" : "text-slate-900"
        }`}
        suppressHydrationWarning
      >
        <Sidebar />
        <div
          className={`ml-64 flex min-h-screen flex-col ${
            isDark ? "bg-[#0f172a]" : "bg-[#F5F7FB]"
          } transition-colors`}
          suppressHydrationWarning
        >
          <Header />
          <main className="flex-1 px-8 pb-10 pt-6">{children}</main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};


