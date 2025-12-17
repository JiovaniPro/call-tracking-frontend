 "use client";

import React from "react";
import { Mail, Phone, X } from "lucide-react";
import { useTheme } from "../layout/AppShell";
import { StatusBadge } from "./StatusBadge";
import type { CallRow } from "./CallsTable";

type DetailModalProps = {
  open: boolean;
  call: CallRow | null;
  onClose: () => void;
  onEdit?: () => void;
};

export const DetailModal: React.FC<DetailModalProps> = ({
  open,
  call,
  onClose,
  onEdit,
}) => {
  const { isDark } = useTheme();

  if (!open || !call) return null;

  const gradientPurple = "linear-gradient(135deg, #6a2cff, #8c5bff)";

  const fullName = call.name;
  const firstName = call.firstName ?? fullName.split(" ")[0] ?? "";
  const lastName =
    call.lastName ?? fullName.split(" ").slice(1).join(" ") ?? "";

  const history = call.history ?? [
    {
      id: `${call.id}-h1`,
      date: call.lastCall,
      status: call.status,
      note: "Dernier échange enregistré avec ce contact.",
    },
  ];

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
            <h2 className="text-sm font-semibold">Détails de l’appel</h2>
            <p
              className={`mt-1 text-[11px] ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Vue complète du contact et de l’historique des interactions.
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

        <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1 text-xs">
          {/* Section 1 – Informations client */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className={`text-[11px] font-semibold uppercase tracking-wide ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}>
                Informations client
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className={`text-[11px] font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Prénom
                </p>
                <div className={`rounded-xl px-3 py-2.5 ${
                  isDark 
                    ? "bg-slate-800/50 border border-slate-700" 
                    : "bg-slate-50 border border-slate-200"
                }`}>
                  <p className={`text-sm font-semibold ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}>
                    {firstName || "—"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className={`text-[11px] font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Nom
                </p>
                <div className={`rounded-xl px-3 py-2.5 ${
                  isDark 
                    ? "bg-slate-800/50 border border-slate-700" 
                    : "bg-slate-50 border border-slate-200"
                }`}>
                  <p className={`text-sm font-semibold ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}>
                    {lastName || "—"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className={`text-[11px] font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Téléphone
                </p>
                <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${
                  isDark 
                    ? "bg-slate-800/50 border border-slate-700" 
                    : "bg-slate-50 border border-slate-200"
                }`}>
                  <Phone className={`h-4 w-4 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`} />
                  <span className={`font-mono text-sm font-semibold ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}>
                    {call.phone}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className={`text-[11px] font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Email
                </p>
                <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${
                  isDark 
                    ? "bg-slate-800/50 border border-slate-700" 
                    : "bg-slate-50 border border-slate-200"
                }`}>
                  <Mail className={`h-4 w-4 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`} />
                  <span className={`truncate text-sm font-semibold ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}>
                    {call.email ?? "Non renseigné"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 – Informations d'appel */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className={`text-[11px] font-semibold uppercase tracking-wide ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}>
                Informations d'appel
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <p className={`text-[11px] font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Statut actuel
                </p>
                <div className={`rounded-xl px-3 py-2.5 ${
                  isDark 
                    ? "bg-slate-800/50 border border-slate-700" 
                    : "bg-slate-50 border border-slate-200"
                }`}>
                  <StatusBadge status={call.status} />
                </div>
              </div>
              <div className="space-y-2">
                <p className={`text-[11px] font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Type d'appel
                </p>
                <div className={`rounded-xl px-3 py-2.5 ${
                  isDark 
                    ? "bg-slate-800/50 border border-slate-700" 
                    : "bg-slate-50 border border-slate-200"
                }`}>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      call.type === "nouveau"
                        ? isDark
                          ? "bg-emerald-900/40 text-emerald-300"
                          : "bg-emerald-50 text-emerald-600"
                        : isDark
                        ? "bg-sky-900/40 text-sky-300"
                        : "bg-sky-50 text-sky-600"
                    }`}
                  >
                    {call.type === "nouveau" ? "Nouveau" : "Rappel"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className={`text-[11px] font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Premier appel
                </p>
                <div className={`rounded-xl px-3 py-2.5 ${
                  isDark 
                    ? "bg-slate-800/50 border border-slate-700" 
                    : "bg-slate-50 border border-slate-200"
                }`}>
                  <p className={`text-sm font-semibold ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}>
                    {call.firstCallDate ?? "Non renseigné"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className={`text-[11px] font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Dernier appel
                </p>
                <div className={`rounded-xl px-3 py-2.5 ${
                  isDark 
                    ? "bg-slate-800/50 border border-slate-700" 
                    : "bg-slate-50 border border-slate-200"
                }`}>
                  <p className={`text-sm font-semibold ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}>
                    {call.lastCall}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="space-y-2">
                <p className={`text-[11px] font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Prochaine date de rappel
                </p>
                <div className={`rounded-xl px-3 py-2.5 ${
                  call.nextReminder
                    ? isDark
                      ? "bg-emerald-900/20 border border-emerald-700/50"
                      : "bg-emerald-50 border border-emerald-200"
                    : isDark
                    ? "bg-slate-800/50 border border-slate-700"
                    : "bg-slate-50 border border-slate-200"
                }`}>
                  <p className={`text-sm font-semibold ${
                    call.nextReminder
                      ? isDark
                        ? "text-emerald-200"
                        : "text-emerald-700"
                      : isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}>
                    {call.nextReminder ?? "Aucun rappel planifié"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 – Notes & description */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className={`text-[11px] font-semibold uppercase tracking-wide ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}>
                Notes & description
              </h3>
            </div>
            <div className={`rounded-xl border p-4 text-sm leading-relaxed ${
              isDark
                ? "bg-slate-800/50 border-slate-700 text-slate-100"
                : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              {call.description ??
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                  Aucune note n'a encore été enregistrée pour ce contact.
                </span>
              }
            </div>
          </section>

          {/* Section 4 – Historique des appels */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className={`text-[11px] font-semibold uppercase tracking-wide ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}>
                Historique des appels
              </h3>
            </div>
            <div className="space-y-3">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 ${
                    isDark 
                      ? "bg-slate-800/50 border border-slate-700" 
                      : "bg-slate-50 border border-slate-200"
                  }`}
                >
                  <div className="flex flex-col items-center pt-0.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        background:
                          index === 0 ? gradientPurple : (isDark ? "rgba(148,163,184,0.6)" : "rgba(148,163,184,0.8)"),
                      }}
                    />
                    {index < history.length - 1 && (
                      <div className={`mt-1.5 h-8 w-px ${
                        isDark ? "bg-slate-700" : "bg-slate-300"
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className={`font-semibold text-sm ${
                        isDark ? "text-slate-100" : "text-slate-900"
                      }`}>
                        {entry.date}
                      </p>
                      <StatusBadge status={entry.status} />
                    </div>
                    <p className={`text-xs leading-relaxed ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}>
                      {entry.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full px-3 py-1.5 font-medium ${
              isDark
                ? "text-slate-300 hover:bg-white/5"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Fermer
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200/40 transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
              style={{ background: gradientPurple }}
            >
              Modifier
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


