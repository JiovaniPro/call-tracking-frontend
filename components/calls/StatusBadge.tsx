"use client";

import React from "react";
import { useTheme } from "../layout/AppShell";

export type CallStatus =
  | "intéressé"
  | "pas intéressé"
  | "répondeur"
  | "hors cible"
  | "faux numéro";

type StatusBadgeProps = {
  status: CallStatus;
};

const STATUS_STYLES: Record<
  CallStatus,
  { label: string; lightClass: string; darkClass: string }
> = {
  intéressé: {
    label: "Intéressé",
    lightClass: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    darkClass: "bg-emerald-900/40 text-emerald-300 ring-1 ring-emerald-500/40",
  },
  "pas intéressé": {
    label: "Pas intéressé",
    lightClass: "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
    darkClass: "bg-rose-900/40 text-rose-300 ring-1 ring-rose-500/40",
  },
  répondeur: {
    label: "Répondeur",
    lightClass: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
    darkClass: "bg-amber-900/40 text-amber-300 ring-1 ring-amber-500/40",
  },
  "hors cible": {
    label: "Hors cible",
    lightClass: "bg-slate-50 text-slate-600 ring-1 ring-slate-100",
    darkClass: "bg-slate-800/60 text-slate-200 ring-1 ring-slate-500/40",
  },
  "faux numéro": {
    label: "Faux numéro",
    lightClass: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    darkClass: "bg-slate-900 text-slate-100 ring-1 ring-slate-600",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { isDark } = useTheme();
  const config = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
        isDark ? config.darkClass : config.lightClass
      }`}
    >
      {config.label}
    </span>
  );
};


