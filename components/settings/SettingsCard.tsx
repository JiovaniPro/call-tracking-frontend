"use client";

import React from "react";
import { useTheme } from "../layout/AppShell";

type SettingsCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  cols?: 1 | 2;
};

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  cols = 2,
}) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition ${
        isDark
          ? "border-slate-800 bg-[#0f1a2f] text-slate-50"
          : "border-slate-100 bg-white text-slate-900"
      }`}
    >
      <div className="mb-4 space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      <div className={`grid gap-4 ${cols === 2 ? "md:grid-cols-2" : ""}`}>
        {children}
      </div>
    </div>
  );
};


