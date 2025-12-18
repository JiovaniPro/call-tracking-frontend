"use client";

import React, { useMemo, useState, useCallback } from "react";
import { AppShell, useTheme } from "../../components/layout/AppShell";
import { FilterBar } from "../../components/calls/FilterBar";
import { ImportModal } from "../../components/calls/ImportModal";
import { CallsTable } from "../../components/calls/CallsTable";
import { DetailModal } from "../../components/calls/DetailModal";
import { EditModal } from "../../components/calls/EditModal";
import { useCalls } from "../../lib/hooks";
import { callsApi } from "../../lib/api";
import { useRequireAuth } from "../../lib/auth";
import { mapApiStatusToUI, mapUIStatusToApi, STATUSES_REQUIRING_RECALL } from "../../lib/statusMapping";
import type { Call, CallsFilter, CallStatus as ApiCallStatus, CallType as ApiCallType } from "../../types/api";
import { useToast } from "../../components/ui/ToastProvider";
import type { CallStatus } from "../../components/calls/StatusBadge";

type DateRange = "all" | "today" | "week" | "month" | "custom";
type UICallType = "nouveau" | "rappel";

// Map API call to UI row
const mapCallToRow = (call: Call) => {
  const firstName = call.firstName || "";
  const lastName = call.lastName || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || call.notes?.split("\n")[0]?.replace("Prénom: ", "").replace("Nom: ", "") || call.fromNumber;
  
  // Format recall information
  let nextReminder: string | null = null;
  if (call.recallDate) {
    const recallDateStr = call.recallDate.split("T")[0];
    if (call.recallTimeSlot) {
      nextReminder = `${recallDateStr} • ${call.recallTimeSlot}`;
    } else {
      nextReminder = recallDateStr;
    }
  }
  
  return {
    id: call.id,
    name: fullName,
    firstName,
    lastName,
    phone: call.direction === "INBOUND" ? call.fromNumber : call.toNumber,
    status: mapApiStatusToUI(call.status),
    lastCall: new Date(call.occurredAt).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    lastCallDate: call.occurredAt.split("T")[0],
    nextReminder: nextReminder,
    type: (call.type === "FOLLOW_UP" ? "rappel" : "nouveau") as UICallType,
    email: call.email || "",
    firstCallDate: call.createdAt.split("T")[0],
    description: call.notes || "",
    waveNumber: call.waveNumber ?? null,
    // Keep original API data for updates
    _apiData: call,
  };
};

type CallRow = ReturnType<typeof mapCallToRow>;

function CallsPageInner() {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CallStatus[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [callType, setCallType] = useState<UICallType | "all">("all");
  const [importOpen, setImportOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallRow | null>(null);
  const [modalMode, setModalMode] = useState<"detail" | "edit" | null>(null);

  // Build API filters
  const apiFilters = useMemo<CallsFilter>(() => {
    const filters: CallsFilter = {};
    if (search) filters.search = search;
    if (selectedStatuses.length === 1) {
      filters.status = mapUIStatusToApi(selectedStatuses[0]);
    }
    if (callType === "rappel") filters.type = "FOLLOW_UP";
    else if (callType === "nouveau") filters.type = "PROSPECTION";

    // Date range filters
    const now = new Date();
    if (dateRange === "today") {
      filters.from = now.toISOString().split("T")[0];
      filters.to = now.toISOString().split("T")[0];
    } else if (dateRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filters.from = weekAgo.toISOString().split("T")[0];
    } else if (dateRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filters.from = monthAgo.toISOString().split("T")[0];
    }

    return filters;
  }, [search, selectedStatuses, dateRange, callType]);

  const { data: calls, isLoading, error, refetch } = useCalls(apiFilters);

  const rows = useMemo(() => {
    // "Tous les appels" = uniquement prospects importés, jamais appelés
    // 1) Filtre sur le statut neutre A_CONTACTER
    // 2) Tri par vague croissante (Vague 1, puis 2, etc.)
    // 3) À l'intérieur d'une vague, tri alphabétique fixe Nom > Prénom
    const filtered = (calls || []).filter((call) => call.status === "A_CONTACTER");

    const mapped = filtered.map(mapCallToRow);

    // Tri : vague ASC (vagues définies d'abord, puis sans vague), puis Nom / Prénom
    mapped.sort((a, b) => {
      const waveA = a.waveNumber ?? Number.MAX_SAFE_INTEGER;
      const waveB = b.waveNumber ?? Number.MAX_SAFE_INTEGER;

      if (waveA < waveB) return -1;
      if (waveA > waveB) return 1;

      const lastA = (a.lastName || a.name || "").toLocaleLowerCase("fr-FR");
      const lastB = (b.lastName || b.name || "").toLocaleLowerCase("fr-FR");

      if (lastA < lastB) return -1;
      if (lastA > lastB) return 1;

      const firstA = (a.firstName || "").toLocaleLowerCase("fr-FR");
      const firstB = (b.firstName || "").toLocaleLowerCase("fr-FR");
      if (firstA < firstB) return -1;
      if (firstA > firstB) return 1;

      return 0;
    });

    return mapped;
  }, [calls]);

  const resetFilters = () => {
    setSearch("");
    setSelectedStatuses([]);
    setDateRange("all");
    setCallType("all");
  };

  const handleImport = async (file: File) => {
    try {
      const result = await callsApi.import(file, false);
      showToast({
        variant: "success",
        message: `Import réussi : ${result.summary.imported} appels importés, ${result.summary.skipped} ignorés.`,
      });
      refetch();
    } catch (err) {
      showToast({
        variant: "error",
        message:
          err instanceof Error ? err.message : "Erreur lors de l'import",
      });
    }
  };

  const handleSaveCall = useCallback(
    async (updated: CallRow) => {
      try {
        const apiData = updated._apiData;
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
              // Only date provided
              recallDate = parts[0];
            }
          }
        }
        
        await callsApi.update(apiData.id, {
          status: newStatus,
          notes: updated.description || apiData.notes,
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          toNumber: updated.phone,
          recallDate: recallDate || null,
          recallTimeSlot: recallTimeSlot || null,
        });
        
        showToast({
          variant: "success",
          message: "Modifications enregistrées avec succès.",
        });
        setModalMode("detail");
        refetch();
      } catch (err) {
        showToast({
          variant: "error",
          message:
            err instanceof Error
              ? err.message
              : "Erreur lors de la mise à jour",
        });
      }
    },
    [refetch]
  );

  const handleDeleteCall = useCallback(
    async (row: CallRow) => {
      if (!confirm("Voulez-vous vraiment supprimer cet appel ?")) return;
      try {
        await callsApi.delete(row.id);
        showToast({
          variant: "success",
          message: "Appel supprimé avec succès.",
        });
        refetch();
      } catch (err) {
        showToast({
          variant: "error",
          message:
            err instanceof Error
              ? err.message
              : "Erreur lors de la suppression",
        });
      }
    },
    [refetch]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#7264ff]" />
          <p className="text-sm text-slate-500">Chargement des appels...</p>
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
        {/* Page header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-semibold">Tous les appels</h1>
          <p
            className={`max-w-2xl text-xs ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Accédez à l'ensemble de vos appels entrants et sortants, filtrez
            rapidement les priorités et pilotez vos rappels sans quitter le
            dashboard.
          </p>
        </div>

        {/* Filters + Import */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          selectedStatuses={selectedStatuses}
          onStatusesChange={setSelectedStatuses}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          callType={callType}
          onCallTypeChange={setCallType}
          onReset={resetFilters}
          onOpenImport={() => setImportOpen(true)}
        />

        {/* Main table */}
        <CallsTable
          rows={rows}
          onView={(row) => {
            setSelectedCall(row as CallRow);
            setModalMode("detail");
          }}
          onEdit={(row) => {
            setSelectedCall(row as CallRow);
            setModalMode("edit");
          }}
          onDelete={(row) => handleDeleteCall(row as CallRow)}
        />
      </div>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onConfirm={handleImport}
      />

      <DetailModal
        open={modalMode === "detail" && !!selectedCall}
        call={selectedCall}
        onClose={() => setModalMode(null)}
        onEdit={() => setModalMode("edit")}
      />

      <EditModal
        open={modalMode === "edit" && !!selectedCall}
        call={selectedCall}
        onClose={() => setModalMode(null)}
        onSave={handleSaveCall}
      />
    </>
  );
}

export default function CallPage() {
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
      <CallsPageInner />
    </AppShell>
  );
}
