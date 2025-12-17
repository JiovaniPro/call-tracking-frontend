"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "../layout/AppShell";

export const DonutSections: React.FC = () => {
  const { isDark } = useTheme();
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
        <div
          className={`rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-[0_12px_30px_rgba(106,44,255,0.25)] hover:-translate-y-1 ${
            isDark ? "bg-[#0f1a2f] text-slate-50 shadow-slate-900" : "bg-white text-slate-900 shadow-slate-100"
          }`}
        >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium">Sources d’appels (SOV)</p>
          <span className="text-[11px] text-slate-400">Aujourd’hui</span>
        </div>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div
            className={`space-y-2 text-xs ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            <div
              className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                isDark ? "bg-white/5" : "bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#7264ff]" />
                Direct
              </span>
              <span className="font-semibold">42%</span>
            </div>
            <div
              className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                isDark ? "bg-white/5" : "bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#54d4ef]" />
                Campagnes
              </span>
              <span className="font-semibold">33%</span>
            </div>
            <div
              className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                isDark ? "bg-white/5" : "bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#dd7fff]" />
                Référents
              </span>
              <span className="font-semibold">25%</span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div
              ref={donut1Ref}
              className={`relative h-32 w-32 rounded-full ${
                isDark ? "bg-slate-900" : "bg-slate-100"
              }`}
            >
              <div
                className="absolute inset-1 rounded-full"
                style={{
                  background:
                    "conic-gradient(#7264ff 0 42%, #54d4ef 42% 75%, #dd7fff 75% 100%)",
                }}
              />
              <div
                className={`absolute inset-4 flex flex-col items-center justify-center rounded-full text-xs ${
                  isDark ? "bg-[#0f172a]" : "bg-white"
                }`}
              >
                <span className="text-[10px] text-slate-400">Direct</span>
                <span className="text-lg font-semibold">42%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-[0_12px_30px_rgba(106,44,255,0.25)] hover:-translate-y-1 ${
          isDark ? "bg-[#0f1a2f] text-slate-50 shadow-slate-900" : "bg-white text-slate-900 shadow-slate-100"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium">Share of voice</p>
          <span className="text-[11px] text-slate-400">Campagnes</span>
        </div>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div
            className={`space-y-2 text-xs ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            <div
              className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                isDark ? "bg-white/5" : "bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#7264ff]" />
                Campagne Google
              </span>
              <span className="font-semibold">45%</span>
            </div>
            <div
              className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                isDark ? "bg-white/5" : "bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#54d4ef]" />
                Réseaux sociaux
              </span>
              <span className="font-semibold">32%</span>
            </div>
            <div
              className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                isDark ? "bg-white/5" : "bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#dd7fff]" />
                Partenaires
              </span>
              <span className="font-semibold">23%</span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div
              ref={donut2Ref}
              className={`relative h-32 w-32 rounded-full ${
                isDark ? "bg-slate-900" : "bg-slate-100"
              }`}
            >
              <div
                className="absolute inset-1 rounded-full"
                style={{
                  background:
                    "conic-gradient(#dd7fff 0 45%, #54d4ef 45% 77%, #7264ff 77% 100%)",
                }}
              />
              <div
                className={`absolute inset-4 flex flex-col items-center justify-center rounded-full text-xs ${
                  isDark ? "bg-[#0f172a]" : "bg-white"
                }`}
              >
                <span className="text-[10px] text-slate-400">Google Ads</span>
                <span className="text-lg font-semibold">45%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


