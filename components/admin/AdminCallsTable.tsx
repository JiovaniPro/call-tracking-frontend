"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../layout/AppShell";
import { StatusBadge } from "../calls/StatusBadge";
import { mapApiStatusToUI } from "../../lib/statusMapping";
import type { AdminCallsResponse } from "../../types/api";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

type AdminCallsTableProps = {
  calls: AdminCallsResponse["calls"];
  pagination: AdminCallsResponse["pagination"];
  onPageChange: (page: number) => void;
};

export const AdminCallsTable: React.FC<AdminCallsTableProps> = ({
  calls,
  pagination,
  onPageChange,
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
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Journal des appels</p>
          <p className="text-[11px] text-slate-400">
            {pagination.total} appels au total
          </p>
        </div>
      </div>

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
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">Contact</th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">Téléphone</th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">Statut</th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">Type</th>
                <th className="sticky top-0 z-10 bg-inherit py-2 pr-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call, index) => (
                <tr
                  key={call.id}
                  className={`${
                    index < calls.length - 1
                      ? isDark
                        ? "border-b border-slate-800"
                        : "border-b border-slate-100"
                      : ""
                  } hover:bg-opacity-50 ${
                    isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
                  } transition-colors`}
                >
                  <td className="py-3 pr-4">{formatDate(call.occurredAt)}</td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => handleViewUser(call.owner.id)}
                      className="flex items-center gap-1 text-left hover:underline cursor-pointer"
                    >
                      {call.owner.firstName || call.owner.lastName
                        ? `${call.owner.firstName || ""} ${call.owner.lastName || ""}`.trim()
                        : call.owner.email}
                      <Eye className="h-3 w-3" />
                    </button>
                  </td>
                  <td className="py-3 pr-4">
                    {call.firstName || call.lastName
                      ? `${call.firstName || ""} ${call.lastName || ""}`.trim()
                      : "N/A"}
                  </td>
                  <td className="py-3 pr-4">{call.toNumber}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={mapApiStatusToUI(call.status)} />
                  </td>
                  <td className="py-3 pr-4 text-xs">{call.type}</td>
                  <td className="py-3 pr-4 text-xs max-w-xs truncate">
                    {call.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Page {pagination.page} sur {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`rounded-lg px-3 py-1.5 text-xs transition ${
                pagination.page === 1
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer " + (isDark
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200")
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`rounded-lg px-3 py-1.5 text-xs transition ${
                pagination.page === pagination.totalPages
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer " + (isDark
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200")
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

