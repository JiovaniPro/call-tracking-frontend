"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { useTheme } from "../layout/AppShell";
import { useStatusStats } from "../../lib/hooks";
import { mapApiStatusToUI } from "../../lib/statusMapping";

export const DonutSections: React.FC = () => {
  const { isDark } = useTheme();
  const { data: statusStats, isLoading } = useStatusStats("month");
  const donut1Ref = useRef<HTMLDivElement>(null);
  const donut2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation au chargement de la page
    const timer = setTimeout(() => {
      if (donut1Ref.current) {
        donut1Ref.current.style.animation = "donutSpin 1.5s ease-out";
      }
      if (donut2Ref.current) {
        donut2Ref.current.style.animation = "donutSpin 1.5s ease-out 0.2s";
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Map status colors
  const statusColors: Record<string, string> = {
    "À contacter": "#94a3b8",
    "Ne répond pas": "#f59e0b",
    "Rappel": "#3b82f6",
    "Ne travaille pas en Suisse": "#a855f7",
    "Rendez-vous fixé": "#10b981",
    "Rendez-vous refixé": "#14b8a6",
    "Mauvais numéro": "#f43f5e",
    "Pas intéressé": "#ef4444",
    "Faire mail": "#6366f1",
    "Doublons": "#6b7280",
    "Déjà client": "#22c55e",
  };

  // Calculate status statistics
  const statusData = useMemo(() => {
    if (!statusStats?.statusPercentages) {
      return [];
    }

    // Convert API status to UI status and calculate percentages
    const statusList: Array<{ status: string; percentage: number; count: number }> = [];
    
    Object.entries(statusStats.statusPercentages).forEach(([apiStatus, percentage]) => {
      const uiStatus = mapApiStatusToUI(apiStatus as any);
      const count = statusStats.statusCounts[apiStatus] || 0;
      if (percentage > 0) {
        statusList.push({ status: uiStatus, percentage, count });
      }
    });

    // Sort by percentage descending
    statusList.sort((a, b) => b.percentage - a.percentage);

    return statusList;
  }, [statusStats]);

  // Generate conic gradient for donut chart
  const donutGradient = useMemo(() => {
    if (statusData.length === 0) return "conic-gradient(#94a3b8 0 100%)";
    
    let gradient = "conic-gradient(";
    let currentPercent = 0;
    
    statusData.forEach((item, index) => {
      const color = statusColors[item.status] || "#94a3b8";
      const start = currentPercent;
      currentPercent += item.percentage;
      const end = currentPercent;
      
      if (index === 0) {
        gradient += `${color} ${start}% ${end}%`;
      } else {
        gradient += `, ${color} ${start}% ${end}%`;
      }
    });
    
    gradient += ")";
    return gradient;
  }, [statusData]);

  // Get top 3 statuses for display
  const topStatuses = statusData.slice(0, 3);
  const topStatusPercentage = topStatuses.reduce((sum, item) => sum + item.percentage, 0);

  useEffect(() => {
    // Ajouter les styles CSS dynamiquement
    const style = document.createElement("style");
    style.textContent = `
      @keyframes donutSpin {
        0% {
          transform: rotate(-180deg) scale(0.8);
          opacity: 0;
        }
        100% {
          transform: rotate(0deg) scale(1);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-1">
        <div className={`rounded-2xl p-5 shadow-sm ${
          isDark ? "bg-[#0f1a2f] text-slate-50 shadow-slate-900" : "bg-white text-slate-900 shadow-slate-100"
        }`}>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#7264ff]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-1">
      <div
        className={`rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-[0_12px_30px_rgba(106,44,255,0.25)] hover:-translate-y-1 ${
          isDark ? "bg-[#0f1a2f] text-slate-50 shadow-slate-900" : "bg-white text-slate-900 shadow-slate-100"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium">Répartition des statuts</p>
          <span className="text-[11px] text-slate-400">Ce mois</span>
        </div>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div
            className={`space-y-2 text-xs ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            {statusData.length === 0 ? (
              <div className={`rounded-xl px-3 py-2 text-center ${
                isDark ? "bg-white/5" : "bg-slate-50"
              }`}>
                <span>Aucune donnée disponible</span>
              </div>
            ) : (
              statusData.map((item) => (
                <div
                  key={item.status}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                    isDark ? "bg-white/5" : "bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: statusColors[item.status] || "#94a3b8" }}
                    />
                    {item.status}
                  </span>
                  <span className="font-semibold">{item.percentage}%</span>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center justify-center">
            {statusData.length > 0 ? (
              <div
                ref={donut1Ref}
                className={`relative h-32 w-32 rounded-full ${
                  isDark ? "bg-slate-900" : "bg-slate-100"
                }`}
              >
                <div
                  className="absolute inset-1 rounded-full"
                  style={{
                    background: donutGradient,
                  }}
                />
                <div
                  className={`absolute inset-4 flex flex-col items-center justify-center rounded-full text-xs ${
                    isDark ? "bg-[#0f172a]" : "bg-white"
                  }`}
                >
                  <span className="text-[10px] text-slate-400">Total</span>
                  <span className="text-lg font-semibold">{statusStats?.totalCalls || 0}</span>
                </div>
              </div>
            ) : (
              <div className={`h-32 w-32 rounded-full flex items-center justify-center ${
                isDark ? "bg-slate-900" : "bg-slate-100"
              }`}>
                <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Aucune donnée
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


