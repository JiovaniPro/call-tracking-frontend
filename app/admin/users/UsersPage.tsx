"use client";

import { useState, useEffect, useMemo } from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { adminApi } from "../../../lib/api";
import { useRequireAdmin } from "../../../lib/auth";
import { useToast } from "../../../components/ui/ToastProvider";
import type { AdminUser } from "../../../types/api";
import { Plus, Edit, Key, Power, Search, X } from "lucide-react";
import { useTheme } from "../../../components/layout/AppShell";

// Modals
import { CreateUserModal } from "../../../components/admin/CreateUserModal";
import { EditUserModal } from "../../../components/admin/EditUserModal";
import { ResetPasswordModal } from "../../../components/admin/ResetPasswordModal";

function UsersPageContent() {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ADMIN" | "USER" | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("all");
  
  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (roleFilter !== "all") filters.role = roleFilter;
      if (statusFilter === "active") filters.isActive = true;
      else if (statusFilter === "inactive") filters.isActive = false;
      
      const data = await adminApi.getUsers(filters);
      setUsers(data);
    } catch (error: any) {
      showToast({
        variant: "error",
        message: error.message || "Erreur lors du chargement des utilisateurs",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const searchLower = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(searchLower) ||
        u.firstName?.toLowerCase().includes(searchLower) ||
        u.lastName?.toLowerCase().includes(searchLower)
    );
  }, [users, search]);

  const handleCreate = async () => {
    await loadUsers();
    setCreateModalOpen(false);
    showToast({
      variant: "success",
      message: "Utilisateur créé avec succès",
    });
  };

  const handleUpdate = async () => {
    await loadUsers();
    setEditUser(null);
    showToast({
      variant: "success",
      message: "Utilisateur modifié avec succès",
    });
  };

  const handleResetPassword = async () => {
    await loadUsers();
    setResetPasswordUser(null);
    showToast({
      variant: "success",
      message: "Mot de passe réinitialisé avec succès",
    });
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      await adminApi.toggleActive(user.id);
      await loadUsers();
      showToast({
        variant: "success",
        message: `Utilisateur ${user.isActive ? "désactivé" : "activé"} avec succès`,
      });
    } catch (error: any) {
      showToast({
        variant: "error",
        message: error.message || "Erreur lors de la modification",
      });
    }
  };

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = search || roleFilter !== "all" || statusFilter !== "all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Gestion des utilisateurs
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Créer, modifier et gérer les comptes utilisateurs
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#dd7fff] to-[#7264ff] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
          style={{ cursor: "pointer" }}
        >
          <Plus className="h-4 w-4" />
          Créer un utilisateur
        </button>
      </div>

      {/* Filters */}
      <div
        className={`flex flex-wrap items-center gap-4 rounded-2xl p-4 shadow-sm ${
          isDark ? "bg-[#0f1a2f] border border-slate-800" : "bg-white border border-slate-200"
        }`}
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par email, nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-lg border px-10 py-2 text-sm ${
              isDark
                ? "border-slate-700 bg-slate-800 text-slate-100"
                : "border-slate-200 bg-slate-50 text-slate-900"
            }`}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className={`rounded-lg border px-4 py-2 text-sm ${
            isDark
              ? "border-slate-700 bg-slate-800 text-slate-100"
              : "border-slate-200 bg-white text-slate-900"
          }`}
          style={{ cursor: "pointer" }}
        >
          <option value="all">Tous les rôles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className={`rounded-lg border px-4 py-2 text-sm ${
            isDark
              ? "border-slate-700 bg-slate-800 text-slate-100"
              : "border-slate-200 bg-white text-slate-900"
          }`}
          style={{ cursor: "pointer" }}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Désactivé</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              isDark
                ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            style={{ cursor: "pointer" }}
          >
            <X className="h-4 w-4" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Active filters chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <span
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
                isDark
                  ? "bg-slate-800 border border-slate-700 text-slate-300"
                  : "bg-slate-100 border border-slate-200 text-slate-700"
              }`}
            >
              Recherche: {search}
              <button
                onClick={() => setSearch("")}
                className={`transition ${
                  isDark ? "hover:text-slate-100" : "hover:text-slate-900"
                }`}
                style={{ cursor: "pointer" }}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {roleFilter !== "all" && (
            <span
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
                isDark
                  ? "bg-slate-800 border border-slate-700 text-slate-300"
                  : "bg-slate-100 border border-slate-200 text-slate-700"
              }`}
            >
              Rôle: {roleFilter}
              <button
                onClick={() => setRoleFilter("all")}
                className={`transition ${
                  isDark ? "hover:text-slate-100" : "hover:text-slate-900"
                }`}
                style={{ cursor: "pointer" }}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {statusFilter !== "all" && (
            <span
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
                isDark
                  ? "bg-slate-800 border border-slate-700 text-slate-300"
                  : "bg-slate-100 border border-slate-200 text-slate-700"
              }`}
            >
              Statut: {statusFilter === "active" ? "Actif" : "Désactivé"}
              <button
                onClick={() => setStatusFilter("all")}
                className={`transition ${
                  isDark ? "hover:text-slate-100" : "hover:text-slate-900"
                }`}
                style={{ cursor: "pointer" }}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div
        className={`rounded-2xl shadow-sm border ${
          isDark ? "bg-[#0f1a2f] border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        {isLoading ? (
          <div className={`p-8 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Chargement...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={`p-8 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Aucun utilisateur trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Nom & Prénom
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Email
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Rôle
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Statut
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Date de création
                  </th>
                  <th
                    className={`px-6 py-3 text-right text-xs font-medium uppercase ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b transition ${
                      isDark
                        ? "border-slate-700 hover:bg-slate-800/50"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                    style={{ cursor: "default" }}
                  >
                    <td className={`px-6 py-4 text-sm ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                      {user.firstName || user.lastName
                        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                        : "-"}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? isDark
                              ? "bg-purple-900/30 text-purple-300"
                              : "bg-purple-500 text-white"
                            : isDark
                            ? "bg-blue-900/30 text-blue-300"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.isActive
                            ? isDark
                              ? "bg-emerald-900/30 text-emerald-300"
                              : "bg-emerald-500 text-white"
                            : isDark
                            ? "bg-red-900/30 text-red-300"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {user.isActive ? "Actif" : "Désactivé"}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditUser(user)}
                          className={`rounded-lg p-2 transition ${
                            isDark
                              ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                          style={{ cursor: "pointer" }}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setResetPasswordUser(user)}
                          className={`rounded-lg p-2 transition ${
                            isDark
                              ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                          style={{ cursor: "pointer" }}
                          title="Réinitialiser le mot de passe"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`rounded-lg p-2 transition ${
                            user.isActive
                              ? isDark
                                ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                                : "text-red-600 hover:bg-red-50 hover:text-red-700"
                              : isDark
                              ? "text-emerald-400 hover:bg-emerald-900/20 hover:text-emerald-300"
                              : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                          style={{ cursor: "pointer" }}
                          title={user.isActive ? "Désactiver" : "Activer"}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {createModalOpen && (
        <CreateUserModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreate}
        />
      )}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={handleUpdate}
        />
      )}
      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
          onSuccess={handleResetPassword}
        />
      )}
    </div>
  );
}

export default function UsersPage() {
  useRequireAdmin();

  return (
    <AppShell>
      <UsersPageContent />
    </AppShell>
  );
}

