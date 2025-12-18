"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "../../../../components/layout/AppShell";
import { adminApi } from "../../../../lib/api";
import { useRequireAdmin } from "../../../../lib/auth";
import { useToast } from "../../../../components/ui/ToastProvider";
import type { AdminUserDetailResponse } from "../../../../types/api";
import { ArrowLeft, User } from "lucide-react";
import { EmployeeKPICards } from "../../../../components/admin/EmployeeKPICards";
import { EmployeeStatusChart } from "../../../../components/admin/EmployeeStatusChart";
import { EmployeeCallsHistory } from "../../../../components/admin/EmployeeCallsHistory";
import { EmployeeRemindersHistory } from "../../../../components/admin/EmployeeRemindersHistory";

function EmployeeDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [data, setData] = useState<AdminUserDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userId = params.id as string;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await adminApi.getUserStats(userId);
        setData(response);
      } catch (error: any) {
        showToast({
          variant: "error",
          message: error.message || "Erreur lors du chargement des données",
        });
        router.push("/admin/employees");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId, router, showToast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { user, kpi, statusStats, recentCalls, recentReminders } = data;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/employees")}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <div>
          <h1 className="text-2xl font-bold">
            {user.firstName || user.lastName
              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
              : user.email}
          </h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0f1a2f]">
        <h2 className="mb-4 text-lg font-semibold">Informations du compte</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="mt-1 font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Rôle</p>
            <p className="mt-1 font-medium">
              {user.role === "ADMIN" ? "Administrateur" : "Utilisateur"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Statut</p>
            <p className="mt-1 font-medium">
              {user.isActive ? "Actif" : "Inactif"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Date de création</p>
            <p className="mt-1 font-medium">
              {new Date(user.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <EmployeeKPICards kpi={kpi} />

      {/* Status Stats */}
      <EmployeeStatusChart statusStats={statusStats} />

      {/* Recent Calls */}
      <EmployeeCallsHistory calls={recentCalls} />

      {/* Recent Reminders */}
      <EmployeeRemindersHistory reminders={recentReminders} />
    </div>
  );
}

export function EmployeeDetailPage() {
  useRequireAdmin();
  return (
    <AppShell>
      <EmployeeDetailPageContent />
    </AppShell>
  );
}

