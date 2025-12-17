 "use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTheme } from "../layout/AppShell";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
};

const gradient = "linear-gradient(135deg, #dd7fff, #7264ff)";

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  helper,
  trend,
}) => {
  const { isDark } = useTheme();
  const trendColor =
    trend?.direction === "down" ? "text-rose-500" : "text-emerald-400";
  const TrendIcon = trend?.direction === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <div
      className={`flex flex-1 flex-col rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-[0_12px_30px_rgba(106,44,255,0.25)] hover:-translate-y-1 ${
        isDark ? "bg-[#0f1a2f] text-slate-50 shadow-slate-900" : "bg-white text-slate-900 shadow-slate-100"
      }`}
    >
      <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          {helper && (
            <p className={`mt-1 text-[11px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{helper}</p>
          )}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${trendColor} ${
              isDark ? "bg-white/5" : "bg-slate-50"
            }`}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <div
        className="mt-3 h-1.5 w-16 rounded-full"
        style={{ background: gradient, opacity: 0.18 }}
      />
    </div>
  );
};


