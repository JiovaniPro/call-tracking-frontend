"use client";

import React, { useMemo, useState } from "react";
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

type FormState = {
  name: string;
  email: string;
  language: string;
  timezone: string;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY";
  timeFormat: "24h" | "12h";
  workHours: string;
  defaultReminderSlot: string;
  defaultStatus: string;
  confirmBeforeDelete: boolean;
  enableReminders: boolean;
  preReminder: string;
  urgentHighlight: boolean;
  remindersOrder: "time" | "priority";
  enableNotifications: boolean;
  notifReminder: boolean;
  notifCalls: boolean;
  notifFraud: boolean;
  notifFrequency: "realtime" | "digest";
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
        style={{ cursor: "pointer" }}
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
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "John Doe",
    email: "john.doe@calltracking.com",
    language: "fr",
    timezone: "Europe/Paris",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    workHours: "08:00 - 19:00",
    defaultReminderSlot: "Jour même - 16:00",
    defaultStatus: "intéressé",
    confirmBeforeDelete: true,
    enableReminders: true,
    preReminder: "15 min",
    urgentHighlight: true,
    remindersOrder: "time",
    enableNotifications: true,
    notifReminder: true,
    notifCalls: true,
    notifFraud: true,
    notifFrequency: "realtime",
  });

  const handleSave = () => {
    const now = new Date();
    const formatted = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setSavedAt(`Enregistré à ${formatted} (mock)`);
  };

  const infoBarClasses = useMemo(
    () =>
      `sticky bottom-0 -mx-8 mt-4 flex items-center justify-between gap-4 border-t px-8 py-4 backdrop-blur-lg ${
        isDark
          ? "border-slate-800 bg-[#0f172a]/70 text-slate-100"
          : "border-slate-100 bg-white/70 text-slate-800"
      }`,
    [isDark]
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-200 dark:ring-white/10">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Paramétrage
        </div>
        <h1 className="text-xl font-semibold">Paramètres</h1>
        <p className={`max-w-2xl text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Personnalisez l’expérience CRM, pilotez vos rappels et maîtrisez vos
          notifications. Toutes les options sont mockées et prêtes pour une
          future connexion backend.
        </p>
      </div>

      <SettingsSection
        title="Paramètres généraux"
        description="Identité du compte, langue et formats par défaut."
      >
        <SettingsCard title="Profil & préférences" description="Ces valeurs seront synchronisées avec votre compte utilisateur.">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Nom de l’utilisateur
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
              onChange={(v) =>
                setForm((f) => ({ ...f, dateFormat: v as FormState["dateFormat"] }))
              }
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
              onChange={(v) =>
                setForm((f) => ({ ...f, timeFormat: v as FormState["timeFormat"] }))
              }
              options={[
                { label: "24h", value: "24h" },
                { label: "12h (AM/PM)", value: "12h" },
              ]}
            />
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection
        title="Paramètres des appels"
        description="Cadrez vos horaires et comportements par défaut."
      >
        <SettingsCard
          title="Règles d’appel"
          description="S’appliquera aux nouveaux appels et aux imports (simulation)."
        >
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Heures de travail
            </label>
            <input
              value={form.workHours}
              onChange={(e) => setForm((f) => ({ ...f, workHours: e.target.value }))}
              className={`w-full rounded-xl border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#7264ff] ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-50 placeholder:text-slate-400"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-500"
              }`}
              placeholder="08:00 - 19:00"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Créneau de rappel par défaut
            </label>
            <Select
              value={form.defaultReminderSlot}
              onChange={(v) => setForm((f) => ({ ...f, defaultReminderSlot: v }))}
              options={[
                { label: "Jour même - 16:00", value: "Jour même - 16:00" },
                { label: "Jour suivant - 10:00", value: "Jour suivant - 10:00" },
                { label: "Dans 48h", value: "Dans 48h" },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Statut par défaut après appel
            </label>
            <Select
              value={form.defaultStatus}
              onChange={(v) => setForm((f) => ({ ...f, defaultStatus: v }))}
              options={[
                { label: "Intéressé", value: "intéressé" },
                { label: "Répondeur", value: "répondeur" },
                { label: "Pas intéressé", value: "pas intéressé" },
              ]}
            />
          </div>

          <Toggle
            checked={form.confirmBeforeDelete}
            onChange={(v) => setForm((f) => ({ ...f, confirmBeforeDelete: v }))}
            label="Confirmation avant suppression"
            description="Affiche une modale avant de supprimer un appel ou un rappel."
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection
        title="Paramètres des rappels"
        description="Contrôlez la façon dont les rappels sont affichés et notifiés."
      >
        <SettingsCard title="Rappels" description="Optimisez l’exécution quotidienne." cols={2}>
          <Toggle
            checked={form.enableReminders}
            onChange={(v) => setForm((f) => ({ ...f, enableReminders: v }))}
            label="Activer les rappels"
            description="Affiche les rappels dans les vues Today / Rappels."
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Notification avant rappel
            </label>
            <Select
              value={form.preReminder}
              onChange={(v) => setForm((f) => ({ ...f, preReminder: v }))}
              options={[
                { label: "15 minutes", value: "15 min" },
                { label: "30 minutes", value: "30 min" },
                { label: "1 heure", value: "1h" },
              ]}
            />
          </div>

          <Toggle
            checked={form.urgentHighlight}
            onChange={(v) => setForm((f) => ({ ...f, urgentHighlight: v }))}
            label="Priorité visuelle des urgents"
            description="Les rappels dans les 30 prochaines minutes sont mis en avant."
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Ordre d’affichage
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { value: "time", label: "Chronologique", hint: "Du plus proche au plus lointain" },
                { value: "priority", label: "Par priorité", hint: "Urgents, puis chronologique" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer flex-col gap-1 rounded-xl border px-3 py-2 text-sm transition ${
                    form.remindersOrder === opt.value
                      ? isDark
                        ? "border-indigo-400/60 bg-indigo-950/30 text-indigo-50 shadow-sm"
                        : "border-[#7264ff] bg-[#f2ebff] text-[#362770] shadow-sm"
                      : isDark
                      ? "border-slate-800 bg-slate-900 text-slate-100 hover:border-indigo-400/40 hover:bg-slate-800/80"
                      : "border-slate-200 bg-slate-50 text-slate-900 hover:border-[#7264ff]/60 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="remindersOrder"
                    value={opt.value}
                    checked={form.remindersOrder === opt.value}
                    onChange={() =>
                      setForm((f) => ({ ...f, remindersOrder: opt.value as FormState["remindersOrder"] }))
                    }
                    className="hidden"
                  />
                  <span className="font-semibold">{opt.label}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{opt.hint}</span>
                </label>
              ))}
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection
        title="Paramètres des notifications"
        description="Gérez la volumétrie des alertes pour éviter le bruit."
      >
        <SettingsCard
          title="Notifications"
          description="Simulation d’options pour une future intégration backend."
          cols={2}
        >
          <Toggle
            checked={form.enableNotifications}
            onChange={(v) => setForm((f) => ({ ...f, enableNotifications: v }))}
            label="Activer les notifications"
            description="Active l’icône cloche et les alertes contextuelles."
          />

          <Toggle
            checked={form.notifReminder}
            onChange={(v) => setForm((f) => ({ ...f, notifReminder: v }))}
            label="Rappels du jour"
            description="Notifications push quand un rappel arrive."
          />

          <Toggle
            checked={form.notifCalls}
            onChange={(v) => setForm((f) => ({ ...f, notifCalls: v }))}
            label="Appels effectués"
            description="Confirme l’appel et pousse le résumé dans la cloche."
          />

          <Toggle
            checked={form.notifFraud}
            onChange={(v) => setForm((f) => ({ ...f, notifFraud: v }))}
            label="Faux numéros"
            description="Alerte discrète en cas de numéro invalide."
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-200">
              Fréquence
            </label>
            <Select
              value={form.notifFrequency}
              onChange={(v) =>
                setForm((f) => ({ ...f, notifFrequency: v as FormState["notifFrequency"] }))
              }
              icon={<Bell className="h-4 w-4" />}
              options={[
                { label: "Temps réel", value: "realtime" },
                { label: "Résumé (digest)", value: "digest" },
              ]}
            />
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection
        title="Sécurité & compte"
        description="Actions sensibles, mockées pour la démo."
      >
        <SettingsCard title="Sécurité" description="Modales à brancher sur le backend." cols={1}>
          <div className="grid gap-3 md:grid-cols-3">
            <button
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-[#0f1a2f] dark:text-slate-100"
              style={{ cursor: "pointer" }}
            >
              <Lock className="h-4 w-4" />
              Modifier le mot de passe
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-amber-700/40 dark:bg-amber-900/30 dark:text-amber-100"
              style={{ cursor: "pointer" }}
            >
              <ShieldAlert className="h-4 w-4" />
              Déconnexion
            </button>
            <button
              disabled
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-500 opacity-60 shadow-sm dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
            >
              <LogOut className="h-4 w-4" />
              Supprimer le compte
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Toutes ces actions sont désactivées (mock). Connectez le backend Auth / Users pour
            les rendre effectives.
          </p>
        </SettingsCard>
      </SettingsSection>

      <div className={infoBarClasses}>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold">Enregistrer</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vos préférences sont stockées côté client (simulation). Prêt pour une API.
          </p>
          {savedAt && (
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-100 dark:ring-emerald-800/60">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {savedAt}
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#dd7fff] via-[#7264ff] to-[#54d4ef] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200/60 transition hover:-translate-y-0.5 hover:shadow-xl dark:shadow-indigo-900/60"
          style={{ cursor: "pointer" }}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsContent />
    </AppShell>
  );
}


