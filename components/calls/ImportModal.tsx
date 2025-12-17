"use client";

import React from "react";
import { CloudUpload, FileSpreadsheet, X } from "lucide-react";
import { useTheme } from "../layout/AppShell";

type ImportModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const ImportModal: React.FC<ImportModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const { isDark } = useTheme();
  const gradientPurple = "linear-gradient(135deg, #6a2cff, #8c5bff)";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl ${
          isDark
            ? "bg-[#020617] text-slate-50 shadow-slate-900"
            : "bg-white text-slate-900 shadow-slate-200"
        }`}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold">Importer un fichier Excel</h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Glissez-déposez un fichier .xlsx ou .csv ou sélectionnez-le
              depuis votre ordinateur.
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

        <div
          className={`mb-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center text-xs ${
            isDark
              ? "border-slate-700 bg-[#020617]"
              : "border-slate-200 bg-slate-50/60"
          }`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f2ebff] to-[#e0f7ff] text-[#6a2cff]">
            <CloudUpload className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium">
            Glissez votre fichier ici ou{" "}
            <span
              className="cursor-pointer text-[#6a2cff]"
              style={{ textDecoration: "underline" }}
            >
              cliquez pour parcourir
            </span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Formats acceptés : .xlsx, .csv — 10 Mo maximum (démo, aucun fichier
            réellement envoyé).
          </p>
        </div>

        <div
          className={`mb-4 flex items-center gap-2 rounded-2xl px-3 py-2 text-[11px] ${
            isDark ? "bg-white/5 text-slate-300" : "bg-slate-50 text-slate-600"
          }`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
          <p>
            Cette action ajoutera les lignes importées directement dans la liste
            des appels (simulation).
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 text-xs">
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
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 font-medium text-white shadow-md shadow-indigo-200/40 transition hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: gradientPurple }}
          >
            <CloudUpload className="h-3.5 w-3.5" />
            Importer le fichier
          </button>
        </div>
      </div>
    </div>
  );
};


