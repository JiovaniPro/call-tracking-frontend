"use client";

import React, { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { AppShell, useTheme } from "../../components/layout/AppShell";
import { StatusBadge } from "../../components/calls/StatusBadge";
import { DetailModal } from "../../components/calls/DetailModal";
import { useTodayReport } from "../../lib/hooks";
import { useRequireAuth } from "../../lib/auth";
import type { Call } from "../../types/api";

// Map API status to UI status
const mapApiStatusToUI = (status: string): "intéressé" | "pas intéressé" | "répondeur" | "hors cible" | "faux numéro" => {
  const map: Record<string, "intéressé" | "pas intéressé" | "répondeur" | "hors cible" | "faux numéro"> = {
    NEW: "intéressé",
    IN_PROGRESS: "répondeur",
    COMPLETED: "intéressé",
    MISSED: "répondeur",
    CANCELED: "pas intéressé",
  };
  return map[status] || "intéressé";
};

// Map API call to UI format
const mapCallToUI = (call: Call) => ({
  id: call.id,
  name: call.notes?.split(" ")[0] || call.fromNumber,
  phone: call.direction === "INBOUND" ? call.fromNumber : call.toNumber,
  status: mapApiStatusToUI(call.status),
  time: new Date(call.occurredAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  type: call.type === "FOLLOW_UP" ? "rappel" : "nouveau",
  notes: call.notes || "",
});

type UICall = ReturnType<typeof mapCallToUI>;

// Map to CallRow for DetailModal
const mapToCallRow = (call: UICall) => ({
  id: call.id,
  name: call.name,
  phone: call.phone,
  status: call.status,
  lastCall: `Aujourd'hui - ${call.time}`,
  lastCallDate: new Date().toISOString().split("T")[0],
  nextReminder: null,
  type: call.type as "nouveau" | "rappel",
  description: call.notes,
});

function TodayCallsSection() {
  const { isDark } = useTheme();
  const { data: todayData, isLoading, error, refetch } = useTodayReport();
  const [selectedCall, setSelectedCall] = useState<UICall | null>(null);

  const todayCalls = useMemo(() => {
    return (todayData?.calls || []).map(mapCallToUI);
  }, [todayData]);

  const totalToday = todayCalls.length;

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#7264ff]" />
          <p className="text-sm text-slate-500">Chargement des appels...</p>
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
              Suivi en temps réel des appels effectués aujourd'hui
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
              {totalToday > 1 ? "s" : ""} aujourd'hui
            </span>
            <p className="text-[10px] text-slate-400">
              Mise à jour automatique
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
                  Aucun appel effectué aujourd'hui
                </p>
                <p
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Dès qu'un appel est réalisé, il apparaîtra
                  automatiquement ici.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto px-2 pb-2 pt-1">
              <ul className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                {todayCalls.map((call) => (
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
                          {call.name}
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
                            Aujourd'hui
                          </p>
                        </div>

                        <StatusBadge status={call.status} />
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Voir les détails de l'appel"
                      onClick={() => setSelectedCall(call)}
                      className={`inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                        isDark
                          ? "bg-white/5 text-slate-200 hover:bg-white/10"
                          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <DetailModal
        open={!!selectedCall}
        call={selectedCall ? mapToCallRow(selectedCall) : null}
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
      <TodayPageInner />
    </AppShell>
  );
}
