"use client";

import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Eye, Search, Filter, RotateCcw, X } from "lucide-react";
import { AppShell, useTheme } from "../../components/layout/AppShell";
import { StatusBadge } from "../../components/calls/StatusBadge";
import { DetailModal } from "../../components/calls/DetailModal";
import { EditModal } from "../../components/calls/EditModal";
import { useTodayReport } from "../../lib/hooks";
import { useRequireAuth } from "../../lib/auth";
import { mapApiStatusToUI, mapUIStatusToApi, STATUSES_REQUIRING_RECALL } from "../../lib/statusMapping";
import { callsApi } from "../../lib/api";
import { useToast } from "../../components/ui/ToastProvider";
import type { Call } from "../../types/api";
import type { CallStatus } from "../../components/calls/StatusBadge";
import type { CallRow } from "../../components/calls/CallsTable";

// Map API call to UI format
const mapCallToUI = (call: Call) => {
  const firstName = call.firstName || "";
  const lastName = call.lastName || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || call.notes?.split("\n")[0]?.replace("Prénom: ", "").replace("Nom: ", "") || call.fromNumber;
  
  // Format recall time slot if available
  let recallInfo = "";
  if (call.recallTimeSlot) {
    recallInfo = call.recallTimeSlot;
  } else if (call.recallDate) {
    recallInfo = new Date(call.recallDate).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  
  return {
    id: call.id,
    name: fullName,
    phone: call.direction === "INBOUND" ? call.fromNumber : call.toNumber,
    status: mapApiStatusToUI(call.status),
    time: call.recallDate 
      ? new Date(call.recallDate).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date(call.occurredAt).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    recallTimeSlot: recallInfo,
    type: call.type === "FOLLOW_UP" ? "rappel" : "nouveau",
    notes: call.notes || "",
  };
};

type UICall = ReturnType<typeof mapCallToUI> & {
  recallTimeSlot?: string;
};

// Map to CallRow for DetailModal and EditModal
const mapToCallRow = (call: UICall, originalCall?: Call): CallRow & { _apiData?: Call } => {
  // Format next reminder if recallDate exists
  let nextReminder: string | null = null;
  if (originalCall?.recallDate) {
    const recallDateStr = originalCall.recallDate.split("T")[0];
    if (originalCall.recallTimeSlot) {
      nextReminder = `${recallDateStr} • ${originalCall.recallTimeSlot}`;
    } else {
      nextReminder = recallDateStr;
    }
  }

  return {
    id: call.id,
    name: call.name,
    phone: call.phone,
    status: call.status,
    lastCall: `Aujourd'hui - ${call.time}`,
    lastCallDate: new Date().toISOString().split("T")[0],
    nextReminder: nextReminder || undefined,
    type: call.type as "nouveau" | "rappel",
    description: call.notes,
    firstName: originalCall?.firstName || undefined,
    lastName: originalCall?.lastName || undefined,
    email: originalCall?.email || undefined,
    firstCallDate: originalCall?.createdAt?.split("T")[0] || undefined,
    _apiData: originalCall,
  };
};

import { ALL_UI_STATUSES } from "../../lib/statusMapping";

function TodayCallsSection() {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { data: todayData, isLoading, error, refetch } = useTodayReport();
  const [selectedCall, setSelectedCall] = useState<CallRow | null>(null);
  const [modalMode, setModalMode] = useState<"detail" | "edit" | null>(null);
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CallStatus[]>([]);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setStatusFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Store original calls for mapping
  const originalCalls = useMemo(() => {
    return todayData?.calls || [];
  }, [todayData]);

  const todayCalls = useMemo(() => {
    // Appels du jour = appels EFFECTUÉS (on exclut le statut neutre A_CONTACTER)
    let calls = (todayData?.calls || [])
      .filter((call) => call.status !== "A_CONTACTER")
      .map(mapCallToUI);
    
    // Sort by occurredAt descending (last arrived first)
    calls.sort((a, b) => {
      const callA = originalCalls.find(c => c.id === a.id);
      const callB = originalCalls.find(c => c.id === b.id);
      if (!callA || !callB) return 0;
      return new Date(callB.occurredAt).getTime() - new Date(callA.occurredAt).getTime();
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      calls = calls.filter(
        (call) =>
          call.name.toLowerCase().includes(searchLower) ||
          call.phone.includes(search) ||
          call.notes.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (selectedStatuses.length > 0) {
      calls = calls.filter((call) => selectedStatuses.includes(call.status));
    }

    return calls;
  }, [todayData, search, selectedStatuses, originalCalls]);

  const totalToday = todayCalls.length;
  const totalPages = Math.ceil(totalToday / itemsPerPage);
  const paginatedCalls = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return todayCalls.slice(startIndex, startIndex + itemsPerPage);
  }, [todayCalls, currentPage, itemsPerPage]);

  const handleViewCall = (call: UICall) => {
    const originalCall = originalCalls.find(c => c.id === call.id);
    setSelectedCall(mapToCallRow(call, originalCall));
    setModalMode("detail");
  };

  const handleSaveCall = useCallback(
    async (updated: CallRow & { _apiData?: Call }) => {
      try {
        const apiData = updated._apiData;
        if (!apiData) return;
        
        const newStatus = mapUIStatusToApi(updated.status);
        
        // Prepare recall data if status requires it
        let recallDate: string | null = null;
        let recallTimeSlot: string | null = null;
        
        if (STATUSES_REQUIRING_RECALL.includes(updated.status)) {
          if (updated.nextReminder) {
            // Parse nextReminder format: "YYYY-MM-DD • HH:MM – HH:MM"
            const parts = updated.nextReminder.split(" • ");
            if (parts.length === 2) {
              recallDate = parts[0];
              recallTimeSlot = parts[1];
            } else if (parts.length === 1) {
              recallDate = parts[0];
            }
          }
        }
        
        await callsApi.update(apiData.id, {
          status: newStatus,
          notes: updated.description || apiData.notes || undefined,
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          toNumber: updated.phone,
          recallDate: recallDate || null,
          recallTimeSlot: recallTimeSlot || null,
        });
        
        refetch();
        setModalMode("detail");
      } catch (err) {
        console.error("Error updating call:", err);
        showToast({
          variant: "error",
          message:
            err instanceof Error
              ? err.message
              : "Erreur lors de la mise à jour de l'appel",
        });
      }
    },
    [refetch, showToast]
  );

  const toggleStatus = (status: CallStatus) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const removeStatus = (status: CallStatus) => {
    setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
    setCurrentPage(1);
  };

  const removeSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedStatuses([]);
    setCurrentPage(1);
    setStatusFilterOpen(false);
  };

  const hasActiveFilters = search || selectedStatuses.length > 0;

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
            className="cursor-pointer mt-3 rounded-full bg-red-100 px-4 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
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

        {/* Filters */}
        <div ref={filterRef} className="mb-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {/* Search */}
              <div
                className={`flex max-w-[300px] flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-xs transition ${
                  isDark
                    ? "border-slate-700 bg-[#020617]/40 text-slate-100 focus-within:border-[#7264ff]"
                    : "border-slate-200 bg-white text-slate-800 focus-within:border-[#7264ff]"
                }`}
              >
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Rechercher (nom, téléphone, notes)…"
                  className={`h-7 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400 ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                />
              </div>

              {/* Status filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setStatusFilterOpen((v) => !v)}
                  className={`cursor-pointer inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    isDark
                      ? "border-slate-700 bg-[#020617]/40 text-slate-100 hover:border-slate-500"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Statut</span>
                  {selectedStatuses.length > 0 && (
                    <span
                      className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
                        isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {selectedStatuses.length}
                    </span>
                  )}
                </button>
                {statusFilterOpen && (
                  <div
                    className={`absolute z-20 mt-1 w-52 rounded-2xl border p-2 text-xs shadow-lg ${
                      isDark
                        ? "border-slate-700 bg-[#020617] text-slate-100"
                        : "border-slate-100 bg-white text-slate-800"
                    }`}
                  >
                    <p className="mb-1 px-1 text-[10px] uppercase tracking-wide text-slate-400">
                      Statuts
                    </p>
                    <div className="max-h-60 space-y-1 overflow-y-auto">
                      {ALL_UI_STATUSES.map((status) => {
                        const active = selectedStatuses.includes(status);
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              toggleStatus(status);
                              setCurrentPage(1);
                            }}
                            className={`cursor-pointer flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-[11px] transition ${
                              active
                                ? isDark
                                  ? "bg-[#1d2033] text-slate-50"
                                  : "bg-[#f2ebff] text-[#4b2bb8]"
                                : isDark
                                ? "text-slate-200 hover:bg-white/5"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{status}</span>
                            {active && (
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isDark ? "bg-emerald-400" : "bg-emerald-500"
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active filters chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {search && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                    isDark
                      ? "bg-slate-800/60 text-slate-200 ring-1 ring-slate-700/60"
                      : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                  }`}
                >
                  <span>Recherche: "{search}"</span>
                  <button
                    type="button"
                    onClick={removeSearch}
                    className={`cursor-pointer rounded-full p-0.5 transition ${
                      isDark ? "hover:bg-slate-700" : "hover:bg-slate-200"
                    }`}
                    aria-label="Retirer la recherche"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedStatuses.map((status) => (
                <span
                  key={status}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                    isDark
                      ? "bg-slate-800/60 text-slate-200 ring-1 ring-slate-700/60"
                      : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                  }`}
                >
                  <span>Statut: {status}</span>
                  <button
                    type="button"
                    onClick={() => removeStatus(status)}
                    className={`cursor-pointer rounded-full p-0.5 transition ${
                      isDark ? "hover:bg-slate-700" : "hover:bg-slate-200"
                    }`}
                    aria-label={`Retirer le filtre ${status}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={resetFilters}
                className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                  isDark
                    ? "text-slate-300 hover:bg-white/5"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Tout réinitialiser
              </button>
            </div>
          )}
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
                  {search || selectedStatuses.length > 0
                    ? "Aucun appel ne correspond aux filtres"
                    : "Aucun appel effectué aujourd'hui"}
                </p>
                <p
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {search || selectedStatuses.length > 0
                    ? "Essayez de modifier vos critères de recherche"
                    : "Dès qu'un appel est réalisé, il apparaîtra automatiquement ici."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-2 pb-2 pt-1">
                <ul className="text-xs">
                  {paginatedCalls.map((call, idx) => {
                    const originalCall = originalCalls.find(c => c.id === call.id);
                    const recallDate = originalCall?.recallDate 
                      ? new Date(originalCall.recallDate).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                        })
                      : null;
                    const showDateInBadge = (call.status === "Ne répond pas" || call.status === "Rappel") && recallDate;
                    
                    return (
                      <li
                        key={call.id}
                        className={`flex items-center gap-3 py-2.5 pl-2 pr-3 text-[13px] ${
                          isDark
                            ? idx % 2 === 0
                              ? "bg-[#020617]/20"
                              : "bg-[#020617]/5"
                            : idx % 2 === 0
                            ? "bg-white"
                            : "bg-slate-50/70"
                        } ${
                          isDark
                            ? "hover:bg-white/5"
                            : "hover:bg-slate-50"
                        } transition cursor-pointer`}
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
                              <StatusBadge 
                                status={call.status} 
                                recallDate={showDateInBadge ? recallDate : undefined}
                              />
                              {call.recallTimeSlot && !showDateInBadge && (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                    isDark
                                      ? "bg-blue-900/40 text-blue-300"
                                      : "bg-blue-50 text-blue-600"
                                  }`}
                                >
                                  📅 {call.recallTimeSlot}
                                </span>
                              )}
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
                          </div>
                        </div>

                        <button
                          type="button"
                          aria-label="Voir les détails de l'appel"
                          onClick={() => handleViewCall(call)}
                          className={`cursor-pointer inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                            isDark
                              ? "bg-white/5 text-slate-200 hover:bg-white/10"
                              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`mt-3 flex items-center justify-between border-t px-4 py-3 text-[11px] ${
                  isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"
                }`}>
                  <span>
                    Page {currentPage} sur {totalPages} ({totalToday} appel{totalToday > 1 ? "s" : ""})
                  </span>
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`cursor-pointer rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`}
                    >
                      Précédent
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`cursor-pointer rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700`}
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

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
        onClose={() => {
          setModalMode("detail");
        }}
        onSave={handleSaveCall}
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
