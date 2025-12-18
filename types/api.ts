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
export type CallStatus = 
  | "A_CONTACTER"
  | "NE_REPOND_PAS"
  | "RAPPEL"
  | "NE_TRAVAILLE_PAS_EN_SUISSE"
  | "RENDEZ_VOUS_FIXE"
  | "RENDEZ_VOUS_REFIXE"
  | "MAUVAIS_NUMERO"
  | "PAS_INTERESSE"
  | "FAIRE_MAIL"
  | "DOUBLONS"
  | "DEJA_CLIENT";
export type CallDirection = "INBOUND" | "OUTBOUND";
export type CallType = "PROSPECTION" | "SUPPORT" | "FOLLOW_UP" | "OTHER";

export interface Call {
  id: string;
  direction: CallDirection;
  type: CallType;
  status: CallStatus;
  // Numéro de vague (lot d'import) propre à l'utilisateur, immuable
  waveNumber?: number | null;
  fromNumber: string;
  toNumber: string;
  durationSec: number | null;
  notes: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  recallDate?: string | null;
  recallTimeSlot?: string | null;
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
  firstName?: string;
  lastName?: string;
  email?: string;
  recallDate?: string;
  recallTimeSlot?: string;
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
  firstName?: string;
  lastName?: string;
  email?: string;
  recallDate?: string | null;
  recallTimeSlot?: string | null;
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
  totalDurationSec: number;
  appointmentsThisMonth?: number;
}

export interface TodayReport {
  range: {
    from: string;
    to: string;
  };
  calls: Call[];
  reminders: Reminder[];
  callsToday?: number;
  appointmentsToday?: number;
}

export interface StatusStatsReport {
  range: {
    from: string;
    to: string;
  };
  totalCalls: number;
  statusCounts: Record<string, number>;
  statusPercentages: Record<string, number>;
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

// Admin - Users
export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "ADMIN" | "USER";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserWithStats extends AdminUser {
  stats?: {
    callsCount: number;
    remindersCount: number;
  };
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: "ADMIN" | "USER";
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: "ADMIN" | "USER";
  isActive?: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

// Admin - Reports
export interface AdminKPIReport {
  totalCallsToday: number;
  totalAppointmentsToday: number;
  totalAppointmentsThisMonth: number;
  totalRemindersToday: number;
}

// API Error
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

