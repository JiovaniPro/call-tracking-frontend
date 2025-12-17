"use client";

import { useState, useEffect, useCallback } from "react";
import {
  callsApi,
  remindersApi,
  notificationsApi,
  reportsApi,
  settingsApi,
} from "./api";
import type {
  Call,
  CallsFilter,
  Reminder,
  Notification,
  KPIReport,
  TodayReport,
  UserSettings,
} from "../types/api";

// =============================================
// Generic fetch hook
// =============================================

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useApi<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}

// =============================================
// Calls Hooks
// =============================================

export function useCalls(filters?: CallsFilter) {
  return useApi<Call[]>(
    () => callsApi.getAll(filters),
    [filters?.search, filters?.status, filters?.type, filters?.from, filters?.to]
  );
}

export function useCall(id: string) {
  return useApi<Call>(() => callsApi.getById(id), [id]);
}

// =============================================
// Reminders Hooks
// =============================================

export function useReminders(date?: string) {
  return useApi<Reminder[]>(() => remindersApi.getAll(date), [date]);
}

export function useTodayReminders() {
  return useApi<Reminder[]>(() => remindersApi.getToday(), []);
}

// =============================================
// Notifications Hooks
// =============================================

export function useNotifications(readFilter?: boolean) {
  return useApi<Notification[]>(
    () => notificationsApi.getAll(readFilter),
    [readFilter]
  );
}

export function useUnreadNotifications() {
  return useApi<Notification[]>(() => notificationsApi.getUnread(), []);
}

// =============================================
// Reports Hooks
// =============================================

export function useKPI(range: "day" | "week" | "month" = "month") {
  return useApi<KPIReport>(() => reportsApi.getKPI(range), [range]);
}

export function useTodayReport() {
  return useApi<TodayReport>(() => reportsApi.getToday(), []);
}

// =============================================
// Settings Hooks
// =============================================

export function useSettings() {
  return useApi<UserSettings>(() => settingsApi.get(), []);
}

// =============================================
// Mutation helpers
// =============================================

interface UseMutationState<T, R> {
  mutate: (data: T) => Promise<R>;
  isLoading: boolean;
  error: string | null;
}

export function useMutation<T, R>(
  mutationFn: (data: T) => Promise<R>
): UseMutationState<T, R> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (data: T): Promise<R> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await mutationFn(data);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn]
  );

  return { mutate, isLoading, error };
}

