"use client";

import React from "react";
import { useTheme } from "../layout/AppShell";

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
}) => {
  const { isDark } = useTheme();

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
};


