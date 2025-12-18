 "use client";

import React from "react";
import { Eye } from "lucide-react";
import { useTheme } from "../layout/AppShell";

export type CallStatus = "intéressé" | "à rappeler" | "sans réponse" | "faux numéro";

export type CallRow = {
  id: string;
  name: string;
  phone: string;
  status: string;
  lastCall: string;
  nextReminder: string | null;
};

type DataTableProps = {
  title: string;
  rows: CallRow[];
  emptyMessage?: string;
  viewAllLink?: string;
};

const statusConfig: Record<
  CallStatus,
  {
    label: string;
    lightClass: string;
    darkClass: string;
  }
> = {
  intéressé: {
    label: "Intéressé",
    lightClass: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    darkClass: "bg-emerald-900/40 text-emerald-300 ring-1 ring-emerald-500/40",
  },
  "à rappeler": {
    label: "À rappeler",
    lightClass: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
    darkClass: "bg-amber-900/40 text-amber-300 ring-1 ring-amber-500/40",
  },
  "sans réponse": {
    label: "Sans réponse",
    lightClass: "bg-slate-50 text-slate-600 ring-1 ring-slate-100",
    darkClass: "bg-slate-700 text-slate-200 ring-1 ring-slate-500/40",
  },
  "faux numéro": {
    label: "Faux numéro",
    lightClass: "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
    darkClass: "bg-rose-900/40 text-rose-300 ring-1 ring-rose-500/40",
  },
};

export const DataTable: React.FC<DataTableProps> = ({ title, rows, emptyMessage = "Aucune donnée", viewAllLink }) => {
  const { isDark } = useTheme();

  // Safe status lookup with fallback
  const getStatusConfig = (status: string) => {
    return statusConfig[status as CallStatus] || {
      label: status,
      lightClass: "bg-slate-50 text-slate-600 ring-1 ring-slate-100",
      darkClass: "bg-slate-700 text-slate-200 ring-1 ring-slate-500/40",
    };
  };

  return (
    <div
      className={`flex flex-col rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-[0_12px_30px_rgba(106,44,255,0.25)] hover:-translate-y-1 ${
        isDark ? "bg-[#0f1a2f] text-slate-50 shadow-slate-900" : "bg-white text-slate-900 shadow-slate-100"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-medium">{title}</p>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className={`text-xs font-medium transition ${
              isDark ? "text-[#bfa7ff] hover:text-[#d4c6ff]" : "text-[#6a2cff] hover:text-[#5823cf]"
            }`}
          >
            Voir tout
          </a>
        )}
      </div>
      <div className="overflow-x-auto">
        <table
          className={`min-w-full text-left text-xs ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          <thead>
            <tr
              className={`text-[11px] uppercase tracking-wide ${
                isDark ? "text-slate-500" : "text-slate-400"
              } ${isDark ? "border-b border-slate-800" : "border-b border-slate-100"}`}
            >
              <th className="py-2 pr-4">Nom</th>
              <th className="px-4 py-2">Téléphone</th>
              <th className="px-4 py-2">Statut</th>
              <th className="px-4 py-2">Dernier appel</th>
              <th className="px-4 py-2">Prochain rappel</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : rows.map((row) => {
              const status = getStatusConfig(row.status);
              return (
                <tr
                  key={row.id}
                  className={`text-[13px] last:border-0 ${
                    isDark ? "border-b border-slate-800 hover:bg-white/5" : "border-b border-slate-50 hover:bg-slate-50/60"
                  }`}
                >
                  <td className="py-3 pr-4 font-medium text-slate-900">
                    <span className={isDark ? "text-slate-100" : "text-slate-900"}>{row.name}</span>
                  </td>
                  <td className={`px-4 py-3 font-mono text-xs ${isDark ? "text-slate-200" : "text-slate-600"}`}>
                    {row.phone}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        isDark ? status.darkClass : status.lightClass
                      }`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className={`px-4 py-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{row.lastCall}</td>
                  <td className={`px-4 py-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {row.nextReminder || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      aria-label="Voir la fiche"
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                        isDark
                          ? "bg-white/5 text-slate-200 hover:bg-white/10"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


