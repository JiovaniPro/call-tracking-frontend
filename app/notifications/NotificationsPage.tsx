"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Filter,
  ListFilter,
  PhoneCall,
} from "lucide-react";
import { AppShell, useTheme } from "../../components/layout/AppShell";
import { useNotifications } from "../../lib/hooks";
import { notificationsApi } from "../../lib/api";
import { useRequireAuth } from "../../lib/auth";
import type { Notification, NotificationType } from "../../types/api";
import { useToast } from "../../components/ui/ToastProvider";

const typeConfig: Record<
  NotificationType,
  {
    label: string;
    color: string;
    Icon: React.ElementType;
  }
> = {
  REMINDER_DUE: {
    label: "Rappel",
    color:
      "bg-violet-50 text-violet-700 ring-1 ring-violet-100 dark:bg-violet-900/30 dark:text-violet-100 dark:ring-violet-800/50",
    Icon: Bell,
  },
  CALL_MISSED: {
    label: "Appel manqué",
    color:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-900/30 dark:text-amber-100 dark:ring-amber-800/50",
    Icon: PhoneCall,
  },
  SYSTEM: {
    label: "Système",
    color:
      "bg-sky-50 text-sky-700 ring-1 ring-sky-100 dark:bg-sky-900/30 dark:text-sky-100 dark:ring-sky-800/50",
    Icon: CheckCircle2,
  },
};

type ReadFilter = "all" | "unread" | "read";
type TypeFilter = "all" | NotificationType;

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
    >
      {children}
    </button>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays === 1) return "Hier";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationsPageInner() {
  const { isDark } = useTheme();
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const { showToast } = useToast();

  const apiReadFilter = useMemo(() => {
    if (readFilter === "unread") return false;
    if (readFilter === "read") return true;
    return undefined;
  }, [readFilter]);

  const { data: notifications, isLoading, error, refetch } = useNotifications(apiReadFilter);

  const filtered = useMemo(() => {
    return (notifications || []).filter((n) => {
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      return true;
    });
  }, [notifications, typeFilter]);

  const unreadCount = useMemo(() => {
    return (notifications || []).filter((n) => !n.read).length;
  }, [notifications]);

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      try {
        await notificationsApi.markAsRead(id);
        refetch();
      } catch (err) {
        console.error("Failed to mark as read:", err);
        showToast({
          variant: "error",
          message:
            err instanceof Error
              ? err.message
              : "Erreur lors du marquage de la notification",
        });
      }
    },
    [refetch, showToast]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      refetch();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      showToast({
        variant: "error",
        message:
          err instanceof Error
            ? err.message
            : "Erreur lors du marquage de toutes les notifications",
      });
    }
  }, [refetch, showToast]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#7264ff]" />
          <p className="text-sm text-slate-500">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-center">
          <p className="text-sm font-medium text-red-700">Erreur de chargement</p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-full bg-red-100 px-4 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10">
          <ListFilter className="h-3.5 w-3.5" />
          Notifications
        </div>
        <h1 className="text-xl font-semibold">Toutes les notifications</h1>
        <p className={`max-w-2xl text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Historique de vos notifications. Filtrez par statut de lecture ou par type.
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
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-[#dd7fff] via-[#7264ff] to-[#54d4ef] px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
              {unreadCount} non lue(s)
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
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
          <FilterPill
            active={typeFilter === "REMINDER_DUE"}
            onClick={() => setTypeFilter("REMINDER_DUE")}
          >
            Rappels
          </FilterPill>
          <FilterPill
            active={typeFilter === "CALL_MISSED"}
            onClick={() => setTypeFilter("CALL_MISSED")}
          >
            Appels manqués
          </FilterPill>
          <FilterPill active={typeFilter === "SYSTEM"} onClick={() => setTypeFilter("SYSTEM")}>
            Système
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
              const cfg = typeConfig[notif.type] || typeConfig.SYSTEM;
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                  className={`flex cursor-pointer items-start gap-3 px-2 py-3 transition hover:-translate-y-0.5 ${
                    notif.read
                      ? isDark
                        ? "hover:bg-white/5"
                        : "hover:bg-slate-50"
                      : isDark
                      ? "bg-white/5"
                      : "bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${cfg.color}`}
                  >
                    <cfg.Icon className="h-4 w-4" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold leading-snug">
                        {notif.title}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    {notif.body && (
                      <p className="text-[12px] text-slate-600 dark:text-slate-400">
                        {notif.body}
                      </p>
                    )}
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formatTime(notif.createdAt)}
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
                </div>
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
          <span>{filtered.length} notification(s)</span>
          <span className="text-slate-500 dark:text-slate-400">
            Mise à jour en temps réel
          </span>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#7264ff]" />
      </div>
    );
  }

  return (
    <AppShell>
      <NotificationsPageInner />
    </AppShell>
  );
}
