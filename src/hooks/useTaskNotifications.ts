import { useState, useEffect, useCallback, useRef } from 'react';
import type { Task } from '../types/Task';
import type { NotificationSettings } from '../types/NotificationSettings';
import {
  loadNotificationSettings,
  saveNotificationSettings,
  updateLastDailyNotification,
  addNotifiedTaskId,
} from '../utils/notificationStorage';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getOverdueTasks,
  getTasksDueToday,
  getTasksDueTomorrow,
  sendDailySummaryNotification,
  sendTaskReminder,
  sendTestNotification,
  getCurrentTimeString,
  getTodayString,
} from '../utils/taskNotifications';

export interface UseTaskNotificationsReturn {
  settings: NotificationSettings;
  isSupported: boolean;
  permissionStatus: NotificationPermission | 'unsupported';
  updateSettings: (updates: Partial<NotificationSettings>) => void;
  requestPermission: () => Promise<boolean>;
  testNotification: () => boolean;
}

export const useTaskNotifications = (
  tasks: Task[]
): UseTaskNotificationsReturn => {
  const [settings, setSettings] = useState<NotificationSettings>(() => loadNotificationSettings());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>(
    () => getNotificationPermission()
  );
  const intervalRef = useRef<number | null>(null);
  const lastCheckRef = useRef<string>('');

  const isSupported = isNotificationSupported();

  // Update settings
  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...updates };
      saveNotificationSettings(updated);
      return updated;
    });
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const permission = await requestNotificationPermission();
    setPermissionStatus(permission);
    updateSettings({ permissionGranted: permission === 'granted' });
    return permission === 'granted';
  }, [updateSettings]);

  // Test notification
  const testNotification = useCallback((): boolean => {
    if (permissionStatus !== 'granted') {
      return false;
    }
    return sendTestNotification();
  }, [permissionStatus]);

  // Check for daily reminder
  const checkDailyReminder = useCallback(() => {
    if (!settings.enabled || !settings.dailyReminderEnabled || permissionStatus !== 'granted') {
      return;
    }

    const currentTime = getCurrentTimeString();
    const today = getTodayString();

    // Check if it's time for daily reminder and we haven't sent one today
    if (
      currentTime === settings.dailyReminderTime &&
      settings.lastDailyNotification !== today
    ) {
      const overdueTasks = getOverdueTasks(tasks);
      const todayTasks = getTasksDueToday(tasks);
      const tomorrowTasks = getTasksDueTomorrow(tasks);

      if (overdueTasks.length + todayTasks.length + tomorrowTasks.length > 0) {
        sendDailySummaryNotification(overdueTasks, todayTasks, tomorrowTasks);
        updateLastDailyNotification(today);
        updateSettings({ lastDailyNotification: today });
      }
    }
  }, [settings, permissionStatus, tasks, updateSettings]);

  // Check for before-due reminders
  const checkBeforeDueReminders = useCallback(() => {
    if (!settings.enabled || !settings.beforeDueEnabled || permissionStatus !== 'granted') {
      return;
    }

    const now = Date.now();
    const reminderThreshold = settings.beforeDueMinutes * 60 * 1000;

    // Collect all tasks with due dates recursively
    const collectTasks = (taskList: Task[]): Task[] => {
      const result: Task[] = [];
      for (const task of taskList) {
        if (task.dueDate && !task.completed && !task.isHeader) {
          result.push(task);
        }
        if (task.children) {
          result.push(...collectTasks(task.children));
        }
      }
      return result;
    };

    const allTasks = collectTasks(tasks);

    for (const task of allTasks) {
      if (!task.dueDate || settings.notifiedTaskIds.includes(task.id)) {
        continue;
      }

      // Calculate time until due (at start of day)
      const dueTime = new Date(task.dueDate + 'T00:00:00').getTime();
      const timeUntilDue = dueTime - now;

      // If task is within reminder threshold and not yet notified
      if (timeUntilDue > 0 && timeUntilDue <= reminderThreshold) {
        sendTaskReminder(task);
        addNotifiedTaskId(task.id);
        updateSettings({
          notifiedTaskIds: [...settings.notifiedTaskIds, task.id],
        });
      }
    }
  }, [settings, permissionStatus, tasks, updateSettings]);

  // Main check function
  const performChecks = useCallback(() => {
    // Prevent multiple checks in the same minute
    const currentMinute = getCurrentTimeString();
    if (currentMinute === lastCheckRef.current) {
      return;
    }
    lastCheckRef.current = currentMinute;

    checkDailyReminder();
    checkBeforeDueReminders();
  }, [checkDailyReminder, checkBeforeDueReminders]);

  // Set up interval for checking
  useEffect(() => {
    if (!settings.enabled || permissionStatus !== 'granted') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Check immediately on mount/enable
    performChecks();

    // Set up interval to check every 30 seconds
    intervalRef.current = window.setInterval(performChecks, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [settings.enabled, permissionStatus, performChecks]);

  // Check permission status on mount
  useEffect(() => {
    const status = getNotificationPermission();
    setPermissionStatus(status);
    if (status === 'granted' && !settings.permissionGranted) {
      updateSettings({ permissionGranted: true });
    }
  }, [settings.permissionGranted, updateSettings]);

  return {
    settings,
    isSupported,
    permissionStatus,
    updateSettings,
    requestPermission,
    testNotification,
  };
};
