"use client";

import { useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { StatCard } from "../../components/dashboard/StatCard";
import { ChartCard } from "../../components/dashboard/ChartCard";
import { DataTable } from "../../components/dashboard/DataTable";
import { DonutSections } from "../../components/dashboard/DonutSections";
import { useKPI, useTodayReport } from "../../lib/hooks";
import { useRequireAuth } from "../../lib/auth";
import type { Call, Reminder } from "../../types/api";

// Helper to format duration
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
};

// Map API call to table row format
const mapCallToRow = (call: Call) => ({
  id: call.id,
  name: call.fromNumber,
  phone: call.toNumber,
  status: mapStatus(call.status),
  lastCall: new Date(call.occurredAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  nextReminder: null,
});

// Map API reminder to table row format
const mapReminderToRow = (reminder: Reminder) => ({
  id: reminder.id,
  name: reminder.title,
  phone: reminder.call?.toNumber || "-",
  status: reminder.status === "PENDING" ? "à rappeler" : "intéressé",
  lastCall: reminder.description || "-",
  nextReminder: new Date(reminder.dueAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }),
});

// Map API status to UI status
const mapStatus = (status: string): string => {
  const map: Record<string, string> = {
    NEW: "intéressé",
    IN_PROGRESS: "à rappeler",
    COMPLETED: "intéressé",
    MISSED: "sans réponse",
    CANCELED: "pas intéressé",
  };
  return map[status] || status;
};

function DashboardContent() {
  const [kpiRange, setKpiRange] = useState<"day" | "week" | "month">("month");
  const { data: kpi, isLoading: kpiLoading } = useKPI(kpiRange);
  const { data: todayData, isLoading: todayLoading } = useTodayReport();

  const kpiCards = [
    {
      label: "Appels aujourd'hui",
      value: todayData?.callsToday?.toString() || todayData?.calls.length.toString() || "0",
      helper: "appels effectués aujourd'hui",
      trend: { value: "+0%", direction: "up" as const },
    },
    {
      label: "Rappels à faire",
      value: todayData?.reminders.length.toString() || "0",
      helper: "rappels prévus aujourd'hui",
      trend: { value: "+0%", direction: "up" as const },
    },
  ];

  const appointmentCards = [
    {
      label: "Rendez-vous aujourd'hui",
      value: todayData?.appointmentsToday?.toString() || "0",
      helper: "rendez-vous fixés aujourd'hui",
      trend: { value: "+0%", direction: "up" as const },
    },
    {
      label: "Rendez-vous ce mois",
      value: kpi?.appointmentsThisMonth?.toString() || "0",
      helper: "total de rendez-vous fixés ce mois",
      trend: { value: "+0%", direction: "up" as const },
    },
  ];

  // Monthly calls chart data (placeholder - would need historical data from API)
  const monthlyCalls = [
    { month: "Oct", value: 0 },
    { month: "Nov", value: 0 },
    { month: "Déc", value: kpi?.totalCalls || 0 },
    { month: "Janv", value: 0 },
    { month: "Févr", value: 0 },
    { month: "Mars", value: 0 },
  ];

  const todayCalls = (todayData?.calls.map(mapCallToRow) || []).slice(0, 3);
  const todayReminders = (todayData?.reminders.map(mapReminderToRow) || []).slice(0, 3);

  if (kpiLoading || todayLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#7264ff]" />
          <p className="text-sm text-slate-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Période :</span>
        {(["day", "week", "month"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setKpiRange(range)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              kpiRange === range
                ? "bg-gradient-to-r from-[#dd7fff] via-[#7264ff] to-[#54d4ef] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {range === "day" ? "Jour" : range === "week" ? "Semaine" : "Mois"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
        <ChartCard
          title="Total des appels"
          subtitle="Volume cumulé par mois (connectés + manqués)."
          totalLabel="Total"
          totalValue={kpi?.totalCalls.toLocaleString() || "0"}
          points={monthlyCalls}
        />
        <div className="grid gap-4">
          {kpiCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
          {/* Rendez-vous cards côte à côte */}
          <div className="grid grid-cols-2 gap-4">
            {appointmentCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        </div>
      </div>

      <DonutSections />

      <div className="grid gap-6 lg:grid-cols-2">
        <DataTable
          title="Appels effectués aujourd'hui"
          rows={todayCalls}
          emptyMessage="Aucun appel aujourd'hui"
          viewAllLink="/today"
        />
        <DataTable
          title="Rappels du jour"
          rows={todayReminders}
          emptyMessage="Aucun rappel aujourd'hui"
          viewAllLink="/reminders"
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
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
      <DashboardContent />
    </AppShell>
  );
}
