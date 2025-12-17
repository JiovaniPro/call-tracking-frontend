"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { AppShell, useTheme } from "../../components/layout/AppShell";
import { SettingsSection } from "../../components/settings/SettingsSection";
import { SettingsCard } from "../../components/settings/SettingsCard";
import {
  Bell,
  CheckCircle2,
  Globe,
  Languages,
  Lock,
  LogOut,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { useSettings } from "../../lib/hooks";
import { settingsApi, authApi } from "../../lib/api";
import { useAuth, useRequireAuth } from "../../lib/auth";
import type { UserSettings, UpdateSettingsRequest } from "../../types/api";

type FormState = {
  name: string;
  email: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  notificationsEnabled: boolean;
  reminderLeadMinutes: number;
};

const switchBase =
  "relative inline-flex h-6 w-11 items-center rounded-full transition";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`${switchBase} ${
          checked ? "bg-gradient-to-r from-[#dd7fff] via-[#7264ff] to-[#54d4ef]" : "bg-slate-200"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  icon?: React.ReactNode;
}) {
  const { isDark } = useTheme();
  const wrapperClasses = `flex items-center gap-2 rounded-xl border px-3 py-2 text-sm shadow-sm ring-1 ring-transparent transition focus-within:ring-2 focus-within:ring-[#7264ff] ${
    isDark
      ? "border-slate-700 bg-slate-900 text-slate-50"
      : "border-slate-200 bg-white text-slate-900"
  }`;

  return (
    <div className={wrapperClasses}>
      {icon && (
        <span className={isDark ? "text-slate-400" : "text-slate-400"}>{icon}</span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent text-sm outline-none ${
          isDark ? "text-slate-50" : "text-slate-900"
        }`}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className={isDark ? "bg-slate-900 text-slate-50" : "bg-white text-slate-900"}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SettingsContent() {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  const { data: settings, isLoading, error, refetch } = useSettings();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    language: "fr",
    timezone: "Europe/Paris",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    notificationsEnabled: true,
    reminderLeadMinutes: 15,
  });

  // Sync form with loaded settings
  useEffect(() => {
    if (settings && user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        language: settings.language || "fr",
        timezone: settings.timezone || "Europe/Paris",
        dateFormat: settings.dateFormat || "DD/MM/YYYY",
        timeFormat: settings.timeFormat || "24h",
        notificationsEnabled: settings.notificationsEnabled ?? true,
        reminderLeadMinutes: settings.reminderLeadMinutes || 15,
      });
    }
  }, [settings, user]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const updateData: UpdateSettingsRequest = {
        language: form.language,
        timezone: form.timezone,
        dateFormat: form.dateFormat,
        timeFormat: form.timeFormat,
        notificationsEnabled: form.notificationsEnabled,
        reminderLeadMinutes: form.reminderLeadMinutes,
      };

      await settingsApi.update(updateData);

      const now = new Date();
      const formatted = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setSavedAt(`Enregistré à ${formatted}`);
      refetch();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
      );
    } finally {
      setIsSaving(false);
    }
  }, [form, refetch]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const infoBarClasses = useMemo(
    () =>
      `sticky bottom-0 -mx-8 mt-4 flex items-center justify-between gap-4 border-t px-8 py-4 backdrop-blur-lg ${
        isDark
          ? "border-slate-800 bg-[#0f172a]/70 text-slate-100"
          : "border-slate-100 bg-white/70 text-slate-800"
      }`,
    [isDark]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#7264ff]" />
          <p className="text-sm text-slate-500">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-center">
          <p className="text-sm font-medium text-red-700">Erreur de chargement</p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-full bg-red-100 px-4 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Paramétrage
        </div>
        <h1 className="text-xl font-semibold">Paramètres</h1>
        <p className={`max-w-2xl text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Personnalisez l'expérience CRM, pilotez vos rappels et maîtrisez vos
          notifications.
        </p>
      </div>

      <SettingsSection
        title="Paramètres généraux"
        description="Identité du compte, langue et formats par défaut."
      >
        <SettingsCard title="Profil & préférences" description="Ces valeurs seront synchronisées avec votre compte utilisateur.">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Nom de l'utilisateur
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={`w-full rounded-xl border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#7264ff] ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-50 placeholder:text-slate-400"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-500"
              }`}
              placeholder="Prénom Nom"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Email
            </label>
            <input
              value={form.email}
              readOnly
              className={`w-full cursor-not-allowed rounded-xl border px-3 py-2 text-sm opacity-80 transition focus:outline-none ${
                isDark
                  ? "border-slate-700 bg-slate-900/60 text-slate-400 placeholder:text-slate-500"
                  : "border-slate-200 bg-slate-100 text-slate-500 placeholder:text-slate-400"
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Langue
            </label>
            <Select
              value={form.language}
              onChange={(v) => setForm((f) => ({ ...f, language: v }))}
              icon={<Languages className="h-4 w-4" />}
              options={[
                { label: "Français", value: "fr" },
                { label: "Anglais", value: "en" },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Fuseau horaire
            </label>
            <Select
              value={form.timezone}
              onChange={(v) => setForm((f) => ({ ...f, timezone: v }))}
              icon={<Globe className="h-4 w-4" />}
              options={[
                { label: "Europe/Paris (UTC+1)", value: "Europe/Paris" },
                { label: "Europe/London (UTC)", value: "Europe/London" },
                { label: "America/New_York (UTC-5)", value: "America/New_York" },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Format date
            </label>
            <Select
              value={form.dateFormat}
              onChange={(v) => setForm((f) => ({ ...f, dateFormat: v }))}
              options={[
                { label: "Jour / Mois / Année (DD/MM/YYYY)", value: "DD/MM/YYYY" },
                { label: "Mois / Jour / Année (MM/DD/YYYY)", value: "MM/DD/YYYY" },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Format heure
            </label>
            <Select
              value={form.timeFormat}
              onChange={(v) => setForm((f) => ({ ...f, timeFormat: v }))}
              options={[
                { label: "24h", value: "24h" },
                { label: "12h (AM/PM)", value: "12h" },
              ]}
            />
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection
        title="Paramètres des notifications"
        description="Gérez la volumétrie des alertes."
      >
        <SettingsCard
          title="Notifications"
          description="Configurez vos préférences de notification."
          cols={2}
        >
          <Toggle
            checked={form.notificationsEnabled}
            onChange={(v) => setForm((f) => ({ ...f, notificationsEnabled: v }))}
            label="Activer les notifications"
            description="Active l'icône cloche et les alertes contextuelles."
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Notification avant rappel
            </label>
            <Select
              value={form.reminderLeadMinutes.toString()}
              onChange={(v) => setForm((f) => ({ ...f, reminderLeadMinutes: parseInt(v) }))}
              icon={<Bell className="h-4 w-4" />}
              options={[
                { label: "5 minutes", value: "5" },
                { label: "15 minutes", value: "15" },
                { label: "30 minutes", value: "30" },
                { label: "1 heure", value: "60" },
              ]}
            />
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection
        title="Sécurité & compte"
        description="Actions sensibles."
      >
        <SettingsCard title="Sécurité" description="Gérez votre session." cols={1}>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-amber-700/40 dark:bg-amber-900/30 dark:text-amber-100"
            >
              <ShieldAlert className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </SettingsCard>
      </SettingsSection>

      <div className={infoBarClasses}>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold">Enregistrer</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vos préférences seront synchronisées avec le serveur.
          </p>
          {savedAt && (
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-100 dark:ring-emerald-800/60">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {savedAt}
            </div>
          )}
          {saveError && (
            <div className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-red-100">
              {saveError}
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#dd7fff] via-[#7264ff] to-[#54d4ef] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200/60 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 dark:shadow-indigo-900/60"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border border-white/30 border-t-white" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer"
          )}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[#7264ff]" />
      </div>
    );
  }

  return (
    <AppShell>
      <SettingsContent />
    </AppShell>
  );
}
