// =============================================
// API Types - Call Tracking CRM
// =============================================

// Auth
export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Calls
export type CallStatus = "NEW" | "IN_PROGRESS" | "COMPLETED" | "MISSED" | "CANCELED";
export type CallDirection = "INBOUND" | "OUTBOUND";
export type CallType = "PROSPECTION" | "SUPPORT" | "FOLLOW_UP" | "OTHER";

export interface Call {
  id: string;
  direction: CallDirection;
  type: CallType;
  status: CallStatus;
  fromNumber: string;
  toNumber: string;
  durationSec: number | null;
  notes: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  statusHistory?: CallStatusHistory[];
}

export interface CallStatusHistory {
  id: string;
  oldStatus: CallStatus | null;
  newStatus: CallStatus;
  changedAt: string;
}

export interface CreateCallRequest {
  direction: CallDirection;
  type: CallType;
  status?: CallStatus;
  fromNumber: string;
  toNumber: string;
  durationSec?: number;
  notes?: string;
  occurredAt?: string;
}

export interface UpdateCallRequest {
  direction?: CallDirection;
  type?: CallType;
  status?: CallStatus;
  fromNumber?: string;
  toNumber?: string;
  durationSec?: number;
  notes?: string;
  occurredAt?: string;
}

export interface CallsFilter {
  search?: string;
  status?: CallStatus;
  type?: CallType;
  from?: string;
  to?: string;
}

// Reminders
export type ReminderStatus = "PENDING" | "DONE" | "CANCELED";

export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  dueAt: string;
  status: ReminderStatus;
  callId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  call?: Call;
}

export interface CreateReminderRequest {
  title: string;
  description?: string;
  dueAt: string;
  callId?: string;
}

export interface UpdateReminderRequest {
  title?: string;
  description?: string;
  dueAt?: string;
  status?: ReminderStatus;
}

// Notifications
export type NotificationType = "REMINDER_DUE" | "CALL_MISSED" | "SYSTEM";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  read: boolean;
  userId: string;
  createdAt: string;
}

// Reports / KPI
export interface KPIReport {
  range: {
    from: string;
    to: string;
  };
  totalCalls: number;
  completedCalls: number;
  missedCalls: number;
  totalDurationSec: number;
}

export interface TodayReport {
  range: {
    from: string;
    to: string;
  };
  calls: Call[];
  reminders: Reminder[];
}

// Settings
export interface UserSettings {
  id: string;
  userId: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  notificationsEnabled: boolean;
  reminderLeadMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  notificationsEnabled?: boolean;
  reminderLeadMinutes?: number;
}

// Import
export interface ImportResult {
  success: boolean;
  dryRun: boolean;
  summary: {
    total: number;
    imported: number;
    skipped: number;
  };
  validationErrors: {
    row: number;
    field: string;
    message: string;
  }[];
}

// API Error
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

