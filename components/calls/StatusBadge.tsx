"use client";

import React from "react";
import { useTheme } from "../layout/AppShell";

export type CallStatus =
  | "À contacter"
  | "Ne répond pas"
  | "Rappel"
  | "Ne travaille pas en Suisse"
  | "Rendez-vous fixé"
  | "Rendez-vous refixé"
  | "Mauvais numéro"
  | "Pas intéressé"
  | "Faire mail"
  | "Doublons"
  | "Déjà client";

type StatusBadgeProps = {
  status: CallStatus;
  recallDate?: string; // Format: "DD/MM" pour afficher dans le badge
};

const STATUS_STYLES: Record<
  CallStatus,
  { label: string; lightClass: string; darkClass: string }
> = {
  "À contacter": {
    label: "À contacter",
    lightClass: "bg-slate-50 text-slate-600 ring-1 ring-slate-100",
    darkClass: "bg-slate-800/60 text-slate-200 ring-1 ring-slate-500/40",
  },
  "Ne répond pas": {
    label: "Ne répond pas",
    lightClass: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
    darkClass: "bg-amber-900/40 text-amber-300 ring-1 ring-amber-500/40",
  },
  "Rappel": {
    label: "Rappel",
    lightClass: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
    darkClass: "bg-blue-900/40 text-blue-300 ring-1 ring-blue-500/40",
  },
  "Ne travaille pas en Suisse": {
    label: "Ne travaille pas en Suisse",
    lightClass: "bg-purple-50 text-purple-600 ring-1 ring-purple-100",
    darkClass: "bg-purple-900/40 text-purple-300 ring-1 ring-purple-500/40",
  },
  "Rendez-vous fixé": {
    label: "Rendez-vous fixé",
    lightClass: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    darkClass: "bg-emerald-900/40 text-emerald-300 ring-1 ring-emerald-500/40",
  },
  "Rendez-vous refixé": {
    label: "Rendez-vous refixé",
    lightClass: "bg-teal-50 text-teal-600 ring-1 ring-teal-100",
    darkClass: "bg-teal-900/40 text-teal-300 ring-1 ring-teal-500/40",
  },
  "Mauvais numéro": {
    label: "Mauvais numéro",
    lightClass: "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
    darkClass: "bg-rose-900/40 text-rose-300 ring-1 ring-rose-500/40",
  },
  "Pas intéressé": {
    label: "Pas intéressé",
    lightClass: "bg-red-50 text-red-600 ring-1 ring-red-100",
    darkClass: "bg-red-900/40 text-red-300 ring-1 ring-red-500/40",
  },
  "Faire mail": {
    label: "Faire mail",
    lightClass: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100",
    darkClass: "bg-indigo-900/40 text-indigo-300 ring-1 ring-indigo-500/40",
  },
  "Doublons": {
    label: "Doublons",
    lightClass: "bg-gray-50 text-gray-600 ring-1 ring-gray-100",
    darkClass: "bg-gray-800/60 text-gray-200 ring-1 ring-gray-500/40",
  },
  "Déjà client": {
    label: "Déjà client",
    lightClass: "bg-green-50 text-green-600 ring-1 ring-green-100",
    darkClass: "bg-green-900/40 text-green-300 ring-1 ring-green-500/40",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, recallDate }) => {
  const { isDark } = useTheme();
  const config = STATUS_STYLES[status];
  const showDate = recallDate && (status === "Ne répond pas" || status === "Rappel");

  if (!config) {
    // Fallback for unknown status
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
          isDark ? "bg-slate-800/60 text-slate-200" : "bg-slate-50 text-slate-600"
        }`}
      >
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
        isDark ? config.darkClass : config.lightClass
      }`}
    >
      <span>{config.label}</span>
      {showDate && (
        <span className={`text-[10px] opacity-75 ${
          isDark ? "text-slate-200" : "text-slate-600"
        }`}>
          ({recallDate})
        </span>
      )}
    </span>
  );
};
