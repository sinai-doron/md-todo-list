import type { NotificationSettings } from '../types/NotificationSettings';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../types/NotificationSettings';

const STORAGE_KEY = 'notification-settings';

/**
 * Load notification settings from localStorage
 */
export const loadNotificationSettings = (): NotificationSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new fields
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load notification settings:', e);
  }
  return { ...DEFAULT_NOTIFICATION_SETTINGS };
};

/**
 * Save notification settings to localStorage
 */
export const saveNotificationSettings = (settings: NotificationSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notification settings:', e);
  }
};

/**
 * Update specific notification settings
 */
export const updateNotificationSettings = (
  updates: Partial<NotificationSettings>
): NotificationSettings => {
  const current = loadNotificationSettings();
  const updated = { ...current, ...updates };
  saveNotificationSettings(updated);
  return updated;
};

/**
 * Add a task ID to the notified list
 */
export const addNotifiedTaskId = (taskId: string): void => {
  const settings = loadNotificationSettings();
  if (!settings.notifiedTaskIds.includes(taskId)) {
    settings.notifiedTaskIds = [...settings.notifiedTaskIds, taskId];
    saveNotificationSettings(settings);
  }
};

/**
 * Remove a task ID from the notified list (e.g., when task is deleted)
 */
export const removeNotifiedTaskId = (taskId: string): void => {
  const settings = loadNotificationSettings();
  settings.notifiedTaskIds = settings.notifiedTaskIds.filter(id => id !== taskId);
  saveNotificationSettings(settings);
};

/**
 * Clear all notified task IDs (e.g., daily reset)
 */
export const clearNotifiedTaskIds = (): void => {
  const settings = loadNotificationSettings();
  settings.notifiedTaskIds = [];
  saveNotificationSettings(settings);
};

/**
 * Update the last daily notification date
 */
export const updateLastDailyNotification = (date: string): void => {
  updateNotificationSettings({ lastDailyNotification: date });
};
