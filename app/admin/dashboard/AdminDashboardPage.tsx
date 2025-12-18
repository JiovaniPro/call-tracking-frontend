"use client";

import { useState, useEffect } from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { StatCard } from "../../../components/dashboard/StatCard";
import { adminApi } from "../../../lib/api";
import { useRequireAdmin } from "../../../lib/auth";
import type { AdminKPIReport } from "../../../types/api";

function AdminDashboardContent() {
  const [kpi, setKpi] = useState<AdminKPIReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadKPI = async () => {
      try {
        const data = await adminApi.getKPI();
        setKpi(data);
      } catch (error) {
        console.error("Failed to load admin KPI:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadKPI();
  }, []);

  const kpiCards = [
    {
      label: "Appels aujourd'hui",
      value: kpi?.totalCallsToday.toString() || "0",
      helper: "tous utilisateurs confondus",
    },
    {
      label: "Rendez-vous aujourd'hui",
      value: kpi?.totalAppointmentsToday.toString() || "0",
      helper: "tous utilisateurs confondus",
    },
    {
      label: "Rendez-vous ce mois",
      value: kpi?.totalAppointmentsThisMonth.toString() || "0",
      helper: "tous utilisateurs confondus",
    },
    {
      label: "Rappels aujourd'hui",
      value: kpi?.totalRemindersToday.toString() || "0",
      helper: "tous utilisateurs confondus",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Administrateur</h1>
        <p className="text-sm text-slate-500 mt-1">
          Vue globale de l'activité de tous les utilisateurs
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  useRequireAdmin();

  return (
    <AppShell>
      <AdminDashboardContent />
    </AppShell>
  );
}

