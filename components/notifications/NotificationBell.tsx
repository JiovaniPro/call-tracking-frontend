"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { NotificationDropdown, type NotificationItem } from "./NotificationDropdown";
import { useTheme } from "../layout/AppShell";
import { notificationsApi } from "../../lib/api";
import type { Notification, NotificationType } from "../../types/api";

const gradient = "linear-gradient(135deg, #dd7fff, #7264ff)";

// Map API notification type to UI type
const mapNotificationType = (type: NotificationType): NotificationItem["type"] => {
  const map: Record<NotificationType, NotificationItem["type"]> = {
    REMINDER_DUE: "reminder",
    CALL_MISSED: "calls",
    SYSTEM: "success",
  };
  return map[type] || "success";
};

// Format time for display
const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays === 1) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
};

// Map API notification to UI format
const mapNotificationToUI = (notif: Notification): NotificationItem => ({
  id: notif.id,
  label: notif.title,
  time: formatTime(notif.createdAt),
  read: notif.read,
  type: mapNotificationType(notif.type),
  href: notif.type === "REMINDER_DUE" ? "/reminders" : notif.type === "CALL_MISSED" ? "/calls" : undefined,
});

export const NotificationBell: React.FC = () => {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getUnread();
      setNotifications(data.map(mapNotificationToUI));
    } catch (err) {
      // Silent fail - don't block UI for notifications
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleToggle = () => setOpen((v) => !v);

  const handleMarkRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    const target = notifications.find((n) => n.id === id);

    try {
      await notificationsApi.markAsRead(id);
    } catch (err) {
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
      console.error("Failed to mark as read:", err);
    }

    if (target?.href) {
      setTimeout(() => {
        window.location.href = target.href!;
      }, 120);
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic update
    const prevNotifications = [...notifications];
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await notificationsApi.markAllAsRead();
    } catch (err) {
      // Revert on error
      setNotifications(prevNotifications);
      console.error("Failed to mark all as read:", err);
    }
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
