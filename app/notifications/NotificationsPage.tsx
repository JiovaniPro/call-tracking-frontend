"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Filter,
  ListFilter,
  PhoneCall,
} from "lucide-react";
import { AppShell, useTheme } from "../../components/layout/AppShell";

type NotificationRow = {
  id: string;
  label: string;
  time: string;
  type: "reminder" | "calls" | "success" | "warning";
  read: boolean;
  href?: string;
};

const MOCK_NOTIFS: NotificationRow[] = [
  {
    id: "n-1",
    label: "Rappel prévu aujourd’hui : Jean Dupont – 09:00",
    time: "Il y a 12 min",
    type: "reminder",
    read: false,
    href: "/reminders",
  },
  {
    id: "n-2",
    label: "3 rappels à effectuer aujourd’hui",
    time: "Il y a 35 min",
    type: "calls",
    read: false,
    href: "/reminders",
  },
  {
    id: "n-3",
    label: "Appel effectué : Marie Rakoto",
    time: "Il y a 1 h",
    type: "success",
    read: false,
    href: "/today",
  },
  {
    id: "n-4",
    label: "Faux numéro détecté",
    time: "Hier",
    type: "warning",
    read: true,
    href: "/calls",
  },
  {
    id: "n-5",
    label: "Synthèse quotidienne prête",
    time: "Hier - 18:10",
    type: "success",
    read: true,
  },
  {
    id: "n-6",
    label: "Rappel déplacé : Agence Horizon à 16:30",
    time: "Il y a 2 h",
    type: "reminder",
    read: true,
    href: "/reminders",
  },
];

const typeConfig = {
  reminder: {
    label: "Rappel",
    color:
      "bg-violet-50 text-violet-700 ring-1 ring-violet-100 dark:bg-violet-900/30 dark:text-violet-100 dark:ring-violet-800/50",
    Icon: Bell,
  },
  calls: {
    label: "Appels",
    color:
      "bg-sky-50 text-sky-700 ring-1 ring-sky-100 dark:bg-sky-900/30 dark:text-sky-100 dark:ring-sky-800/50",
    Icon: PhoneCall,
  },
  success: {
    label: "Succès",
    color:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-100 dark:ring-emerald-800/50",
    Icon: CheckCircle2,
  },
  warning: {
    label: "Alerte",
    color:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-900/30 dark:text-amber-100 dark:ring-amber-800/50",
    Icon: AlertTriangle,
  },
};

type ReadFilter = "all" | "unread" | "read";
type TypeFilter = "all" | NotificationRow["type"];

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
        active
          ? "bg-gradient-to-r from-[#dd7fff] via-[#7264ff] to-[#54d4ef] text-white shadow-sm"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
      }`}
      style={{ cursor: "pointer" }}
    >
      {children}
    </button>
  );
}

function NotificationsPageInner() {
  const { isDark } = useTheme();
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filtered = useMemo(() => {
    return MOCK_NOTIFS.filter((n) => {
      if (readFilter === "unread" && n.read) return false;
      if (readFilter === "read" && !n.read) return false;
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      return true;
    });
  }, [readFilter, typeFilter]);

  const unreadCount = MOCK_NOTIFS.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10">
          <ListFilter className="h-3.5 w-3.5" />
          Notifications
        </div>
        <h1 className="text-xl font-semibold">Toutes les notifications</h1>
        <p className={`max-w-2xl text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Historique mocké prêt à être connecté à l’API `/me/notifications`.
          Filtres lecture et type inclus (mock).
        </p>
      </div>

      <div
        className={`rounded-2xl border p-4 shadow-sm ${
          isDark
            ? "border-slate-800 bg-[#0f1a2f] text-slate-50"
            : "border-slate-100 bg-white text-slate-900"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span>Filtres</span>
          </div>
          <span
            className="rounded-full bg-gradient-to-r from-[#dd7fff] via-[#7264ff] to-[#54d4ef] px-3 py-1 text-[11px] font-semibold text-white shadow-sm"
          >
            {unreadCount} non lue(s)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 py-3">
          <FilterPill active={readFilter === "all"} onClick={() => setReadFilter("all")}>
            Toutes
          </FilterPill>
          <FilterPill active={readFilter === "unread"} onClick={() => setReadFilter("unread")}>
            Non lues
          </FilterPill>
          <FilterPill active={readFilter === "read"} onClick={() => setReadFilter("read")}>
            Lues
          </FilterPill>
          <div className="mx-2 h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <FilterPill active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>
            Tous types
          </FilterPill>
          <FilterPill active={typeFilter === "reminder"} onClick={() => setTypeFilter("reminder")}>
            Rappel
          </FilterPill>
          <FilterPill active={typeFilter === "calls"} onClick={() => setTypeFilter("calls")}>
            Appels
          </FilterPill>
          <FilterPill active={typeFilter === "warning"} onClick={() => setTypeFilter("warning")}>
            Alertes
          </FilterPill>
          <FilterPill active={typeFilter === "success"} onClick={() => setTypeFilter("success")}>
            Succès
          </FilterPill>
        </div>

        <div className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="flex items-center gap-3 px-2 py-4 text-slate-500 dark:text-slate-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-100 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-800/70">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Aucune notification pour ce filtre
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ajustez vos filtres ou revenez plus tard.
                </p>
              </div>
            </div>
          ) : (
            filtered.map((notif) => {
              const cfg = typeConfig[notif.type];
              return (
                <a
                  key={notif.id}
                  href={notif.href ?? "#"}
                  className={`flex items-start gap-3 px-2 py-3 transition hover:-translate-y-0.5 ${
                    notif.read
                      ? isDark
                        ? "hover:bg-white/5"
                        : "hover:bg-slate-50"
                      : isDark
                      ? "bg-white/5"
                      : "bg-slate-50"
                  }`}
                  style={{ cursor: notif.href ? "pointer" : "default" }}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${cfg.color}`}
                  >
                    <cfg.Icon className="h-4 w-4" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold leading-snug">
                        {notif.label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {notif.time}
                    </span>
                  </div>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      notif.read
                        ? "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-800"
                        : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-100 dark:ring-emerald-800/70"
                    }`}
                  >
                    {notif.read ? "Lu" : "Non lu"}
                  </span>
                </a>
              );
            })
          )}
        </div>

        <div
          className={`mt-3 flex items-center justify-between rounded-xl border px-4 py-3 text-xs ${
            isDark
              ? "border-slate-800 bg-slate-900 text-slate-200"
              : "border-slate-100 bg-slate-50 text-slate-600"
          }`}
        >
          <span>Pagination mock — 1 / 1</span>
          <span className="text-slate-500 dark:text-slate-400">
            Scrolling interne si la liste est longue.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <AppShell>
      <NotificationsPageInner />
    </AppShell>
  );
}


