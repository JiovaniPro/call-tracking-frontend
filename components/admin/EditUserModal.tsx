"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { adminApi } from "../../lib/api";
import { useToast } from "../ui/ToastProvider";
import { useTheme } from "../layout/AppShell";
import type { AdminUser, UpdateUserRequest } from "../../types/api";

type Props = {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
};

export function EditUserModal({ user, onClose, onSuccess }: Props) {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateUserRequest>({
    email: user.email,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    role: user.role,
    isActive: user.isActive,
  });

  useEffect(() => {
    setFormData({
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
      isActive: user.isActive,
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await adminApi.updateUser(user.id, formData);
      onSuccess();
    } catch (error: any) {
      showToast({
        variant: "error",
        message: error.message || "Erreur lors de la modification",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`w-full max-w-md rounded-2xl p-6 shadow-xl ${
          isDark ? "bg-[#0f1a2f] text-slate-100" : "bg-white text-slate-900"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Modifier l'utilisateur</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            style={{ cursor: "pointer" }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-100"
                  : "border-slate-200 bg-slate-50 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Prénom</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-100"
                  : "border-slate-200 bg-slate-50 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Nom</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-100"
                  : "border-slate-200 bg-slate-50 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Rôle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as "ADMIN" | "USER" })}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-100"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
              style={{ cursor: "pointer" }}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="isActive" className="text-sm font-medium" style={{ cursor: "pointer" }}>
              Compte actif
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
                isDark
                  ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              style={{ cursor: "pointer" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-gradient-to-r from-[#dd7fff] to-[#7264ff] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
              style={{ cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Modification..." : "Modifier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

