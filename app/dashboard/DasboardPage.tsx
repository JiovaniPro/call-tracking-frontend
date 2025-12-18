"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../components/layout/AppShell";
import { StatCard } from "../../components/dashboard/StatCard";
import { ChartCard } from "../../components/dashboard/ChartCard";
import { DataTable } from "../../components/dashboard/DataTable";
import { DonutSections } from "../../components/dashboard/DonutSections";
import { useKPI, useTodayReport } from "../../lib/hooks";
import { useRequireAuth, useAuth } from "../../lib/auth";
import type { Call, Reminder, CallStatus as ApiCallStatus } from "../../types/api";

// Helper to format duration
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
};

// Map API status to 4 catégories colorées du DataTable
const mapStatusToCategory = (status: ApiCallStatus): string => {
  switch (status) {
    case "RENDEZ_VOUS_FIXE":
    case "RENDEZ_VOUS_REFIXE":
    case "DEJA_CLIENT":
      return "intéressé";
    case "RAPPEL":
    case "FAIRE_MAIL":
      return "à rappeler";
    case "NE_REPOND_PAS":
      return "sans réponse";
    case "MAUVAIS_NUMERO":
      return "faux numéro";
    default:
      // Autres statuts (PAS_INTERESSE, NE_TRAVAILLE_PAS_EN_SUISSE, DOUBLONS…)
      return "sans réponse";
  }
};

// Map API call to table row format
const mapCallToRow = (call: Call) => {
  // Nom = numéro appelant appelé (ou infos contact si besoin)
  const name = call.direction === "INBOUND" ? call.fromNumber : call.toNumber;

  // Prochain rappel uniquement pour NE_REPOND_PAS / RAPPEL avec date définie
  let nextReminder: string | null = null;
  if (
    (call.status === "NE_REPOND_PAS" || call.status === "RAPPEL") &&
    call.recallDate
  ) {
    const dateStr = call.recallDate.split("T")[0];
    if (call.recallTimeSlot) {
      nextReminder = `${dateStr} • ${call.recallTimeSlot}`;
    } else {
      nextReminder = dateStr;
    }
  }

  return {
    id: call.id,
    name,
    phone: call.direction === "INBOUND" ? call.fromNumber : call.toNumber,
    status: mapStatusToCategory(call.status),
    lastCall: new Date(call.occurredAt).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    nextReminder,
  };
};

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

  // Journal "Appels effectués aujourd'hui" = appels déjà passés (status != A_CONTACTER)
  const todayCalls = (
    todayData?.calls
      .filter((call) => call.status !== "A_CONTACTER")
      .map(mapCallToRow) || []
  ).slice(0, 3);
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
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect admin to admin dashboard
    if (!isLoading && user?.role === "ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#7264ff]" />
      </div>
    );
  }

  // Don't render if admin (will redirect)
  if (user?.role === "ADMIN") {
    return null;
  }

  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}
