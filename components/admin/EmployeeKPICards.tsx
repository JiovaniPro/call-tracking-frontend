"use client";

import React from "react";
import { StatCard } from "../dashboard/StatCard";
import type { AdminUserDetailKPI } from "../../types/api";

type Props = {
  kpi: AdminUserDetailKPI;
};

export const EmployeeKPICards: React.FC<Props> = ({ kpi }) => {
  const kpiCards = [
    {
      label: "Total appels",
      value: kpi.totalCalls.toString(),
      helper: "Tous les appels effectués",
    },
    {
      label: "Appels aujourd'hui",
      value: kpi.callsToday.toString(),
      helper: "Appels effectués aujourd'hui",
    },
    {
      label: "Appels cette semaine",
      value: kpi.callsThisWeek.toString(),
      helper: "Appels effectués cette semaine",
    },
    {
      label: "Appels ce mois",
      value: kpi.callsThisMonth.toString(),
      helper: "Appels effectués ce mois",
    },
    {
      label: "RDV aujourd'hui",
      value: kpi.appointmentsToday.toString(),
      helper: "Rendez-vous fixés aujourd'hui",
    },
    {
      label: "RDV ce mois",
      value: kpi.appointmentsThisMonth.toString(),
      helper: "Rendez-vous fixés ce mois",
    },
    {
      label: "Total rappels",
      value: kpi.totalReminders.toString(),
      helper: "Tous les rappels",
    },
    {
      label: "Rappels en attente",
      value: kpi.pendingReminders.toString(),
      helper: "Rappels non terminés",
    },
    {
      label: "Rappels en retard",
      value: kpi.overdueReminders.toString(),
      helper: "Rappels en retard",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {kpiCards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
};

