"use client";

import React, { useMemo, useState } from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { AppShell, useTheme } from "../../components/layout/AppShell";
import { CallsTable, type CallRow } from "../../components/calls/CallsTable";
import { DetailModal } from "../../components/calls/DetailModal";
import { EditModal } from "../../components/calls/EditModal";
import { useCalls } from "../../lib/hooks";
import { mapApiStatusToUI, ALL_UI_STATUSES } from "../../lib/statusMapping";
import { useRequireAuth } from "../../lib/auth";
import type { Call } from "../../types/api";
import type { CallStatus } from "../../components/calls/StatusBadge";

// Map API Call -> CallRow pour le journal des appels
const mapCallToRow = (call: Call): CallRow & { _apiData: Call } => {
  const firstName = call.firstName || "";
  const lastName = call.lastName || "";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    call.notes?.split("\n")[0]?.replace("Prénom: ", "").replace("Nom: ", "") ||
    (call.direction === "INBOUND" ? call.fromNumber : call.toNumber);

  return {
    id: call.id,
    name: fullName,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    phone: call.direction === "INBOUND" ? call.fromNumber : call.toNumber,
    status: mapApiStatusToUI(call.status),
    lastCall: new Date(call.occurredAt).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    lastCallDate: call.occurredAt.split("T")[0],
    nextReminder: undefined,
    type: call.type === "FOLLOW_UP" ? "rappel" : "nouveau",
    email: call.email || undefined,
    firstCallDate: call.createdAt.split("T")[0],
    description: call.notes || undefined,
    waveNumber: call.waveNumber ?? null,
    _apiData: call,
  };
};

function CallHistoryPageInner() {
  const { isDark } = useTheme();
  const { data: calls, isLoading, error, refetch } = useCalls();

  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CallStatus[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallRow & { _apiData?: Call } | null>(null);
  const [modalMode, setModalMode] = useState<"detail" | "edit" | null>(null);

  const allRows = useMemo(() => (calls || []).map(mapCallToRow), [calls]);

  const filteredRows = useMemo(() => {
    let rows = allRows;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((row) => {
        return (
          (row.name || "").toLowerCase().includes(q) ||
          (row.firstName || "").toLowerCase().includes(q) ||
          (row.lastName || "").toLowerCase().includes(q) ||
          row.phone.includes(search) ||
          (row.email || "").toLowerCase().includes(q) ||
          (row.description || "").toLowerCase().includes(q)
        );
      });
    }

    if (selectedStatuses.length > 0) {
      rows = rows.filter((row) => selectedStatuses.includes(row.status));
    }

    // Tri par date d'appel décroissante (journal chronologique)
    rows = [...rows].sort((a, b) => {
      const aDate = a.lastCallDate ? new Date(`${a.lastCallDate}T00:00:00`) : new Date(0);
      const bDate = b.lastCallDate ? new Date(`${b.lastCallDate}T00:00:00`) : new Date(0);
      return bDate.getTime() - aDate.getTime();
    });

    return rows;
  }, [allRows, search, selectedStatuses]);

  const totalLines = filteredRows.length;

  const toggleStatus = (status: CallStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedStatuses([]);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#7264ff]" />
          <p className="text-sm text-slate-500">Chargement du journal des appels...</p>
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
    <>
      <div className="space-y-5">
        {/* Header + résumé */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Journal des appels</h1>
            <p
              className={`max-w-2xl text-xs ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Historique complet de vos appels (nouveaux appels, rappels, rendez-vous, etc.).
              Utilisez la recherche et les filtres pour retrouver un contact en quelques secondes.
            </p>
          </div>

          <div
            className={`flex min-w-[220px] flex-col gap-1 rounded-2xl px-4 py-3 text-[11px] ${
              isDark
                ? "bg-[#020617]/60 text-slate-100 ring-1 ring-slate-700"
                : "bg-slate-50 text-slate-700 ring-1 ring-slate-200"
            }`}
          >
            <span className="text-[10px] uppercase tracking-wide text-slate-400">
              Lignes dans le journal
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">{totalLines}</span>
              <span className="text-[11px] text-slate-400">
                appel{totalLines > 1 ? "s" : ""} enregistré{totalLines > 1 ? "s" : ""} au total
              </span>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Recherche globale */}
            <div
              className={`flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-xs transition ${
                isDark
                  ? "border-slate-700 bg-[#020617]/40 text-slate-100 focus-within:border-[#7264ff]"
                  : "border-slate-200 bg-white text-slate-800 focus-within:border-[#7264ff]"
              }`}
            >
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher (nom, téléphone, email, notes)…"
                className={`h-7 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400 ${
                  isDark ? "text-slate-100" : "text-slate-800"
                }`}
              />
            </div>

            {/* Filtres de statut (multi-sélection simple) */}
            <div className="relative">
              <button
                type="button"
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  isDark
                    ? "border-slate-700 bg-[#020617]/40 text-slate-100 hover:border-slate-500"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Statut</span>
              </button>
              {/* Liste horizontale de tags cliquables pour les statuts principaux */}
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                {ALL_UI_STATUSES.map((status) => {
                  const active = selectedStatuses.includes(status as CallStatus);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleStatus(status as CallStatus)}
                      className={`cursor-pointer rounded-full px-2 py-1 transition ${
                        active
                          ? isDark
                            ? "bg-[#1d2033] text-slate-50"
                            : "bg-[#f2ebff] text-[#4b2bb8]"
                          : isDark
                          ? "bg-[#020617]/60 text-slate-300 hover:bg-white/5"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset filtres */}
            {(search || selectedStatuses.length > 0) && (
              <button
                type="button"
                onClick={resetFilters}
                className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                  isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Tableau principal du journal */}
        <CallsTable
          rows={filteredRows}
          onView={(row) => {
            setSelectedCall(row as CallRow & { _apiData?: Call });
            setModalMode("detail");
          }}
          onEdit={(row) => {
            setSelectedCall(row as CallRow & { _apiData?: Call });
            setModalMode("edit");
          }}
        />
      </div>

      <DetailModal
        open={modalMode === "detail" && !!selectedCall}
        call={selectedCall}
        onClose={() => {
          setModalMode(null);
          setSelectedCall(null);
        }}
        onEdit={() => setModalMode("edit")}
      />

      <EditModal
        open={modalMode === "edit" && !!selectedCall}
        call={selectedCall}
        onClose={() => setModalMode("detail")}
        // On réutilise la logique d'édition existante via l'API de la page "Tous les appels" / "Appels du jour" ?
        // Pour rester simple ici, on laisse l'EditModal en lecture seule (pas d'enregistrement direct depuis le journal).
        onSave={() => undefined}
      />
    </>
  );
}

export default function HistoryPage() {
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
      <CallHistoryPageInner />
    </AppShell>
  );
}


