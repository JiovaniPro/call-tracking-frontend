"use client";

import { useState, useEffect, useMemo } from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { adminApi } from "../../../lib/api";
import { useRequireAdmin } from "../../../lib/auth";
import { useToast } from "../../../components/ui/ToastProvider";
import { AdminRemindersTable } from "../../../components/admin/AdminRemindersTable";
import type { AdminRemindersResponse, AdminRemindersFilter, AdminUser } from "../../../types/api";
import { CalendarClock, X } from "lucide-react";
import { useTheme } from "../../../components/layout/AppShell";
import { StatCard } from "../../../components/dashboard/StatCard";

function AdminRemindersPageContent() {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [data, setData] = useState<AdminRemindersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filters, setFilters] = useState<AdminRemindersFilter>({});

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await adminApi.getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    const loadReminders = async () => {
      try {
        setIsLoading(true);
        const response = await adminApi.getReminders(filters);
        setData(response);
      } catch (error: any) {
        showToast({
          variant: "error",
          message: error.message || "Erreur lors du chargement des rappels",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadReminders();
  }, [filters, showToast]);

  const activeFilters = useMemo(() => {
    const active: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (filters.userId) {
      const user = users.find((u) => u.id === filters.userId);
      active.push({
        key: "userId",
        label: `Utilisateur: ${user?.email || filters.userId}`,
        onRemove: () => setFilters((prev) => ({ ...prev, userId: undefined })),
      });
    }
    if (filters.status) {
      active.push({
        key: "status",
        label: `Statut: ${filters.status}`,
        onRemove: () => setFilters((prev) => ({ ...prev, status: undefined })),
      });
    }
    if (filters.date) {
      active.push({
        key: "date",
        label: `Date: ${filters.date}`,
        onRemove: () => setFilters((prev) => ({ ...prev, date: undefined })),
      });
    }
    if (filters.overdue) {
      active.push({
        key: "overdue",
        label: "En retard uniquement",
        onRemove: () => setFilters((prev) => ({ ...prev, overdue: undefined })),
      });
    }
    return active;
  }, [filters, users]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supervision des rappels</h1>
          <p className="text-sm text-slate-500">
            Vue globale de tous les rappels (tous utilisateurs confondus)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {data && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total rappels"
            value={data.stats.total.toString()}
            helper="Tous les rappels"
          />
          <StatCard
            label="En attente"
            value={data.stats.pending.toString()}
            helper="Rappels non terminés"
          />
          <StatCard
            label="En retard"
            value={data.stats.overdue.toString()}
            helper="Rappels en retard"
          />
          <StatCard
            label="Aujourd'hui"
            value={data.stats.today.toString()}
            helper="Rappels du jour"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filters.userId || ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              userId: e.target.value || undefined,
            }))
          }
          className={`rounded-xl border px-4 py-2 text-sm ${
            isDark
              ? "border-slate-700 bg-slate-800/50 text-slate-100"
              : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          <option value="">Tous les utilisateurs</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName || user.lastName
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : user.email}
            </option>
          ))}
        </select>

        <select
          value={filters.status || ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              status: (e.target.value || undefined) as any,
            }))
          }
          className={`rounded-xl border px-4 py-2 text-sm ${
            isDark
              ? "border-slate-700 bg-slate-800/50 text-slate-100"
              : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="DONE">Terminé</option>
          <option value="CANCELED">Annulé</option>
        </select>

        <select
          value={filters.date || ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              date: e.target.value || undefined,
            }))
          }
          className={`rounded-xl border px-4 py-2 text-sm ${
            isDark
              ? "border-slate-700 bg-slate-800/50 text-slate-100"
              : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          <option value="">Toutes les dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.overdue || false}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                overdue: e.target.checked || undefined,
              }))
            }
            className="rounded"
          />
          <span className="text-sm">En retard uniquement</span>
        </label>
      </div>

      {/* Active filters chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
                isDark
                  ? "bg-slate-800 text-slate-300"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {filter.label}
              <button
                onClick={filter.onRemove}
                className="hover:opacity-70 cursor-pointer"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-500">Chargement...</div>
        </div>
      ) : !data || data.reminders.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl py-12 ${
            isDark ? "bg-slate-800/50" : "bg-slate-50"
          }`}
        >
          <CalendarClock className="mb-4 h-12 w-12 text-slate-400" />
          <p className="text-slate-500">Aucun rappel trouvé</p>
        </div>
      ) : (
        <AdminRemindersTable reminders={data.reminders} />
      )}
    </div>
  );
}

export function AdminRemindersPage() {
  useRequireAdmin();
  return (
    <AppShell>
      <AdminRemindersPageContent />
    </AppShell>
  );
}

