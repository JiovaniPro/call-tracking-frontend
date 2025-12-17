"use client";

import React from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "../layout/AppShell";
import { NotificationBell } from "../notifications/NotificationBell";
import { useAuth } from "../../lib/auth";

export const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const gradient = "linear-gradient(135deg, #6a2cff, #8c5bff)";

  // Get user initials
  const getInitials = (name?: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

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
        <h1 className="text-lg font-semibold">Statistiques d'appels</h1>
        <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Suivez vos appels, conversions et rappels en un coup d'œil.
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
          aria-label="Basculer le thème"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shadow-md"
              style={{ background: gradient }}
            >
              {getInitials(user.name)}
            </div>
            <div className="hidden text-xs leading-tight sm:block">
              <p className="font-medium">{user.name}</p>
              <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                {user.role === "ADMIN" ? "Administrateur" : "Utilisateur"}
              </p>
            </div>
            <button
              onClick={logout}
              className={`ml-2 flex h-8 w-8 items-center justify-center rounded-full transition ${
                isDark
                  ? "bg-white/5 text-slate-300 hover:bg-red-500/20 hover:text-red-400"
                  : "bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-500"
              }`}
              aria-label="Déconnexion"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shadow-md"
              style={{ background: gradient }}
            >
              ??
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
