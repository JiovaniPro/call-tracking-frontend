 "use client";

import React from "react";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import { useTheme } from "../layout/AppShell";
import { StatusBadge, type CallStatus } from "./StatusBadge";
import { CopyButton } from "./CopyButton";

export type CallType = "nouveau" | "rappel";

export type CallHistoryEntry = {
  id: string;
  date: string;
  status: CallStatus;
  note: string;
};

export type CallRow = {
  id: string;
  name: string;
  phone: string;
  status: CallStatus;
  lastCall: string;
  lastCallDate?: string;
  nextReminder?: string | null;
  type: CallType;
  // Champs pour les modals
  firstName?: string;
  lastName?: string;
  email?: string;
  firstCallDate?: string;
  description?: string;
  history?: CallHistoryEntry[];
};

type CallsTableProps = {
  rows: CallRow[];
  onView?: (row: CallRow) => void;
  onEdit?: (row: CallRow) => void;
  onDelete?: (row: CallRow) => void;
};

export const CallsTable: React.FC<CallsTableProps> = ({
  rows,
  onView,
  onEdit,
  onDelete,
}) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`flex flex-col rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-[0_12px_30px_rgba(106,44,255,0.18)] ${
        isDark
          ? "bg-[#0f1a2f] text-slate-50 shadow-slate-900"
          : "bg-white text-slate-900 shadow-slate-100"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Tous les appels</p>
          <p className="text-[11px] text-slate-400">
            Vue consolidée de l’ensemble des appels et rappels enregistrés.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-900/60 dark:text-slate-300">
          {rows.length} lignes
        </span>
      </div>

      <div className="relative -mx-3 mt-1">
        <div className="max-h-[520px] overflow-y-auto px-3 pb-2">
          <table
            className={`min-w-full border-separate border-spacing-0 text-left text-xs ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            <thead>
              <tr
                className={`text-[11px] uppercase tracking-wide ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">
                  Nom & prénom
                </th>
                <th className="sticky top-0 z-10 bg-inherit px-4 py-2">
                  Téléphone
                </th>
                <th className="sticky top-0 z-10 bg-inherit px-4 py-2">
                  Statut
                </th>
                <th className="sticky top-0 z-10 bg-inherit px-4 py-2">
                  Dernier appel
                </th>
                <th className="sticky top-0 z-10 bg-inherit px-4 py-2">
                  Prochain rappel
                </th>
                <th className="sticky top-0 z-10 bg-inherit px-4 py-2">
                  Type d’appel
                </th>
                <th className="sticky top-0 z-10 bg-inherit px-4 py-2 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`text-[13px] ${
                    isDark
                      ? idx % 2 === 0
                        ? "bg-[#020617]/20"
                        : "bg-[#020617]/5"
                      : idx % 2 === 0
                      ? "bg-white"
                      : "bg-slate-50/70"
                  } ${
                    isDark
                      ? "border-b border-slate-800 hover:bg-white/5"
                      : "border-b border-slate-100 hover:bg-slate-50"
                  } transition`}
                >
                  <td className="whitespace-nowrap py-3 pr-4 font-medium">
                    <span
                      className={isDark ? "text-slate-100" : "text-slate-900"}
                    >
                      {row.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono text-xs ${
                          isDark ? "text-slate-200" : "text-slate-600"
                        }`}
                      >
                        {row.phone}
                      </span>
                      {/* Bouton de copie uniquement dans le tableau */}
                      <CopyButton value={row.phone} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {row.lastCall}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {row.nextReminder ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.type === "nouveau"
                          ? isDark
                            ? "bg-emerald-900/40 text-emerald-300"
                            : "bg-emerald-50 text-emerald-600"
                          : isDark
                          ? "bg-sky-900/40 text-sky-300"
                          : "bg-sky-50 text-sky-600"
                      }`}
                    >
                      {row.type === "nouveau" ? "Nouveau" : "Rappel"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Voir les détails de l’appel"
                        onClick={() => onView?.(row)}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                          isDark
                            ? "bg-white/5 text-slate-200 hover:bg-white/10"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Modifier cet appel"
                        onClick={() => onEdit?.(row)}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                          isDark
                            ? "bg-white/5 text-slate-200 hover:bg-white/10"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <SquarePen className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Supprimer cet appel"
                        onClick={() => onDelete?.(row)}
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                          isDark
                            ? "bg-rose-900/30 text-rose-200 hover:bg-rose-900/60"
                            : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-xs text-slate-400"
                  >
                    Aucun appel ne correspond à vos filtres. Essayez de
                    les assouplir ou de{" "}
                    <span className="font-medium text-[#6a2cff]">
                      réinitialiser les filtres
                    </span>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination mock */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span>Page 1 sur 5 (mock)</span>
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            className="rounded-full px-2 py-1 text-xs text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/5"
            disabled
          >
            Précédent
          </button>
          <button
            type="button"
            className="rounded-full px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed dark:text-slate-100 dark:hover:bg-white/5"
            disabled
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};


