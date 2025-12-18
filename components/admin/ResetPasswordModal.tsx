"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { adminApi } from "../../lib/api";
import { useToast } from "../ui/ToastProvider";
import { useTheme } from "../layout/AppShell";
import type { AdminUser, ResetPasswordRequest } from "../../types/api";

type Props = {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
};

export function ResetPasswordModal({ user, onClose, onSuccess }: Props) {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ResetPasswordRequest>({
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.newPassword) {
      showToast({
        variant: "error",
        message: "Le nouveau mot de passe est requis",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      showToast({
        variant: "error",
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
      return;
    }

    if (formData.newPassword !== confirmPassword) {
      showToast({
        variant: "error",
        message: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    try {
      setLoading(true);
      await adminApi.resetPassword(user.id, formData);
      onSuccess();
    } catch (error: any) {
      showToast({
        variant: "error",
        message: error.message || "Erreur lors de la réinitialisation",
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
          <h2 className="text-xl font-semibold">Réinitialiser le mot de passe</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            style={{ cursor: "pointer" }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-500">
          Réinitialiser le mot de passe pour <strong>{user.email}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nouveau mot de passe *</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.newPassword}
              onChange={(e) => setFormData({ newPassword: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-100"
                  : "border-slate-200 bg-slate-50 text-slate-900"
              }`}
            />
            <p className="mt-1 text-xs text-slate-500">Minimum 6 caractères</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Confirmer le mot de passe *</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-100"
                  : "border-slate-200 bg-slate-50 text-slate-900"
              }`}
            />
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
              {loading ? "Réinitialisation..." : "Réinitialiser"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

