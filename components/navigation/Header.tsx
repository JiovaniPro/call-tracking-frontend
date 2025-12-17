"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../layout/AppShell";
import { NotificationBell } from "../notifications/NotificationBell";

export const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const gradient = "linear-gradient(135deg, #6a2cff, #8c5bff)";

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between border-b px-8 py-4 backdrop-blur-md ${
        isDark
          ? "border-slate-800 bg-[#0f172a]/80 text-white"
          : "border-slate-100 bg-white/80 text-slate-900"
      }`}
      suppressHydrationWarning
    >
      <div>
        <h1 className="text-lg font-semibold">Statistiques d’appels</h1>
        <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Suivez vos appels, conversions et rappels en un coup d’œil.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <button
          onClick={toggleTheme}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${
            isDark
              ? "bg-white/5 text-slate-100 hover:bg-white/10"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
          style={{ cursor: "pointer" }}
          aria-label="Basculer le thème"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shadow-md"
            style={{ background: gradient }}
          >
            JD
          </div>
          <div className="hidden text-xs leading-tight sm:block">
            <p className="font-medium">{isDark ? "John Doe" : "John Doe"}</p>
            <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>
              Superviseur appels
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};


