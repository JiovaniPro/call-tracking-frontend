"use client";

import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import { Calendar, X } from "lucide-react";
import { useTheme } from "../layout/AppShell";
import "react-day-picker/dist/style.css";

// Labels français pour react-day-picker
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const WEEKDAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

type DatePickerProps = {
  value: string; // Format YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Sélectionner une date",
}) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedDate = value ? new Date(value) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
      setIsOpen(false);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const inputBase =
    "w-full rounded-xl border px-3 py-2 text-xs outline-none transition placeholder:text-slate-400";

  const inputLight =
    "border-slate-200 bg-slate-50/60 text-slate-900 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#7264ff]/60";

  const inputDark =
    "border-slate-700 bg-[#020617]/60 text-slate-100 focus:border-slate-500 focus:ring-2 focus:ring-[#7264ff]/70";

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          readOnly
          value={value ? formatDisplayDate(value) : ""}
          placeholder={placeholder}
          onClick={() => setIsOpen(!isOpen)}
          className={`${inputBase} ${
            isDark ? inputDark : inputLight
          } cursor-pointer pr-10`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {value ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setIsOpen(false);
              }}
              className={`text-slate-400 hover:text-slate-600 ${
                isDark ? "hover:text-slate-300" : ""
              }`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Calendar className={`h-3.5 w-3.5 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`} />
          )}
        </div>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute left-0 top-full z-50 mt-2 rounded-2xl p-4 shadow-2xl ${
              isDark
                ? "bg-[#020617] border border-slate-700"
                : "bg-white border border-slate-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              modifiersClassNames={{
                today: isDark
                  ? "rdp-day_today_dark"
                  : "rdp-day_today_light",
                selected: "rdp-day_selected",
              }}
              className={`rdp-custom ${isDark ? "rdp-dark" : "rdp-light"}`}
            />
            <style jsx global>{`
              .rdp-custom {
                --rdp-cell-size: 36px;
                --rdp-accent-color: #6a2cff;
                --rdp-background-color: ${isDark ? "#0f1a2f" : "#f8fafc"};
                --rdp-accent-color-dark: #8c5bff;
                --rdp-outline: 2px solid var(--rdp-accent-color);
                --rdp-outline-selected: 2px solid var(--rdp-accent-color);
                margin: 0;
              }

              .rdp-custom .rdp-months {
                display: flex;
              }

              .rdp-custom .rdp-month {
                margin: 0;
              }

              .rdp-custom .rdp-caption {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.5rem 0;
                margin-bottom: 0.5rem;
              }

              .rdp-custom .rdp-caption_label {
                font-size: 0.75rem;
                font-weight: 600;
                color: ${isDark ? "#e2e8f0" : "#1e293b"};
                text-transform: capitalize;
              }

              .rdp-custom .rdp-caption_label::first-letter {
                text-transform: uppercase;
              }

              .rdp-custom .rdp-nav {
                display: flex;
                gap: 0.25rem;
              }

              .rdp-custom .rdp-button_previous,
              .rdp-custom .rdp-button_next {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 0.5rem;
                border: 1px solid ${isDark ? "#334155" : "#e2e8f0"};
                background: ${isDark ? "#1e293b" : "#ffffff"};
                color: ${isDark ? "#cbd5e1" : "#475569"};
                transition: all 0.2s;
              }

              .rdp-custom .rdp-button_previous:hover,
              .rdp-custom .rdp-button_next:hover {
                background: ${isDark ? "#334155" : "#f1f5f9"};
                border-color: ${isDark ? "#475569" : "#cbd5e1"};
              }

              .rdp-custom .rdp-head_cell {
                font-size: 0.625rem;
                font-weight: 600;
                color: ${isDark ? "#94a3b8" : "#64748b"};
                text-transform: uppercase;
                padding: 0.5rem 0;
              }


              .rdp-custom .rdp-cell {
                padding: 0.125rem;
              }

              .rdp-custom .rdp-button {
                width: 36px;
                height: 36px;
                border-radius: 0.75rem;
                font-size: 0.75rem;
                font-weight: 500;
                border: 1px solid transparent;
                background: transparent;
                color: ${isDark ? "#e2e8f0" : "#1e293b"};
                transition: all 0.2s;
              }

              .rdp-custom .rdp-button:hover:not([disabled]) {
                background: ${isDark ? "#1e293b" : "#f1f5f9"};
                border-color: ${isDark ? "#334155" : "#e2e8f0"};
              }

              .rdp-custom .rdp-button[disabled] {
                color: ${isDark ? "#475569" : "#94a3b8"};
                opacity: 0.5;
              }

              .rdp-custom .rdp-day_today_light {
                background: ${isDark ? "#1e3a5f" : "#eff6ff"};
                border: 1px solid ${isDark ? "#3b82f6" : "#3b82f6"};
                color: ${isDark ? "#93c5fd" : "#1e40af"};
                font-weight: 600;
              }

              .rdp-custom .rdp-day_today_dark {
                background: #1e3a5f;
                border: 1px solid #3b82f6;
                color: #93c5fd;
                font-weight: 600;
              }

              .rdp-custom .rdp-day_selected {
                background: linear-gradient(135deg, #6a2cff, #8c5bff);
                color: #ffffff;
                font-weight: 600;
                border: 1px solid transparent;
              }

              .rdp-custom .rdp-day_selected:hover {
                background: linear-gradient(135deg, #5823cf, #7a4aff);
              }

              .rdp-custom .rdp-day_outside {
                color: ${isDark ? "#475569" : "#94a3b8"};
                opacity: 0.5;
              }
            `}</style>
          </div>
        </>
      )}
    </div>
  );
};

