"use client";

import React from "react";
import { Eye, AlertCircle } from "lucide-react";
import { useTheme } from "../layout/AppShell";
import type { AdminUserWithStats } from "../../types/api";
import dayjs from "dayjs";

type EmployeesTableProps = {
  users: AdminUserWithStats[];
  onView?: (user: AdminUserWithStats) => void;
};

export const EmployeesTable: React.FC<EmployeesTableProps> = ({
  users,
  onView,
}) => {
  const { isDark } = useTheme();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Jamais";
    try {
      return dayjs(dateString).format("DD/MM/YYYY HH:mm");
    } catch {
      return "Date invalide";
    }
  };

  const getRoleBadgeColor = (role: "ADMIN" | "USER") => {
    if (role === "ADMIN") {
      return isDark
        ? "bg-purple-900/30 text-purple-300 border-purple-700/50"
        : "bg-purple-50 text-purple-700 border-purple-200";
    }
    return isDark
      ? "bg-blue-900/30 text-blue-300 border-blue-700/50"
      : "bg-blue-50 text-blue-700 border-blue-200";
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    if (isActive) {
      return isDark
        ? "bg-green-900/30 text-green-300 border-green-700/50"
        : "bg-green-50 text-green-700 border-green-200";
    }
    return isDark
      ? "bg-red-900/30 text-red-300 border-red-700/50"
      : "bg-red-50 text-red-700 border-red-200";
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
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">
                  Nom & Prénom
                </th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">
                  Email
                </th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">
                  Rôle
                </th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4 text-right">
                  Appels aujourd&apos;hui
                </th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4 text-right">
                  RDV aujourd&apos;hui
                </th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4 text-right">
                  RDV ce mois
                </th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4 text-right">
                  Rappels en attente
                </th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4 text-right">
                  Rappels en retard
                </th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">
                  Dernière activité
                </th>
                <th className="sticky top-0 z-10 bg-inherit py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className={`${
                    index < users.length - 1
                      ? isDark
                        ? "border-b border-slate-800"
                        : "border-b border-slate-100"
                      : ""
                  } hover:bg-opacity-50 ${
                    isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
                  } transition-colors`}
                >
                  <td className="py-3 pr-4">
                    <div className="font-medium">
                      {user.firstName || user.lastName
                        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                        : "N/A"}
                    </div>
                  </td>
                  <td className="py-3 pr-4">{user.email}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role === "ADMIN" ? "Admin" : "Utilisateur"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-medium">
                    {user.stats.callsToday}
                  </td>
                  <td className="py-3 pr-4 text-right font-medium">
                    {user.stats.appointmentsToday}
                  </td>
                  <td className="py-3 pr-4 text-right font-medium">
                    {user.stats.appointmentsThisMonth}
                  </td>
                  <td className="py-3 pr-4 text-right font-medium">
                    {user.stats.pendingReminders}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {user.stats.overdueReminders > 0 ? (
                      <span className="inline-flex items-center gap-1 font-medium text-red-600 dark:text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        {user.stats.overdueReminders}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-xs">
                    {formatDate(user.stats.lastActivity)}
                  </td>
                  <td className="py-3">
                    {onView && (
                      <button
                        onClick={() => onView(user)}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition cursor-pointer ${
                          isDark
                            ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Eye className="h-3 w-3" />
                        Voir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

