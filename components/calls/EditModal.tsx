 "use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTheme } from "../layout/AppShell";
import { StatusBadge, type CallStatus } from "./StatusBadge";
import type { CallRow, CallType } from "./CallsTable";
import { DatePicker } from "./DatePicker";

type EditModalProps = {
  open: boolean;
  call: CallRow | null;
  onClose: () => void;
  onSave: (updated: CallRow) => void;
};

type EditableState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: CallStatus;
  type: CallType;
  nextReminderDate: string;
  nextReminderSlot: string;
  description: string;
};

const ALL_STATUSES: CallStatus[] = [
  "intéressé",
  "pas intéressé",
  "répondeur",
  "hors cible",
  "faux numéro",
];

const TIME_SLOTS = [
  "08:00 – 09:00",
  "09:00 – 10:00",
  "10:00 – 11:00",
  "11:00 – 12:00",
  "12:00 – 13:00",
  "13:00 – 14:00",
  "14:00 – 15:00",
  "15:00 – 16:00",
  "16:00 – 17:00",
  "17:00 – 18:00",
  "18:00 – 19:00",
];

export const EditModal: React.FC<EditModalProps> = ({
  open,
  call,
  onClose,
  onSave,
}) => {
  const { isDark } = useTheme();
  const [form, setForm] = useState<EditableState | null>(null);

  useEffect(() => {
    if (!open || !call) {
      setForm(null);
      return;
    }
    const fullName = call.name;
    const firstName = call.firstName ?? fullName.split(" ")[0] ?? "";
    const lastName = call.lastName ?? fullName.split(" ").slice(1).join(" ");

    // On ne tente pas de parser les anciennes valeurs libres :
    // on initialise la date et le créneau vides pour garder un comportement prévisible.
    setForm({
      firstName,
      lastName,
      phone: call.phone,
      email: call.email ?? "",
      status: call.status,
      type: call.type,
      nextReminderDate: "",
      nextReminderSlot: "",
      description: call.description ?? "",
    });
  }, [open, call]);

  if (!open || !call || !form) return null;

  const gradientPurple = "linear-gradient(135deg, #6a2cff, #8c5bff)";

  const handleChange = <K extends keyof EditableState>(
    key: K,
    value: EditableState[K]
  ) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasReminder =
      form.nextReminderDate.trim().length > 0 ||
      form.nextReminderSlot.trim().length > 0;

    const combinedReminder = hasReminder
      ? [form.nextReminderDate, form.nextReminderSlot].filter(Boolean).join(" • ")
      : null;

    const updated: CallRow = {
      ...call,
      name: [form.firstName, form.lastName].filter(Boolean).join(" ") || call.name,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      email: form.email || undefined,
      status: form.status,
      type: form.type,
      nextReminder: combinedReminder,
      description: form.description || undefined,
    };
    onSave(updated);
  };

  const inputBase =
    "w-full rounded-xl border px-3 py-2 text-xs outline-none transition placeholder:text-slate-400";

  const inputLight =
    "border-slate-200 bg-slate-50/60 text-slate-900 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#7264ff]/60";

  const inputDark =
    "border-slate-700 bg-[#020617]/60 text-slate-100 focus:border-slate-500 focus:ring-2 focus:ring-[#7264ff]/70";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-3xl rounded-3xl p-6 shadow-2xl ${
          isDark
            ? "bg-[#020617] text-slate-50 shadow-slate-900"
            : "bg-white text-slate-900 shadow-slate-200"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Modifier l’appel</h2>
            <p
              className={`mt-1 text-[11px] ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Ajustez les informations principales du contact et du rappel.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-700 ${
              isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
            }`}
            aria-label="Fermer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] space-y-6 overflow-y-auto pr-1 text-xs"
        >
          {/* Bloc identité */}
          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Informations client
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Prénom</label>
                <input
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className={`${inputBase} ${
                    isDark ? inputDark : inputLight
                  }`}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Nom</label>
                <input
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className={`${inputBase} ${
                    isDark ? inputDark : inputLight
                  }`}
                  placeholder="Nom"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">
                  Téléphone
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`${inputBase} ${
                    isDark ? inputDark : inputLight
                  } font-mono`}
                  placeholder="+33 ..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`${inputBase} ${
                    isDark ? inputDark : inputLight
                  }`}
                  placeholder="contact@exemple.fr"
                />
              </div>
            </div>
          </section>

          {/* Bloc appel */}
          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Informations d'appel
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">Statut</label>
                <div className="flex items-center gap-2">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      handleChange("status", e.target.value as CallStatus)
                    }
                    className={`${inputBase} ${
                      isDark ? inputDark : inputLight
                    } max-w-[150px]`}
                  >
                    {ALL_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <StatusBadge status={form.status} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">
                  Type d'appel
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    handleChange("type", e.target.value as CallType)
                  }
                  className={`${inputBase} ${
                    isDark ? inputDark : inputLight
                  }`}
                >
                  <option value="nouveau">Nouveau</option>
                  <option value="rappel">Rappel</option>
                </select>
              </div>
            </div>
          </section>

          {/* Bloc rappel */}
          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Prochain rappel
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">
                  Date de rappel
                </label>
                <DatePicker
                  value={form.nextReminderDate}
                  onChange={(date) => handleChange("nextReminderDate", date)}
                  placeholder="Sélectionner une date"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400">
                  Créneau horaire
                </label>
                <select
                  value={form.nextReminderSlot}
                  onChange={(e) =>
                    handleChange("nextReminderSlot", e.target.value)
                  }
                  className={`${inputBase} ${
                    isDark ? inputDark : inputLight
                  }`}
                >
                  <option value="">Non planifié</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot.replace(":", "h").replace(":", "h")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Bloc notes */}
          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Description / notes
            </h3>
            <textarea
              value={form.description}
              onChange={(e) =>
                handleChange("description", e.target.value)
              }
              rows={4}
              className={`${inputBase} ${
                isDark ? inputDark : inputLight
              } resize-none leading-relaxed`}
              placeholder="Ajoutez un contexte, les objections principales, les prochaines étapes..."
            />
          </section>

          <div className="flex items-center justify-end gap-2 pt-1 text-xs">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-full px-3 py-1.5 font-medium ${
                isDark
                  ? "text-slate-300 hover:bg-white/5"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200/40 transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
              style={{ background: gradientPurple }}
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


