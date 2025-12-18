"use client";

import React from "react";
import { useTheme } from "../layout/AppShell";

type Props = {
  statusStats: Record<string, number>;
};

const statusLabels: Record<string, string> = {
  NE_REPOND_PAS: "Ne répond pas",
  RAPPEL: "Rappel",
  NE_TRAVAILLE_PAS_EN_SUISSE: "Ne travaille pas en Suisse",
  RENDEZ_VOUS_FIXE: "Rendez-vous fixé",
  RENDEZ_VOUS_REFIXE: "Rendez-vous refixé",
  MAUVAIS_NUMERO: "Mauvais numéro",
  PAS_INTERESSE: "Pas intéressé",
  FAIRE_MAIL: "Faire mail",
  DOUBLONS: "Doublons",
  DEJA_CLIENT: "Déjà client",
};

export const EmployeeStatusChart: React.FC<Props> = ({ statusStats }) => {
  const { isDark } = useTheme();

  const total = Object.values(statusStats).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return (
      <div
        className={`rounded-2xl border p-6 ${
          isDark
            ? "border-slate-800 bg-[#0f1a2f]"
            : "border-slate-200 bg-white"
        }`}
      >
        <h2 className="mb-4 text-lg font-semibold">Statistiques par statut</h2>
        <p className="text-sm text-slate-500">Aucune donnée disponible</p>
      </div>
    );
  }

  const entries = Object.entries(statusStats)
    .map(([status, count]) => ({
      status,
      label: statusLabels[status] || status,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div
      className={`rounded-2xl border p-6 ${
        isDark
          ? "border-slate-800 bg-[#0f1a2f]"
          : "border-slate-200 bg-white"
      }`}
    >
      <h2 className="mb-4 text-lg font-semibold">Statistiques par statut</h2>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.status} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                {entry.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{entry.count}</span>
                <span className="text-xs text-slate-500">
                  ({entry.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div
              className={`h-2 overflow-hidden rounded-full ${
                isDark ? "bg-slate-800" : "bg-slate-100"
              }`}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${entry.percentage}%`,
                  background: "linear-gradient(135deg, #dd7fff, #7264ff)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

