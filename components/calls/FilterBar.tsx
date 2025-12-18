"use client";

import React, { useState, useEffect, useRef } from "react";
import { CalendarRange, Filter, RotateCcw, Search, X } from "lucide-react";
import { useTheme } from "../layout/AppShell";
import type { CallStatus } from "./StatusBadge";
import { ALL_UI_STATUSES } from "../../lib/statusMapping";

type DateRange = "all" | "today" | "week" | "month" | "custom";
type CallType = "all" | "nouveau" | "rappel";

type FilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  selectedStatuses: CallStatus[];
  onStatusesChange: (statuses: CallStatus[]) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  callType: CallType;
  onCallTypeChange: (type: CallType) => void;
  onReset: () => void;
  onOpenImport: () => void;
};

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  selectedStatuses,
  onStatusesChange,
  dateRange,
  onDateRangeChange,
  callType,
  onCallTypeChange,
  onReset,
  onOpenImport,
}) => {
  const { isDark } = useTheme();
  const [statusOpen, setStatusOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setStatusOpen(false);
        setDateOpen(false);
        setTypeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const gradientPurple = "linear-gradient(135deg, #6a2cff, #8c5bff)";

  const toggleStatus = (status: CallStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusesChange([...selectedStatuses, status]);
    }
  };

  const removeStatus = (status: CallStatus) => {
    onStatusesChange(selectedStatuses.filter((s) => s !== status));
  };

  const removeDateRange = () => {
    onDateRangeChange("all");
  };

  const removeCallType = () => {
    onCallTypeChange("all");
  };

  const removeSearch = () => {
    onSearchChange("");
  };

  const hasActiveFilters = search || selectedStatuses.length > 0 || dateRange !== "all" || callType !== "all";

  const dateRangeLabels: Record<DateRange, string> = {
    all: "Toutes les dates",
    today: "Aujourd'hui",
    week: "Cette semaine",
    month: "Ce mois",
    custom: "Plage personnalisée",
  };

  const callTypeLabels: Record<CallType, string> = {
    all: "Tous",
    nouveau: "Nouveaux",
    rappel: "Rappels",
  };

  return (
    <div ref={filterRef} className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
        {/* Search */}
        <div
          className={`flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-xs transition ${
            isDark
              ? "border-slate-700 bg-[#020617]/40 text-slate-100 focus-within:border-[#7264ff]"
              : "border-slate-200 bg-white text-slate-800 focus-within:border-[#7264ff]"
          }`}
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher (nom, téléphone, email)…"
            className={`h-7 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400 ${
              isDark ? "text-slate-100" : "text-slate-800"
            }`}
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setStatusOpen((v) => !v)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
              isDark
                ? "border-slate-700 bg-[#020617]/40 text-slate-100 hover:border-slate-500"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Statut</span>
            {selectedStatuses.length > 0 && (
              <span
                className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
                  isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                }`}
              >
                {selectedStatuses.length}
              </span>
            )}
          </button>
          {statusOpen && (
            <div
              className={`absolute z-20 mt-1 w-52 rounded-2xl border p-2 text-xs shadow-lg ${
                isDark
                  ? "border-slate-700 bg-[#020617] text-slate-100"
                  : "border-slate-100 bg-white text-slate-800"
              }`}
            >
              <p className="mb-1 px-1 text-[10px] uppercase tracking-wide text-slate-400">
                Statuts
              </p>
              <div className="space-y-1">
                {ALL_UI_STATUSES.map((status) => {
                  const active = selectedStatuses.includes(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleStatus(status)}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-[11px] transition ${
                        active
                          ? isDark
                            ? "bg-[#1d2033] text-slate-50"
                            : "bg-[#f2ebff] text-[#4b2bb8]"
                          : isDark
                          ? "text-slate-200 hover:bg-white/5"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="cursor-pointer">{status}</span>
                      {active && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isDark ? "bg-emerald-400" : "bg-emerald-500"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

          {/* Date range dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setDateOpen((v) => !v);
                setStatusOpen(false);
                setTypeOpen(false);
              }}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                isDark
                  ? "border-slate-700 bg-[#020617]/40 text-slate-100 hover:border-slate-500"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <CalendarRange className="h-3.5 w-3.5" />
              <span>Date</span>
              {dateRange !== "all" && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
                    isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  1
                </span>
              )}
            </button>
            {dateOpen && (
              <div
                className={`absolute z-20 mt-1 w-48 rounded-2xl border p-2 text-xs shadow-lg ${
                  isDark
                    ? "border-slate-700 bg-[#020617] text-slate-100"
                    : "border-slate-100 bg-white text-slate-800"
                }`}
              >
                <p className="mb-1 px-1 text-[10px] uppercase tracking-wide text-slate-400">
                  Période
                </p>
                <div className="space-y-1">
                  {(["all", "today", "week", "month", "custom"] as DateRange[]).map((range) => {
                    const active = dateRange === range;
                    return (
                      <button
                        key={range}
                        type="button"
                        onClick={() => {
                          onDateRangeChange(range);
                          setDateOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-[11px] transition cursor-pointer ${
                          active
                            ? isDark
                              ? "bg-[#1d2033] text-slate-50"
                              : "bg-[#f2ebff] text-[#4b2bb8]"
                            : isDark
                            ? "text-slate-200 hover:bg-white/5"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{dateRangeLabels[range]}</span>
                        {active && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isDark ? "bg-emerald-400" : "bg-emerald-500"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Call type dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setTypeOpen((v) => !v);
                setStatusOpen(false);
                setDateOpen(false);
              }}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                isDark
                  ? "border-slate-700 bg-[#020617]/40 text-slate-100 hover:border-slate-500"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span>Type</span>
              {callType !== "all" && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
                    isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  1
                </span>
              )}
            </button>
            {typeOpen && (
              <div
                className={`absolute z-20 mt-1 w-40 rounded-2xl border p-2 text-xs shadow-lg ${
                  isDark
                    ? "border-slate-700 bg-[#020617] text-slate-100"
                    : "border-slate-100 bg-white text-slate-800"
                }`}
              >
                <p className="mb-1 px-1 text-[10px] uppercase tracking-wide text-slate-400">
                  Type d'appel
                </p>
                <div className="space-y-1">
                  {(["all", "nouveau", "rappel"] as CallType[]).map((type) => {
                    const active = callType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          onCallTypeChange(type);
                          setTypeOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-[11px] transition cursor-pointer ${
                          active
                            ? isDark
                              ? "bg-[#1d2033] text-slate-50"
                              : "bg-[#f2ebff] text-[#4b2bb8]"
                            : isDark
                            ? "text-slate-200 hover:bg-white/5"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{callTypeLabels[type]}</span>
                        {active && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isDark ? "bg-emerald-400" : "bg-emerald-500"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Import button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onOpenImport}
            title="Importer un fichier .xlsx ou .csv pour ajouter des appels"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-slate-50 shadow-md shadow-indigo-200/40 transition hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: gradientPurple }}
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
              <CalendarRange className="h-3 w-3" />
            </span>
            Importer un fichier Excel
          </button>
        </div>
      </div>

      {/* Active filters chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {search && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                isDark
                  ? "bg-slate-800/60 text-slate-200 ring-1 ring-slate-700/60"
                  : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              <span>Recherche: "{search}"</span>
              <button
                type="button"
                onClick={removeSearch}
                className={`cursor-pointer rounded-full p-0.5 transition ${
                  isDark ? "hover:bg-slate-700" : "hover:bg-slate-200"
                }`}
                aria-label="Retirer la recherche"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedStatuses.map((status) => (
            <span
              key={status}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                isDark
                  ? "bg-slate-800/60 text-slate-200 ring-1 ring-slate-700/60"
                  : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              <span>{status}</span>
              <button
                type="button"
                onClick={() => removeStatus(status)}
                className={`cursor-pointer rounded-full p-0.5 transition ${
                  isDark ? "hover:bg-slate-700" : "hover:bg-slate-200"
                }`}
                aria-label={`Retirer le filtre ${status}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {dateRange !== "all" && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                isDark
                  ? "bg-slate-800/60 text-slate-200 ring-1 ring-slate-700/60"
                  : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              <span>Date: {dateRangeLabels[dateRange]}</span>
              <button
                type="button"
                onClick={removeDateRange}
                className={`cursor-pointer rounded-full p-0.5 transition ${
                  isDark ? "hover:bg-slate-700" : "hover:bg-slate-200"
                }`}
                aria-label="Retirer le filtre de date"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {callType !== "all" && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                isDark
                  ? "bg-slate-800/60 text-slate-200 ring-1 ring-slate-700/60"
                  : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              <span>Type: {callTypeLabels[callType]}</span>
              <button
                type="button"
                onClick={removeCallType}
                className={`cursor-pointer rounded-full p-0.5 transition ${
                  isDark ? "hover:bg-slate-700" : "hover:bg-slate-200"
                }`}
                aria-label="Retirer le filtre de type"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              onReset();
              setStatusOpen(false);
              setDateOpen(false);
              setTypeOpen(false);
            }}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
              isDark
                ? "text-slate-300 hover:bg-white/5"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Tout réinitialiser
          </button>
        </div>
      )}
    </div>
  );
};


