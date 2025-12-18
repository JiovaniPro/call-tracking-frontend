"use client";

import React from "react";
import { useTheme } from "../layout/AppShell";
import { StatusBadge } from "../calls/StatusBadge";
import type { Call } from "../../types/api";
import dayjs from "dayjs";

type Props = {
  calls: Call[];
};

export const EmployeeCallsHistory: React.FC<Props> = ({ calls }) => {
  const { isDark } = useTheme();

  const formatDate = (dateString: string) => {
    try {
      return dayjs(dateString).format("DD/MM/YYYY HH:mm");
    } catch {
      return "Date invalide";
    }
  };

  if (calls.length === 0) {
    return (
      <div
        className={`rounded-2xl border p-6 ${
          isDark
            ? "border-slate-800 bg-[#0f1a2f]"
            : "border-slate-200 bg-white"
        }`}
      >
        <h2 className="mb-4 text-lg font-semibold">Historique des appels</h2>
        <p className="text-sm text-slate-500">Aucun appel récent</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-6 ${
        isDark
          ? "border-slate-800 bg-[#0f1a2f]"
          : "border-slate-200 bg-white"
      }`}
    >
      <h2 className="mb-4 text-lg font-semibold">Historique des appels (10 derniers)</h2>
      <div className="overflow-x-auto">
        <table
          className={`min-w-full border-separate border-spacing-0 text-sm ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          <thead>
            <tr
              className={`text-xs uppercase tracking-wide ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              <th className="py-2 pr-4 text-left">Date</th>
              <th className="py-2 pr-4 text-left">Contact</th>
              <th className="py-2 pr-4 text-left">Téléphone</th>
              <th className="py-2 pr-4 text-left">Statut</th>
              <th className="py-2 pr-4 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call, index) => (
              <tr
                key={call.id}
                className={
                  index < calls.length - 1
                    ? isDark
                      ? "border-b border-slate-800"
                      : "border-b border-slate-100"
                    : ""
                }
              >
                <td className="py-3 pr-4">{formatDate(call.occurredAt)}</td>
                <td className="py-3 pr-4">
                  {call.firstName || call.lastName
                    ? `${call.firstName || ""} ${call.lastName || ""}`.trim()
                    : "N/A"}
                </td>
                <td className="py-3 pr-4">{call.toNumber}</td>
                <td className="py-3 pr-4">
                  <StatusBadge status={call.status} />
                </td>
                <td className="py-3 pr-4 text-xs">
                  {call.notes || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

