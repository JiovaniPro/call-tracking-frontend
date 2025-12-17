 "use client";

import React, { useMemo, useState } from "react";
import { Eye, PhoneCall } from "lucide-react";
import { AppShell, useTheme } from "../../components/layout/AppShell";
import { StatusBadge, type CallStatus } from "../../components/calls/StatusBadge";
import type { CallType, CallRow } from "../../components/calls/CallsTable";
import { DetailModal } from "../../components/calls/DetailModal";
import { CopyButton } from "../../components/calls/CopyButton";

type TodayReminder = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  scheduledTime: string; // Heure prévue du rappel, ex: "16:00"
  date: string; // ISO yyyy-mm-dd
  previousStatus: CallStatus;
  type: CallType; // devrait toujours être "rappel" ici, mais on garde le champ pour cohérence
  done: boolean;
  email?: string;
  description?: string;
};

const MOCK_TODAY_REMINDERS: TodayReminder[] = [
  {
    id: "r1",
    firstName: "Immo",
    lastName: "Paris 9",
    phone: "+33 1 53 00 11 22",
    scheduledTime: "09:30",
    date: "2025-12-16",
    previousStatus: "répondeur",
    type: "rappel",
    done: false,
    email: "contact@immoparis9.fr",
    description:
      "Rappel après message vocal laissé hier. Décideur disponible ce matin avant 10h.",
  },
  {
    id: "r2",
    firstName: "Julien",
    lastName: "Moreau",
    phone: "+33 6 22 11 33 44",
    scheduledTime: "11:45",
    date: "2025-12-16",
    previousStatus: "intéressé",
    type: "rappel",
    done: false,
    email: "julien.moreau@example.com",
    description:
      "Attente de validation interne. Julien a demandé à être rappelé sur le créneau 11h30-12h.",
  },
  {
    id: "r3",
    firstName: "Agence",
    lastName: "Horizon",
    phone: "+33 1 45 23 89 10",
    scheduledTime: "16:00",
    date: "2025-12-16",
    previousStatus: "répondeur",
    type: "rappel",
    done: false,
    email: "contact@agence-horizon.fr",
    description:
      "Deuxième tentative programmée. À privilégier en milieu d’après-midi.",
  },
  // Rappel déjà effectué → ne doit pas apparaître
  {
    id: "r4",
    firstName: "Ancien",
    lastName: "Rappel",
    phone: "+33 1 00 00 00 01",
    scheduledTime: "08:30",
    date: "2025-12-16",
    previousStatus: "intéressé",
    type: "rappel",
    done: true,
  },
  // Rappel planifié un autre jour → ne doit pas apparaître
  {
    id: "r5",
    firstName: "Prospect",
    lastName: "Demain",
    phone: "+33 6 00 00 00 02",
    scheduledTime: "10:00",
    date: "2025-12-17",
    previousStatus: "intéressé",
    type: "rappel",
    done: false,
  },
];

const mapReminderToCallRow = (reminder: TodayReminder, today: string): CallRow => {
  const fullName = `${reminder.firstName} ${reminder.lastName}`.trim();

  return {
    id: reminder.id,
    name: fullName,
    phone: reminder.phone,
    status: reminder.previousStatus,
    lastCall: "Appel précédent (rappel planifié)",
    lastCallDate: today,
    nextReminder: `Aujourd’hui - ${reminder.scheduledTime}`,
    type: reminder.type,
    firstName: reminder.firstName,
    lastName: reminder.lastName,
    email: reminder.email,
    description: reminder.description,
  };
};

type TodayRemindersSectionProps = {
  today: string;
  reminders: TodayReminder[];
  onMarkCalled: (reminder: TodayReminder) => void;
  onView: (row: CallRow) => void;
};

function TodayRemindersSection({
  today,
  reminders,
  onMarkCalled,
  onView,
}: TodayRemindersSectionProps) {
  const { isDark } = useTheme();

  const now = new Date();

  const todayReminders = React.useMemo(
    () =>
      reminders.filter(
        (reminder) => reminder.date === today && reminder.done === false
      ),
    [reminders, today]
  );

  const totalReminders = todayReminders.length;

  const isNearNow = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return false;

    const scheduled = new Date(today);
    scheduled.setHours(h, m, 0, 0);

    const diffMs = scheduled.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    // On surligne les rappels dans la fenêtre [-15 min ; +30 min]
    return diffMinutes >= -15 && diffMinutes <= 30;
  };

  return (
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
            Liste priorisée des rappels à effectuer aujourd’hui. Ouvrez
            l’application, parcourez cette liste de haut en bas et appelez sans
            réfléchir.
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
            aujourd’hui
          </span>
          <p
            className={`text-[10px] ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Une fois marqué comme appelé, le contact est considéré comme traité
            (simulation). Cette vue est 100% orientée exécution.
          </p>
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
                Aucun rappel prévu aujourd’hui
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
              {todayReminders.map((reminder) => {
                const fullName = `${reminder.firstName} ${reminder.lastName}`.trim();
                const nearNow = isNearNow(reminder.scheduledTime);

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
                          {fullName}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px]">
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
                          <StatusBadge status={reminder.previousStatus} />
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={
                              isDark ? "text-slate-100" : "text-slate-800"
                            }
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
                        <span
                          className={
                            isDark ? "text-slate-500" : "text-slate-500"
                          }
                        >
                          Aujourd’hui
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onMarkCalled(reminder)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-red-300/50 transition hover:-translate-y-0.5 hover:shadow-lg"
                        style={{ cursor: "pointer" }}
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        Appeler / Marquer comme appelé
                      </button>

                      <button
                        type="button"
                        aria-label="Voir les détails du rappel"
                        onClick={() => onView(mapReminderToCallRow(reminder, today))}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                          isDark
                            ? "bg-white/5 text-slate-200 hover:bg-white/10"
                            : "bg-white text-slate-600 ring-1 ring-red-100 hover:bg-slate-50"
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <Eye className="h-3.5 w-3.5" />
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
  );
}

function ReminderPageInner() {
  const [reminders, setReminders] =
    useState<TodayReminder[]>(MOCK_TODAY_REMINDERS);
  const [selectedCall, setSelectedCall] = useState<CallRow | null>(null);

  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const handleMarkCalled = (reminder: TodayReminder) => {
    // On retire le rappel de la liste (simulation de transfert vers "Appels du jour")
    setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
  };

  return (
    <>
      <div className="space-y-5">
        <TodayRemindersSection
          today={today}
          reminders={reminders}
          onMarkCalled={handleMarkCalled}
          onView={(row) => setSelectedCall(row)}
        />
      </div>

      <DetailModal
        open={!!selectedCall}
        call={selectedCall}
        onClose={() => setSelectedCall(null)}
        onEdit={() => undefined}
      />
    </>
  );
}

export default function ReminderPage() {
  return (
    <AppShell>
      <ReminderPageInner />
    </AppShell>
  );
}


