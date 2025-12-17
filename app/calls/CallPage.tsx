"use client";

import React, { useMemo, useState } from "react";
import { AppShell, useTheme } from "../../components/layout/AppShell";
import { FilterBar } from "../../components/calls/FilterBar";
import { ImportModal } from "../../components/calls/ImportModal";
import {
  CallsTable,
  type CallRow,
  type CallType,
} from "../../components/calls/CallsTable";
import { DetailModal } from "../../components/calls/DetailModal";
import { EditModal } from "../../components/calls/EditModal";
import type { CallStatus } from "../../components/calls/StatusBadge";

type DateRange = "all" | "today" | "week" | "month" | "custom";

const MOCK_CALLS: CallRow[] = [
  {
    id: "1",
    name: "Marie Dupont",
    firstName: "Marie",
    lastName: "Dupont",
    phone: "+33 6 12 34 56 78",
    status: "intéressé",
    lastCall: "Aujourd’hui - 09:24",
    lastCallDate: "2025-12-16",
    nextReminder: "Aujourd’hui - 16:00",
    type: "nouveau",
    email: "marie.dupont@example.com",
    firstCallDate: "2025-11-20",
    description:
      "Prospect chaud pour la nouvelle offre. Intéressée par un accompagnement premium, à relancer après envoi du devis.",
  },
  {
    id: "2",
    name: "Paul Martin",
    firstName: "Paul",
    lastName: "Martin",
    phone: "+33 7 98 76 54 32",
    status: "pas intéressé",
    lastCall: "Hier - 17:40",
    lastCallDate: "2025-12-15",
    nextReminder: null,
    type: "nouveau",
    email: "paul.martin@example.com",
    firstCallDate: "2025-10-05",
    description:
      "Ne souhaite pas changer de solution cette année. À recontacter uniquement si nouvelle offre très compétitive.",
  },
  {
    id: "3",
    name: "Agence Horizon",
    phone: "+33 1 45 23 89 10",
    status: "répondeur",
    lastCall: "Il y a 3 jours",
    lastCallDate: "2025-12-13",
    nextReminder: "Demain - 11:30",
    type: "rappel",
    email: "contact@agence-horizon.fr",
    firstCallDate: "2025-09-12",
    description:
      "Agence intéressée par le suivi multi-campagnes. Plusieurs décideurs impliqués, processus de décision plus long.",
  },
  {
    id: "4",
    name: "Julien Moreau",
    firstName: "Julien",
    lastName: "Moreau",
    phone: "+33 6 22 11 33 44",
    status: "intéressé",
    lastCall: "Cette semaine",
    lastCallDate: "2025-12-12",
    nextReminder: "Cette semaine",
    type: "rappel",
    email: "julien.moreau@example.com",
    firstCallDate: "2025-11-02",
  },
  {
    id: "5",
    name: "Société Nova",
    phone: "+33 4 91 23 45 67",
    status: "hors cible",
    lastCall: "Le 02/12/2025",
    lastCallDate: "2025-12-02",
    nextReminder: null,
    type: "nouveau",
    email: "direction@societe-nova.fr",
    firstCallDate: "2025-09-28",
  },
  {
    id: "6",
    name: "Numéro inconnu",
    phone: "+33 1 00 00 00 00",
    status: "faux numéro",
    lastCall: "Le 30/11/2025",
    lastCallDate: "2025-11-30",
    nextReminder: null,
    type: "nouveau",
  },
  {
    id: "7",
    name: "Claire Bernard",
    firstName: "Claire",
    lastName: "Bernard",
    phone: "+33 6 44 55 66 77",
    status: "intéressé",
    lastCall: "Cette semaine",
    lastCallDate: "2025-12-11",
    nextReminder: "La semaine prochaine",
    type: "rappel",
    email: "claire.bernard@example.com",
    firstCallDate: "2025-11-15",
  },
  {
    id: "8",
    name: "Immo Paris 9",
    phone: "+33 1 53 00 11 22",
    status: "répondeur",
    lastCall: "Aujourd’hui - 11:10",
    lastCallDate: "2025-12-16",
    nextReminder: "Aujourd’hui - 18:15",
    type: "rappel",
    email: "contact@immoparis9.fr",
    firstCallDate: "2025-10-30",
  },
];

function CallsPageInner() {
  const { isDark } = useTheme();
  const [calls, setCalls] = useState<CallRow[]>(MOCK_CALLS);
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<CallStatus[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [callType, setCallType] = useState<CallType | "all">("all");
  const [importOpen, setImportOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<CallRow | null>(null);
  const [modalMode, setModalMode] = useState<"detail" | "edit" | null>(null);

  const resetFilters = () => {
    setSearch("");
    setSelectedStatuses([]);
    setDateRange("all");
    setCallType("all");
  };

  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      const normalizedSearch = search.trim().toLowerCase();
      if (normalizedSearch) {
        const haystack = `${call.name} ${call.phone}`.toLowerCase();
        if (!haystack.includes(normalizedSearch)) {
          return false;
        }
      }

      if (
        selectedStatuses.length > 0 &&
        !selectedStatuses.includes(call.status)
      ) {
        return false;
      }

      if (callType !== "all" && call.type !== callType) {
        return false;
      }

      if (dateRange !== "all" && call.lastCallDate) {
        const date = new Date(call.lastCallDate);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (dateRange === "today" && diffDays > 1) return false;
        if (dateRange === "week" && diffDays > 7) return false;
        if (dateRange === "month" && diffDays > 31) return false;
        // "custom" laissé volontairement non implémenté (mock)
      }

      return true;
    });
  }, [calls, search, selectedStatuses, dateRange, callType]);

  const handleMockImport = () => {
    const importedRows: CallRow[] = [
      {
        id: `import-${Date.now()}`,
        name: "Import Excel - Prospect 1",
        phone: "+33 6 99 88 77 66",
        status: "intéressé",
        lastCall: "Import Excel",
        lastCallDate: "2025-12-16",
        nextReminder: "Demain - 10:00",
        type: "nouveau",
      },
      {
        id: `import-${Date.now()}-2`,
        name: "Import Excel - Prospect 2",
        phone: "+33 1 23 45 67 89",
        status: "répondeur",
        lastCall: "Import Excel",
        lastCallDate: "2025-12-16",
        nextReminder: "Cette semaine",
        type: "rappel",
      },
    ];

    setCalls((prev) => [...importedRows, ...prev]);
    setFeedbackMessage(
      "Fichier importé avec succès. Les lignes simulées ont été ajoutées à la liste."
    );
  };

  const handleSaveCall = (updated: CallRow) => {
    setCalls((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCall(updated);
    setModalMode("detail");
    setFeedbackMessage("Modifications enregistrées (simulation).");
  };

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
            Accédez à l’ensemble de vos appels entrants et sortants, filtrez
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

        {/* Feedback global (import, édition, etc.) */}
        {feedbackMessage && (
          <div
            className={`rounded-2xl border px-4 py-2 text-[11px] ${
              isDark
                ? "border-emerald-700/50 bg-emerald-900/20 text-emerald-200"
                : "border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            {feedbackMessage}
          </div>
        )}

        {/* Main table */}
        <CallsTable
          rows={filteredCalls}
          onView={(row) => {
            setSelectedCall(row);
            setModalMode("detail");
          }}
          onEdit={(row) => {
            setSelectedCall(row);
            setModalMode("edit");
          }}
          onDelete={() => {
            // TODO: confirmation de suppression (mock)
          }}
        />
      </div>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onConfirm={handleMockImport}
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
  return (
    <AppShell>
      <CallsPageInner />
    </AppShell>
  );
}


