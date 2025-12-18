"use client";

import React, { useState, useMemo } from "react";
import { Eye } from "lucide-react";
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
  // Nom complet (fallback pour les vues qui n'ont pas besoin de distinguer)
  name: string;
  // Détail du nom pour la vue "Tous les appels"
  firstName?: string;
  lastName?: string;
  phone: string;
  status: CallStatus;
  lastCall: string;
  lastCallDate?: string;
  nextReminder?: string | null;
  type: CallType;
  // Vague de prospection (import)
  waveNumber?: number | null;
  // Champs pour les modals
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
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / itemsPerPage));

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return rows.slice(startIndex, startIndex + itemsPerPage);
  }, [rows, currentPage]);

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
            File d&apos;attente des prospects importés, jamais appelés. Appelez et
            qualifiez chaque ligne de haut en bas.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-900/60 dark:text-slate-300">
          {rows.length} lignes
        </span>
      </div>

      <div className="relative -mx-3 mt-1">
        <div className="px-3 pb-2">
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
                  Vague
                </th>
                <th className="sticky top-0 z-10 bg-inherit px-4 py-2">
                  Nom
                </th>
                <th className="sticky top-0 z-10 bg-inherit px-4 py-2">
                  Prénom
                </th>
                <th className="sticky top-0 z-10 bg-inherit px-4 py-2">
                  Téléphone
                </th>
                <th className="sticky top-0 z-10 bg-inherit px-4 py-2">
                  Statut
                </th>
                <th className="sticky top-0 z-10 bg-inherit px-4 py-2 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, idx) => (
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
                    {row.waveNumber != null ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          // Couleurs différentes par vague (cycle sur quelques teintes)
                          row.waveNumber % 5 === 1
                            ? isDark
                              ? "bg-violet-900/60 text-violet-200 ring-1 ring-violet-500/60"
                              : "bg-violet-50 text-violet-700 ring-1 ring-violet-200"
                            : row.waveNumber % 5 === 2
                            ? isDark
                              ? "bg-sky-900/60 text-sky-200 ring-1 ring-sky-500/60"
                              : "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                            : row.waveNumber % 5 === 3
                            ? isDark
                              ? "bg-emerald-900/60 text-emerald-200 ring-1 ring-emerald-500/60"
                              : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : row.waveNumber % 5 === 4
                            ? isDark
                              ? "bg-amber-900/60 text-amber-200 ring-1 ring-amber-500/60"
                              : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                            : isDark
                            ? "bg-rose-900/60 text-rose-200 ring-1 ring-rose-500/60"
                            : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                        }`}
                      >
                        Vague {row.waveNumber}
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          isDark
                            ? "bg-slate-900/40 text-slate-500 ring-1 ring-slate-700/60"
                            : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
                        }`}
                      >
                        Vague n/d
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    <span
                      className={isDark ? "text-slate-100" : "text-slate-900"}
                    >
                      {row.lastName || row.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={isDark ? "text-slate-100" : "text-slate-900"}
                    >
                      {row.firstName || ""}
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
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {onEdit && (
                        <button
                          type="button"
                          aria-label="Appeler et qualifier le prospect"
                          onClick={() => onEdit?.(row)}
                          className={`inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full ${
                            isDark
                              ? "bg-[#1d2939] text-emerald-300 hover:bg-emerald-500/20"
                              : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100"
                          }`}
                        >
                          <span className="text-[11px] font-semibold">📞</span>
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Voir les détails de l'appel"
                        onClick={() => onView?.(row)}
                        className={`inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full ${
                          isDark
                            ? "bg-white/5 text-slate-200 hover:bg-white/10"
                            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
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

      {/* Pagination réelle */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span>
          Page {currentPage} sur {totalPages} ({totalRows} ligne
          {totalRows > 1 ? "s" : ""})
        </span>
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="cursor-pointer rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            disabled={currentPage === 1}
          >
            Précédent
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="cursor-pointer rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            disabled={currentPage === totalPages || totalRows === 0}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};


