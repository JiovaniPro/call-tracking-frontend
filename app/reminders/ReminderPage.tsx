"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Eye, PhoneCall, Plus, Trash2 } from "lucide-react";
import { AppShell, useTheme } from "../../components/layout/AppShell";
import { StatusBadge } from "../../components/calls/StatusBadge";
import { DetailModal } from "../../components/calls/DetailModal";
import { CopyButton } from "../../components/calls/CopyButton";
import { useTodayReminders } from "../../lib/hooks";
import { remindersApi } from "../../lib/api";
import { useRequireAuth } from "../../lib/auth";
import type { Reminder } from "../../types/api";
import { useToast } from "../../components/ui/ToastProvider";

// Map API reminder to UI format
const mapReminderToUI = (reminder: Reminder) => ({
  id: reminder.id,
  title: reminder.title,
  description: reminder.description || "",
  phone: reminder.call?.toNumber || reminder.call?.fromNumber || "-",
  scheduledTime: new Date(reminder.dueAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  dueAt: reminder.dueAt,
  status: reminder.status,
  callId: reminder.callId,
});

type UIReminder = ReturnType<typeof mapReminderToUI>;

// Map to CallRow for DetailModal
const mapToCallRow = (reminder: UIReminder) => ({
  id: reminder.id,
  name: reminder.title,
  phone: reminder.phone,
  status: "répondeur" as const,
  lastCall: "Rappel planifié",
  lastCallDate: reminder.dueAt.split("T")[0],
  nextReminder: `Aujourd'hui - ${reminder.scheduledTime}`,
  type: "rappel" as const,
  description: reminder.description,
});

function TodayRemindersSection() {
  const { isDark } = useTheme();
  const { data: reminders, isLoading, error, refetch } = useTodayReminders();
  const [selectedReminder, setSelectedReminder] = useState<UIReminder | null>(null);
  const { showToast } = useToast();

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const uiReminders = useMemo(() => {
    return (reminders || [])
      .filter((r) => r.status === "PENDING")
      .map(mapReminderToUI)
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }, [reminders]);

  const isNearNow = useCallback(
    (dueAt: string) => {
      const scheduled = new Date(dueAt);
      const diffMs = scheduled.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);
      return diffMinutes >= -15 && diffMinutes <= 30;
    },
    [now]
  );

  const handleMarkDone = async (reminder: UIReminder) => {
    try {
      await remindersApi.markDone(reminder.id);
      showToast({
        variant: "success",
        message: `"${reminder.title}" marqué comme effectué.`,
      });
      refetch();
    } catch (err) {
      showToast({
        variant: "error",
        message:
          err instanceof Error
            ? err.message
            : "Erreur lors de la mise à jour du rappel",
      });
    }
  };

  const handleDelete = async (reminder: UIReminder) => {
    if (!confirm("Voulez-vous vraiment supprimer ce rappel ?")) return;
    try {
      await remindersApi.delete(reminder.id);
      showToast({
        variant: "success",
        message: "Rappel supprimé.",
      });
      refetch();
    } catch (err) {
      showToast({
        variant: "error",
        message:
          err instanceof Error
            ? err.message
            : "Erreur lors de la suppression du rappel",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-red-500" />
          <p className="text-sm text-slate-500">Chargement des rappels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
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

  const totalReminders = uiReminders.length;

  return (
    <>
      <section
        className={`rounded-2xl border p-5 shadow-[0_14px_40px_rgba(220,38,38,0.16)] ${
          isDark
            ? "border-red-500/40 bg-[#140b0d] text-slate-50"
            : "border-red-100 bg-gradient-to-b from-red-50 via-white to-white text-slate-900"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              Rappels du jour
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.25)]" />
            </h2>
            <p
              className={`max-w-xl text-xs ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Liste priorisée des rappels à effectuer aujourd'hui. Parcourez cette
              liste de haut en bas et appelez sans réfléchir.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${
                isDark
                  ? "bg-red-500/10 text-red-200 ring-1 ring-red-500/40"
                  : "bg-red-50 text-red-700 ring-1 ring-red-100"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              {totalReminders} rappel{totalReminders > 1 ? "s" : ""} à traiter
            </span>
          </div>
        </div>

        <div
          className={`relative -mx-2 mt-1 rounded-2xl border ${
            isDark
              ? "border-red-500/20 bg-[#020617]/60"
              : "border-red-100/60 bg-red-50/40"
          }`}
        >
          {totalReminders === 0 ? (
            <div className="flex min-h-[150px] items-center justify-center px-4 py-8 text-center">
              <div className="space-y-1">
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-slate-100" : "text-slate-700"
                  }`}
                >
                  Aucun rappel prévu aujourd'hui
                </p>
                <p
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Votre journée de rappels est claire. Les nouveaux rappels
                  programmés apparaîtront automatiquement ici.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto px-2 pb-2 pt-1">
              <ul className="divide-y divide-red-100/60 text-xs dark:divide-red-900/40">
                {uiReminders.map((reminder) => {
                  const nearNow = isNearNow(reminder.dueAt);

                  return (
                    <li
                      key={reminder.id}
                      className={`flex items-center gap-3 py-2.5 pl-2 pr-3 text-[13px] transition ${
                        nearNow
                          ? isDark
                            ? "bg-red-500/10 ring-1 ring-red-500/40"
                            : "bg-red-50 ring-1 ring-red-200"
                          : isDark
                          ? "hover:bg-white/5"
                          : "hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-semibold ${
                              isDark ? "text-slate-50" : "text-slate-900"
                            }`}
                          >
                            {reminder.title}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px]">
                            {reminder.phone !== "-" && (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`font-mono ${
                                    isDark ? "text-slate-200" : "text-slate-700"
                                  }`}
                                >
                                  {reminder.phone}
                                </span>
                                <CopyButton value={reminder.phone} />
                              </div>
                            )}
                            <StatusBadge status="répondeur" />
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={isDark ? "text-slate-100" : "text-slate-800"}
                            >
                              {reminder.scheduledTime}
                            </span>
                            {nearNow && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  isDark
                                    ? "bg-red-500/20 text-red-100"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                À traiter maintenant
                              </span>
                            )}
                          </div>
                          <span className={isDark ? "text-slate-500" : "text-slate-500"}>
                            Aujourd'hui
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMarkDone(reminder)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-red-300/50 transition hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          Marquer comme fait
                        </button>

                        <button
                          type="button"
                          aria-label="Voir les détails"
                          onClick={() => setSelectedReminder(reminder)}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                            isDark
                              ? "bg-white/5 text-slate-200 hover:bg-white/10"
                              : "bg-white text-slate-600 ring-1 ring-red-100 hover:bg-slate-50"
                          }`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          aria-label="Supprimer"
                          onClick={() => handleDelete(reminder)}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                            isDark
                              ? "bg-white/5 text-red-400 hover:bg-red-500/20"
                              : "bg-white text-red-500 ring-1 ring-red-100 hover:bg-red-50"
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>

      <DetailModal
        open={!!selectedReminder}
        call={selectedReminder ? mapToCallRow(selectedReminder) : null}
        onClose={() => setSelectedReminder(null)}
        onEdit={() => undefined}
      />
    </>
  );
}

function ReminderPageInner() {
  return (
    <div className="space-y-5">
      <TodayRemindersSection />
    </div>
  );
}

export default function ReminderPage() {
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
      <ReminderPageInner />
    </AppShell>
  );
}
