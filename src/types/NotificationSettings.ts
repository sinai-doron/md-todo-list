export interface NotificationSettings {
  enabled: boolean;
  permissionGranted: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // "HH:MM" format (e.g., "09:00")
  beforeDueEnabled: boolean;
  beforeDueMinutes: number; // 60 = 1 hour, 1440 = 1 day
  lastDailyNotification: string | null; // ISO date to prevent duplicate daily notifications
  notifiedTaskIds: string[]; // Track which tasks already notified (for before-due)
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  permissionGranted: false,
  dailyReminderEnabled: true,
  dailyReminderTime: '09:00',
  beforeDueEnabled: false,
  beforeDueMinutes: 60,
  lastDailyNotification: null,
  notifiedTaskIds: [],
};

// Before-due reminder options
export const BEFORE_DUE_OPTIONS = [
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' },
] as const;
