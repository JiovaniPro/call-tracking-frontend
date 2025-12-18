"use client";

import { useState, useEffect, useMemo } from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { adminApi } from "../../../lib/api";
import { useRequireAdmin } from "../../../lib/auth";
import { useToast } from "../../../components/ui/ToastProvider";
import { AdminCallsTable } from "../../../components/admin/AdminCallsTable";
import type { AdminCallsResponse, AdminCallsFilter, AdminUser } from "../../../types/api";
import { Search, X, PhoneCall } from "lucide-react";
import { useTheme } from "../../../components/layout/AppShell";

function AdminCallsPageContent() {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [data, setData] = useState<AdminCallsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filters, setFilters] = useState<AdminCallsFilter>({
    page: 1,
    limit: 50,
  });
  const [search, setSearch] = useState("");

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
    const loadCalls = async () => {
      try {
        setIsLoading(true);
        const response = await adminApi.getCalls({
          ...filters,
          search: search || undefined,
        });
        setData(response);
      } catch (error: any) {
        showToast({
          variant: "error",
          message: error.message || "Erreur lors du chargement des appels",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCalls();
  }, [filters, search, showToast]);

  const activeFilters = useMemo(() => {
    const filters: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (search) {
      filters.push({
        key: "search",
        label: `Recherche: ${search}`,
        onRemove: () => setSearch(""),
      });
    }
    return filters;
  }, [search]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journal des appels</h1>
          <p className="text-sm text-slate-500">
            Vue globale de tous les appels (tous utilisateurs confondus)
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
            placeholder="Rechercher par nom, prénom, téléphone, notes..."
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
          value={filters.userId || ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              userId: e.target.value || undefined,
              page: 1,
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
                className="hover:opacity-70"
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
      ) : !data || data.calls.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl py-12 ${
            isDark ? "bg-slate-800/50" : "bg-slate-50"
          }`}
        >
          <PhoneCall className="mb-4 h-12 w-12 text-slate-400" />
          <p className="text-slate-500">Aucun appel trouvé</p>
        </div>
      ) : (
        <AdminCallsTable
          calls={data.calls}
          pagination={data.pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export function AdminCallsPage() {
  useRequireAdmin();
  return (
    <AppShell>
      <AdminCallsPageContent />
    </AppShell>
  );
}

