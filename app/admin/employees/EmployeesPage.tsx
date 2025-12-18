"use client";

import { useState, useEffect, useMemo } from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { adminApi } from "../../../lib/api";
import { useRequireAdmin } from "../../../lib/auth";
import { useToast } from "../../../components/ui/ToastProvider";
import { EmployeesTable } from "../../../components/admin/EmployeesTable";
import type { AdminUserWithStats } from "../../../types/api";
import { Search, X, Users as UsersIcon } from "lucide-react";
import { useTheme } from "../../../components/layout/AppShell";
import { useRouter } from "next/navigation";

function EmployeesPageContent() {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ADMIN" | "USER" | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("all");

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getUsersStats();
      setUsers(response.users);
    } catch (error: any) {
      showToast({
        variant: "error",
        message: error.message || "Erreur lors du chargement des employés",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((u) => u.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((u) => !u.isActive);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchLower) ||
          u.firstName?.toLowerCase().includes(searchLower) ||
          u.lastName?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [users, roleFilter, statusFilter, search]);

  const activeFilters = useMemo(() => {
    const filters: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (roleFilter !== "all") {
      filters.push({
        key: "role",
        label: `Rôle: ${roleFilter === "ADMIN" ? "Admin" : "Utilisateur"}`,
        onRemove: () => setRoleFilter("all"),
      });
    }
    if (statusFilter !== "all") {
      filters.push({
        key: "status",
        label: `Statut: ${statusFilter === "active" ? "Actif" : "Inactif"}`,
        onRemove: () => setStatusFilter("all"),
      });
    }
    if (search) {
      filters.push({
        key: "search",
        label: `Recherche: ${search}`,
        onRemove: () => setSearch(""),
      });
    }
    return filters;
  }, [roleFilter, statusFilter, search]);

  const handleViewEmployee = (user: AdminUserWithStats) => {
    router.push(`/admin/employees/${user.id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employés</h1>
          <p className="text-sm text-slate-500">
            Vue d&apos;ensemble de l&apos;activité de chaque employé
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          />
          <input
            type="text"
            placeholder="Rechercher par email, nom, prénom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-xl border py-2 pl-10 pr-4 text-sm ${
              isDark
                ? "border-slate-700 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className={`rounded-xl border px-4 py-2 text-sm ${
            isDark
              ? "border-slate-700 bg-slate-800/50 text-slate-100"
              : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          <option value="all">Tous les rôles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">Utilisateur</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className={`rounded-xl border px-4 py-2 text-sm ${
            isDark
              ? "border-slate-700 bg-slate-800/50 text-slate-100"
              : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
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
      ) : filteredUsers.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl py-12 ${
            isDark ? "bg-slate-800/50" : "bg-slate-50"
          }`}
        >
          <UsersIcon className="mb-4 h-12 w-12 text-slate-400" />
          <p className="text-slate-500">Aucun employé trouvé</p>
        </div>
      ) : (
        <EmployeesTable
          users={filteredUsers}
          onView={handleViewEmployee}
        />
      )}
    </div>
  );
}

export function EmployeesPage() {
  useRequireAdmin();
  return (
    <AppShell>
      <EmployeesPageContent />
    </AppShell>
  );
}

