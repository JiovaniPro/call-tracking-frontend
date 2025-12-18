// =============================================
// API Client - Call Tracking CRM
// =============================================

import type {
  AuthResponse,
  LoginRequest,
  User,
  Call,
  CallsFilter,
  CreateCallRequest,
  UpdateCallRequest,
  Reminder,
  CreateReminderRequest,
  UpdateReminderRequest,
  Notification,
  KPIReport,
  TodayReport,
  StatusStatsReport,
  UserSettings,
  UpdateSettingsRequest,
  ImportResult,
  AdminUser,
  AdminUserWithStats,
  CreateUserRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
  AdminKPIReport,
  AdminUsersStatsResponse,
  AdminUserDetailResponse,
  AdminCallsFilter,
  AdminCallsResponse,
  AdminRemindersFilter,
  AdminRemindersResponse,
} from "../types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// =============================================
// Token Management
// =============================================

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken");
  }
  return accessToken;
};

export const clearTokens = () => {
  accessToken = null;
  localStorage.removeItem("accessToken");
};

// =============================================
// Base Fetch with Auth & Refresh
// =============================================

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // Send refresh_token cookie
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data: AuthResponse = await res.json();
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers || {}),
  };

  // Attach CSRF token from cookie if available (required by backend for POST/PUT/PATCH/DELETE)
  if (typeof window !== "undefined") {
    const csrfCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("csrf_token="));
    if (csrfCookie) {
      const csrfToken = decodeURIComponent(csrfCookie.split("=")[1]);
      (headers as Record<string, string>)["x-csrf-token"] = csrfToken;
    }
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  let res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  // Handle 401 - try refresh
  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
        credentials: "include",
      });
    } else {
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "An error occurred" }));
    // Preserve the error message from backend, especially for account disabled
    const errorMessage = error.error?.message || error.message || `HTTP ${res.status}`;
    const errorCode = error.error?.code || error.code;
    const err = new Error(errorMessage);
    (err as any).code = errorCode;
    throw err;
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// =============================================
// Auth API
// =============================================

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    });
    setAccessToken(res.accessToken);
    return res;
  },

  refresh: async (): Promise<AuthResponse | null> => {
    const token = await refreshAccessToken();
    if (!token) return null;
    const user = await authApi.me();
    return { accessToken: token, user };
  },

  logout: async (): Promise<void> => {
    try {
      await apiFetch<void>("/auth/logout", { method: "POST" });
    } finally {
      clearTokens();
    }
  },

  me: async (): Promise<User> => {
    return apiFetch<User>("/me");
  },
};

// =============================================
// Calls API
// =============================================

export const callsApi = {
  getAll: async (filters?: CallsFilter): Promise<Call[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.from) params.append("from", filters.from);
    if (filters?.to) params.append("to", filters.to);

    const query = params.toString();
    return apiFetch<Call[]>(`/calls${query ? `?${query}` : ""}`);
  },

  getById: async (id: string): Promise<Call> => {
    return apiFetch<Call>(`/calls/${id}`);
  },

  create: async (data: CreateCallRequest): Promise<Call> => {
    return apiFetch<Call>("/calls", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: UpdateCallRequest): Promise<Call> => {
    return apiFetch<Call>(`/calls/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/calls/${id}`, { method: "DELETE" });
  },

  import: async (file: File, dryRun = false): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    if (dryRun) formData.append("dryRun", "true");

    const token = getAccessToken();
    const res = await fetch(`${API_BASE_URL}/calls/import`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Import failed" }));
      throw new Error(error.message);
    }

    return res.json();
  },
};

// =============================================
// Reminders API
// =============================================

export const remindersApi = {
  getAll: async (date?: string): Promise<Reminder[]> => {
    const params = date ? `?date=${date}` : "";
    return apiFetch<Reminder[]>(`/reminders${params}`);
  },

  getToday: async (): Promise<Reminder[]> => {
    return apiFetch<Reminder[]>("/reminders?date=today");
  },

  create: async (data: CreateReminderRequest): Promise<Reminder> => {
    return apiFetch<Reminder>("/reminders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: UpdateReminderRequest): Promise<Reminder> => {
    return apiFetch<Reminder>(`/reminders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  markDone: async (id: string): Promise<Reminder> => {
    return remindersApi.update(id, { status: "DONE" });
  },

  delete: async (id: string): Promise<void> => {
    return apiFetch<void>(`/reminders/${id}`, { method: "DELETE" });
  },
};

// =============================================
// Notifications API
// =============================================

export const notificationsApi = {
  getAll: async (readFilter?: boolean): Promise<Notification[]> => {
    const params = readFilter !== undefined ? `?read=${readFilter}` : "";
    return apiFetch<Notification[]>(`/me/notifications${params}`);
  },

  getUnread: async (): Promise<Notification[]> => {
    return apiFetch<Notification[]>("/me/notifications?read=false");
  },

  markAsRead: async (id: string): Promise<Notification> => {
    return apiFetch<Notification>(`/me/notifications/${id}/read`, {
      method: "PATCH",
    });
  },

  markAllAsRead: async (): Promise<void> => {
    return apiFetch<void>("/me/notifications/mark-all-read", {
      method: "POST",
    });
  },
};

// =============================================
// Reports API
// =============================================

export const reportsApi = {
  getKPI: async (range: "day" | "week" | "month" = "month"): Promise<KPIReport> => {
    return apiFetch<KPIReport>(`/reports/kpi?range=${range}`);
  },

  getToday: async (): Promise<TodayReport> => {
    return apiFetch<TodayReport>("/reports/today");
  },

  getStatusStats: async (range: "day" | "week" | "month" = "month"): Promise<StatusStatsReport> => {
    return apiFetch<StatusStatsReport>(`/reports/status-stats?range=${range}`);
  },
};

// =============================================
// Settings API
// =============================================

export const settingsApi = {
  get: async (): Promise<UserSettings> => {
    return apiFetch<UserSettings>("/me/settings");
  },

  update: async (data: UpdateSettingsRequest): Promise<UserSettings> => {
    return apiFetch<UserSettings>("/me/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// =============================================
// Admin API
// =============================================

export const adminApi = {
  // Users
  getUsers: async (filters?: { role?: "ADMIN" | "USER"; isActive?: boolean }): Promise<AdminUser[]> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append("role", filters.role);
    if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));

    const query = params.toString();
    return apiFetch<AdminUser[]>(`/admin/users${query ? `?${query}` : ""}`);
  },

  getUserById: async (id: string): Promise<AdminUserWithStats> => {
    return apiFetch<AdminUserWithStats>(`/admin/users/${id}`);
  },

  createUser: async (data: CreateUserRequest): Promise<AdminUser> => {
    return apiFetch<AdminUser>("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<AdminUser> => {
    return apiFetch<AdminUser>(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  resetPassword: async (id: string, data: ResetPasswordRequest): Promise<void> => {
    return apiFetch<void>(`/admin/users/${id}/reset-password`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  toggleActive: async (id: string): Promise<AdminUser> => {
    return apiFetch<AdminUser>(`/admin/users/${id}/toggle-active`, {
      method: "PATCH",
    });
  },

  // Reports
  getKPI: async (): Promise<AdminKPIReport> => {
    return apiFetch<AdminKPIReport>("/admin/reports/kpi");
  },

  // Users Stats
  getUsersStats: async (): Promise<AdminUsersStatsResponse> => {
    return apiFetch<AdminUsersStatsResponse>("/admin/users/stats");
  },

  getUserStats: async (id: string): Promise<AdminUserDetailResponse> => {
    return apiFetch<AdminUserDetailResponse>(`/admin/users/${id}/stats`);
  },

  // Calls
  getCalls: async (filters?: AdminCallsFilter): Promise<AdminCallsResponse> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.from) params.append("from", filters.from);
    if (filters?.to) params.append("to", filters.to);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));

    const query = params.toString();
    return apiFetch<AdminCallsResponse>(`/admin/calls${query ? `?${query}` : ""}`);
  },

  // Reminders
  getReminders: async (filters?: AdminRemindersFilter): Promise<AdminRemindersResponse> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.date) params.append("date", filters.date);
    if (filters?.overdue) params.append("overdue", String(filters.overdue));

    const query = params.toString();
    return apiFetch<AdminRemindersResponse>(`/admin/reminders${query ? `?${query}` : ""}`);
  },
};

