 "use client";

import React from "react";
import {
  LayoutDashboard,
  PhoneCall,
  CalendarClock,
  Settings,
  LogOut,
  LucideIcon,
  ListChecks,
  History,
  Users,
  Shield,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "../layout/AppShell";
import { useAuth } from "../../lib/auth";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const userNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "À appeler", href: "/calls", icon: ListChecks },
  { label: "Rappels", href: "/reminders", icon: CalendarClock },
  { label: "Appels effectués aujourd’hui", href: "/today", icon: PhoneCall },
  { label: "Journal des appels", href: "/history", icon: History },
];

const adminNavItems: NavItem[] = [
  { label: "Dashboard Admin", href: "/admin/dashboard", icon: Shield },
  { label: "Utilisateurs", href: "/admin/users", icon: Users },
  { label: "Employés", href: "/admin/employees", icon: Users },
  { label: "Journal des appels", href: "/admin/calls", icon: PhoneCall },
  { label: "Rappels", href: "/admin/reminders", icon: CalendarClock },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isDark } = useTheme();
  const { logout, user, isLoading } = useAuth();
  
  // Determine if we're on an admin route based on pathname (more reliable than role during loading)
  const isOnAdminRoute = pathname.startsWith("/admin");
  // Use role as fallback if not on admin route yet, but only if user is loaded
  const isAdmin = isOnAdminRoute || (user?.role === "ADMIN" && !isLoading);
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-64 flex-col px-6 py-6 backdrop-blur-md ${
        isDark
          ? "flex border-r border-slate-800 bg-[#0b1020]/90"
          : "flex border-r border-slate-100 bg-white/85"
      }`}
      suppressHydrationWarning
    >
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden">
          <img
            src="/logo.png"
            alt="Call Tracking Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div>
          <p
            className={`text-sm font-semibold ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Call Tracking
          </p>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {isAdmin ? "Administration" : "Dashboard"}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 text-sm">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${
              isDark
                ? "text-slate-300 hover:bg-white/5 hover:text-white"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            } ${
              pathname === item.href
                ? isDark
                  ? "bg-white/10 text-white"
                  : "bg-[#f2ebff] text-[#6a2cff]"
                : ""
            }`}
            style={{ cursor: "pointer" }}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-[15px] ${
                pathname === item.href
                  ? isDark
                    ? "text-white"
                    : "text-[#6a2cff]"
                  : isDark
                  ? "text-white/70"
                  : "text-[#6a2cff]"
              }`}
            >
              <item.icon className="h-4 w-4" />
            </span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className={`mt-6 space-y-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        <p className="text-[11px] uppercase tracking-wide">Préférences</p>
        <a
          href="/settings"
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
            isDark
              ? "text-slate-300 hover:bg-white/5 hover:text-white"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          } ${pathname === "/settings" ? (isDark ? "bg-white/10 text-white" : "bg-[#f2ebff] text-[#6a2cff]") : ""}`}
          style={{ cursor: "pointer" }}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              pathname === "/settings"
                ? isDark
                  ? "text-white"
                  : "text-[#6a2cff]"
                : isDark
                ? "text-white/70"
                : "text-[#6a2cff]"
            }`}
          >
            <Settings className="h-4 w-4" />
          </span>
          Paramètres
        </a>
        <button
          type="button"
          onClick={logout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
            isDark
              ? "text-slate-300 hover:bg-white/5 hover:text-white"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
          style={{ cursor: "pointer" }}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              isDark ? "text-white/80" : "text-[#6a2cff]"
            }`}
          >
            <LogOut className="h-4 w-4" />
          </span>
          Se déconnecter
        </button>
      </div>
    </aside>
  );
};


