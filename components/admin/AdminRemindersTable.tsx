"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../layout/AppShell";
import type { AdminReminder } from "../../types/api";
import dayjs from "dayjs";
import { Eye, AlertCircle } from "lucide-react";

type AdminRemindersTableProps = {
  reminders: AdminReminder[];
};

export const AdminRemindersTable: React.FC<AdminRemindersTableProps> = ({
  reminders,
}) => {
  const { isDark } = useTheme();
  const router = useRouter();

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

  const isOverdue = (reminder: AdminReminder) => {
    return reminder.status === "PENDING" && new Date(reminder.dueAt) < new Date();
  };

  const handleViewUser = (userId: string) => {
    router.push(`/admin/employees/${userId}`);
  };

  return (
    <div
      className={`rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-[0_12px_30px_rgba(106,44,255,0.18)] ${
        isDark
          ? "bg-[#0f1a2f] text-slate-50 shadow-slate-900"
          : "bg-white text-slate-900 shadow-slate-100"
      }`}
    >
      <div className="relative -mx-3 mt-1 overflow-x-auto">
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
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">Date/Heure</th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">Utilisateur</th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">Titre</th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">Description</th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">Statut</th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">Appel associé</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder, index) => {
                const overdue = isOverdue(reminder);
                return (
                  <tr
                    key={reminder.id}
                    className={`${
                      index < reminders.length - 1
                        ? isDark
                          ? "border-b border-slate-800"
                          : "border-b border-slate-100"
                        : ""
                    } hover:bg-opacity-50 ${
                      isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
                    } transition-colors ${
                      overdue ? (isDark ? "bg-red-900/10" : "bg-red-50/50") : ""
                    }`}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        {formatDate(reminder.dueAt)}
                        {overdue && (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleViewUser(reminder.user.id)}
                        className="flex items-center gap-1 text-left hover:underline cursor-pointer"
                      >
                        {reminder.user.firstName || reminder.user.lastName
                          ? `${reminder.user.firstName || ""} ${reminder.user.lastName || ""}`.trim()
                          : reminder.user.email}
                        <Eye className="h-3 w-3" />
                      </button>
                    </td>
                    <td className="py-3 pr-4 font-medium">{reminder.title}</td>
                    <td className="py-3 pr-4 text-xs max-w-xs truncate">
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

