"use client";

import React from "react";
import { useTheme } from "../layout/AppShell";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  PhoneCall,
  LucideIcon,
} from "lucide-react";

export type NotificationItem = {
  id: string;
  label: string;
  time: string;
  read: boolean;
  type: "reminder" | "calls" | "success" | "warning";
  href?: string;
};

type NotificationDropdownProps = {
  open: boolean;
  items: NotificationItem[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
};

const typeConfig: Record<
  NotificationItem["type"],
  { icon: LucideIcon; className: string }
> = {
  reminder: {
    icon: Bell,
    className: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-200",
  },
  calls: {
    icon: PhoneCall,
    className: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-200",
  },
  success: {
    icon: CheckCircle2,
    className:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-200",
  },
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  open,
  items,
  onClose,
  onMarkRead,
  onMarkAllRead,
}) => {
  const { isDark } = useTheme();
  if (!open) return null;

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 top-full z-50 mt-3 w-96">
      <div
        className={`overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md transition ${
          isDark
            ? "border-slate-800/80 bg-slate-900/95 text-slate-50 shadow-black/40 ring-1 ring-slate-900/60"
            : "border-slate-100/80 bg-white text-slate-900 shadow-slate-200/70 ring-1 ring-white/80"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                : "Toutes les notifications sont lues"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] font-semibold text-violet-600 transition hover:text-violet-700 focus:outline-none dark:text-violet-200 dark:hover:text-violet-100"
              style={{ cursor: "pointer" }}
            >
              Tout marquer comme lu
            </button>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="text-[11px] text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
              style={{ cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="max-h-80 divide-y divide-slate-100/80 overflow-y-auto text-sm dark:divide-slate-800/80">
          {items.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-6 text-slate-500 dark:text-slate-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 ring-1 ring-slate-100 dark:bg-slate-900/50 dark:ring-slate-800/70">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Aucune notification pour le moment
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Vous recevrez vos rappels et alertes ici.
                </p>
              </div>
            </div>
          ) : (
            items.map((item) => {
              const Icon = typeConfig[item.type].icon;
              const iconClass = typeConfig[item.type].className;
              return (
                <button
                  key={item.id}
                  onClick={() => onMarkRead(item.id)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                    item.read
                      ? "bg-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                      : "bg-violet-50/70 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/30"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-[13px] ${iconClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p
                      className={`text-[13px] leading-snug ${
                        item.read
                          ? "text-slate-600 dark:text-slate-300"
                          : "font-semibold text-slate-900 dark:text-white"
                      }`}
                    >
                      {item.label}
                    </p>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.time}
                    </span>
                  </div>
                  {!item.read && (
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_0_4px_rgba(124,58,237,0.15)]" />
                  )}
                </button>
              );
            })
          )}
        </div>

        <a
          href="/notifications"
          className={`block w-full px-4 py-3 text-center text-[13px] font-semibold transition ${
            isDark
              ? "bg-slate-900 text-slate-100 hover:bg-slate-800"
              : "bg-slate-50 text-slate-800 hover:bg-slate-100"
          }`}
          style={{ cursor: "pointer" }}
        >
          Voir toutes les notifications
        </a>
      </div>
    </div>
  );
};


