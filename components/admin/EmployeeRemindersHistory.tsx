"use client";

import React from "react";
import { useTheme } from "../layout/AppShell";
import type { Reminder } from "../../types/api";
import dayjs from "dayjs";

type Props = {
  reminders: Reminder[];
};

export const EmployeeRemindersHistory: React.FC<Props> = ({ reminders }) => {
  const { isDark } = useTheme();

  const formatDate = (dateString: string) => {
    try {
      return dayjs(dateString).format("DD/MM/YYYY HH:mm");
    } catch {
      return "Date invalide";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    if (status === "DONE") {
      return isDark
        ? "bg-green-900/30 text-green-300 border-green-700/50"
        : "bg-green-50 text-green-700 border-green-200";
    }
    if (status === "CANCELED") {
      return isDark
        ? "bg-red-900/30 text-red-300 border-red-700/50"
        : "bg-red-50 text-red-700 border-red-200";
    }
    return isDark
      ? "bg-yellow-900/30 text-yellow-300 border-yellow-700/50"
      : "bg-yellow-50 text-yellow-700 border-yellow-200";
  };

  const statusLabels: Record<string, string> = {
    PENDING: "En attente",
    DONE: "Terminé",
    CANCELED: "Annulé",
  };

  if (reminders.length === 0) {
    return (
      <div
        className={`rounded-2xl border p-6 ${
          isDark
            ? "border-slate-800 bg-[#0f1a2f]"
            : "border-slate-200 bg-white"
        }`}
      >
        <h2 className="mb-4 text-lg font-semibold">Historique des rappels</h2>
        <p className="text-sm text-slate-500">Aucun rappel récent</p>
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
      <h2 className="mb-4 text-lg font-semibold">Historique des rappels (10 derniers)</h2>
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
              <th className="py-2 pr-4 text-left">Date/Heure</th>
              <th className="py-2 pr-4 text-left">Titre</th>
              <th className="py-2 pr-4 text-left">Description</th>
              <th className="py-2 pr-4 text-left">Statut</th>
              <th className="py-2 pr-4 text-left">Appel associé</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((reminder, index) => (
              <tr
                key={reminder.id}
                className={
                  index < reminders.length - 1
                    ? isDark
                      ? "border-b border-slate-800"
                      : "border-b border-slate-100"
                    : ""
                }
              >
                <td className="py-3 pr-4">{formatDate(reminder.dueAt)}</td>
                <td className="py-3 pr-4 font-medium">{reminder.title}</td>
                <td className="py-3 pr-4 text-xs">
                  {reminder.description || "-"}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeColor(
                      reminder.status
                    )}`}
                  >
                    {statusLabels[reminder.status] || reminder.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs">
                  {reminder.call
                    ? `${reminder.call.firstName || ""} ${reminder.call.lastName || ""}`.trim() ||
                      reminder.call.toNumber
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

