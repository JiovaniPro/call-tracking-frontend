 "use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  DotProps,
} from "recharts";
import { useTheme } from "../layout/AppShell";

type MonthlyPoint = {
  month: string;
  value: number;
};

type ChartCardProps = {
  title: string;
  subtitle?: string;
  totalLabel: string;
  totalValue: string;
  points: MonthlyPoint[];
};

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  totalLabel,
  totalValue,
  points,
}) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`flex flex-col rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-[0_12px_30px_rgba(106,44,255,0.25)] hover:-translate-y-1 ${
        isDark ? "bg-[#0f1a2f] text-slate-50 shadow-slate-900" : "bg-white text-slate-900 shadow-slate-100"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{title}</p>
          {subtitle && (
            <p className={`mt-1 text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{subtitle}</p>
          )}
        </div>
        <div
          className={`rounded-2xl px-3 py-2 text-right ${
            isDark ? "bg-white/5" : "bg-slate-50"
          }`}
        >
          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            {totalLabel}
          </p>
          <p className="text-sm font-semibold">{totalValue}</p>
        </div>
      </div>

      <div
        className={`mt-2 h-56 w-full rounded-2xl ${
          isDark ? "bg-[#0b1426]" : "bg-gradient-to-br from-[#f5f0ff] via-[#f0fbff] to-white"
        } px-3 pb-4 pt-3`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid
              stroke={isDark ? "#1f2937" : "#e5e7eb"}
              vertical={false}
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: isDark ? "#cbd5e1" : "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: isDark ? "#cbd5e1" : "#64748b" }}
              axisLine={false}
              tickLine={false}
              domain={[0, "dataMax + 50"]}
            />
            <Tooltip
              contentStyle={{
                background: isDark ? "#0f172a" : "#ffffff",
                border: isDark ? "1px solid #1f2937" : "1px solid #e2e8f0",
                borderRadius: 12,
              }}
              cursor={{ stroke: "#6a2cff", strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#18b5be"
              strokeWidth={3}
              dot={(props: DotProps) => (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={5}
                  fill={isDark ? "#0f172a" : "#ffffff"}
                  stroke="#18b5be"
                  strokeWidth={3}
                />
              )}
              activeDot={{
                r: 6,
                stroke: "#6a2cff",
                strokeWidth: 2,
                fill: isDark ? "#0f172a" : "#ffffff",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


