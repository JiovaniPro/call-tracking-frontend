 "use client";

import React, { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { AppShell, useTheme } from "../../components/layout/AppShell";
import { StatusBadge, type CallStatus } from "../../components/calls/StatusBadge";
import type { CallType, CallRow } from "../../components/calls/CallsTable";
import { DetailModal } from "../../components/calls/DetailModal";

type TodayCall = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: CallStatus;
  time: string; // Heure de l'appel, ex: "09:24"
  date: string; // ISO yyyy-mm-dd
  type: CallType;
  completed: boolean; // uniquement les appels réellement effectués
  // Champs additionnels pour alimenter le DetailModal
  email?: string;
  description?: string;
};

const MOCK_TODAY_CALLS: TodayCall[] = [
  {
    id: "t1",
    firstName: "Marie",
    lastName: "Dupont",
    phone: "+33 6 12 34 56 78",
    status: "intéressé",
    time: "09:24",
    date: "2025-12-16",
    type: "nouveau",
    completed: true,
    email: "marie.dupont@example.com",
    description:
      "Premier appel de qualification. Prospect chaud pour l’offre premium, à intégrer dans le pipe cette semaine.",
  },
  {
    id: "t2",
    firstName: "Paul",
    lastName: "Martin",
    phone: "+33 7 98 76 54 32",
    status: "pas intéressé",
    time: "10:05",
    date: "2025-12-16",
    type: "nouveau",
    completed: true,
    email: "paul.martin@example.com",
    description:
      "Appel de suivi après un essai. Ne souhaite pas poursuivre cette année, à exclure des relances.",
  },
  {
    id: "t3",
    firstName: "Claire",
    lastName: "Bernard",
    phone: "+33 6 44 55 66 77",
    status: "intéressé",
    time: "11:10",
    date: "2025-12-16",
    type: "rappel",
    completed: true,
    email: "claire.bernard@example.com",
    description:
      "Rappel programmé effectué ce matin. OK pour une démo complète la semaine prochaine.",
  },
  {
    id: "t4",
    firstName: "Agence",
    lastName: "Horizon",
    phone: "+33 1 45 23 89 10",
    status: "répondeur",
    time: "14:32",
    date: "2025-12-16",
    type: "rappel",
    completed: true,
    email: "contact@agence-horizon.fr",
    description:
      "N’a pas répondu, message vocal laissé. À suivre dans la section Rappels si rappel à reprogrammer.",
  },
  // Appels non éligibles à la section (autre jour ou non effectués)
  {
    id: "t5",
    firstName: "Ancien",
    lastName: "Client",
    phone: "+33 1 00 00 00 00",
    status: "hors cible",
    time: "16:45",
    date: "2025-12-15", // hier
    type: "nouveau",
    completed: true,
  },
  {
    id: "t6",
    firstName: "Prospect",
    lastName: "Planifié",
    phone: "+33 6 99 88 77 66",
    status: "intéressé",
    time: "17:30",
    date: "2025-12-16",
    type: "rappel",
    completed: false, // rappel planifié non encore effectué -> ne doit PAS apparaître
  },
];

const mapTodayCallToCallRow = (call: TodayCall): CallRow => {
  const fullName = `${call.firstName} ${call.lastName}`.trim();

  return {
    id: call.id,
    name: fullName,
    phone: call.phone,
    status: call.status,
    lastCall: `Aujourd’hui - ${call.time}`,
    lastCallDate: call.date,
    nextReminder: undefined,
    type: call.type,
    firstName: call.firstName,
    lastName: call.lastName,
    email: call.email,
    description: call.description,
  };
};

function TodayCallsSection() {
  const { isDark } = useTheme();
  const [selectedCall, setSelectedCall] = useState<CallRow | null>(null);

  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const todayCalls = useMemo(
    () =>
      MOCK_TODAY_CALLS.filter(
        (call) => call.date === today && call.completed === true
      ),
    [today]
  );

  const totalToday = todayCalls.length;

  return (
    <>
      <section
        className={`rounded-2xl p-5 shadow-sm ${
          isDark
            ? "bg-[#0f1a2f] text-slate-50 shadow-slate-900"
            : "bg-white text-slate-900 shadow-slate-100"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Appels du jour</h1>
            <p
              className={`max-w-xl text-xs ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Suivi en temps réel des appels réellement effectués aujourd’hui
              (nouveaux appels et rappels réalisés). Cette vue alimente vos KPI
              journaliers.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium ${
                isDark
                  ? "bg-white/5 text-slate-100 ring-1 ring-white/10"
                  : "bg-slate-50 text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#dd7fff] via-[#7264ff] to-[#54d4ef]"
                aria-hidden
              />
              {totalToday} appel{totalToday > 1 ? "s" : ""} effectué
              {totalToday > 1 ? "s" : ""} aujourd’hui
            </span>
            <p className="text-[10px] text-slate-400">
              Mise à jour automatique à chaque appel enregistré (mock).
            </p>
          </div>
        </div>

        <div
          className={`relative -mx-2 mt-1 rounded-2xl ${
            isDark ? "bg-[#020617]/40" : "bg-slate-50/60"
          }`}
        >
          {totalToday === 0 ? (
            <div className="flex min-h-[160px] items-center justify-center px-4 py-8 text-center">
              <div className="space-y-1">
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-slate-100" : "text-slate-700"
                  }`}
                >
                  Aucun appel effectué aujourd’hui
                </p>
                <p
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Dès qu’un appel est réellement réalisé, il apparaîtra
                  automatiquement ici.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto px-2 pb-2 pt-1">
              <ul className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                {todayCalls.map((call) => {
                  const fullName = `${call.firstName} ${call.lastName}`.trim();

                  return (
                    <li
                      key={call.id}
                      className={`flex items-center gap-3 py-2.5 pl-2 pr-3 text-[13px] ${
                        isDark
                          ? "hover:bg-white/5"
                          : "hover:bg-white hover:shadow-sm"
                      } transition`}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-medium ${
                              isDark ? "text-slate-50" : "text-slate-900"
                            }`}
                          >
                            {fullName}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px]">
                            <span
                              className={`font-mono ${
                                isDark ? "text-slate-200" : "text-slate-600"
                              }`}
                            >
                              {call.phone}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                call.type === "nouveau"
                                  ? isDark
                                    ? "bg-emerald-900/40 text-emerald-300"
                                    : "bg-emerald-50 text-emerald-600"
                                  : isDark
                                  ? "bg-sky-900/40 text-sky-300"
                                  : "bg-sky-50 text-sky-600"
                              }`}
                            >
                              {call.type === "nouveau" ? "Nouveau" : "Rappel"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right text-[11px]">
                            <p
                              className={
                                isDark ? "text-slate-200" : "text-slate-700"
                              }
                            >
                              {call.time}
                            </p>
                            <p
                              className={
                                isDark ? "text-slate-500" : "text-slate-500"
                              }
                            >
                              Aujourd’hui
                            </p>
                          </div>

                          <StatusBadge status={call.status} />
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label="Voir les détails de l’appel"
                        onClick={() => setSelectedCall(mapTodayCallToCallRow(call))}
                        className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                          isDark
                            ? "bg-white/5 text-slate-200 hover:bg-white/10"
                            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>

      <DetailModal
        open={!!selectedCall}
        call={selectedCall}
        onClose={() => setSelectedCall(null)}
        onEdit={() => undefined}
      />
    </>
  );
}

function TodayPageInner() {
  return (
    <div className="space-y-5">
      <TodayCallsSection />
    </div>
  );
}

export default function TodayPage() {
  return (
    <AppShell>
      <TodayPageInner />
    </AppShell>
  );
}


