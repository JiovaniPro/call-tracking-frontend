"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { NotificationDropdown, type NotificationItem } from "./NotificationDropdown";
import { useTheme } from "../layout/AppShell";

const gradient = "linear-gradient(135deg, #dd7fff, #7264ff)";

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-1",
    label: "Rappel prévu aujourd’hui : Jean Dupont – 09:00",
    time: "Il y a 12 min",
    read: false,
    type: "reminder",
    href: "/reminders",
  },
  {
    id: "n-2",
    label: "3 rappels à effectuer aujourd’hui",
    time: "Il y a 35 min",
    read: false,
    type: "calls",
    href: "/reminders",
  },
  {
    id: "n-3",
    label: "Appel effectué : Marie Rakoto",
    time: "Il y a 1 h",
    read: false,
    type: "success",
    href: "/today",
  },
  {
    id: "n-4",
    label: "Faux numéro détecté",
    time: "Hier",
    read: true,
    type: "warning",
    href: "/calls",
  },
];

export const NotificationBell: React.FC = () => {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const handleToggle = () => setOpen((v) => !v);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    const target = notifications.find((n) => n.id === id);
    if (target?.href) {
      // Laisse le temps d'appliquer l'état lu avant la navigation
      setTimeout(() => {
        window.location.href = target.href!;
      }, 120);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!open) return;
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        !(buttonRef.current.nextElementSibling as HTMLElement | null)?.contains(
          target
        )
      ) {
        setOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-label="Ouvrir les notifications"
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${
          isDark
            ? "bg-white/5 text-slate-200 hover:bg-white/10"
            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
        }`}
        style={{ cursor: "pointer" }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border border-white text-[11px] font-semibold leading-none text-white shadow-sm"
            style={{ background: gradient }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        open={open}
        items={notifications}
        onClose={() => setOpen(false)}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
};


