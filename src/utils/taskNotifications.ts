import type { Task } from '../types/Task';

/**
 * Check if browser notifications are supported
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * Request notification permission from the browser
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Failed to request notification permission:', e);
    return 'denied';
  }
};

/**
 * Send a browser notification
 */
export const sendNotification = (
  title: string,
  options?: NotificationOptions
): Notification | null => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted:', Notification.permission);
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      ...options,
    });

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    // Focus window when notification is clicked
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (e) {
    console.error('Failed to send notification:', e);
    return null;
  }
};

/**
 * Send a test notification directly
 */
export const sendTestNotification = (): boolean => {
  // Log current state for debugging
  console.log('Attempting to send test notification...');
  console.log('Notification supported:', isNotificationSupported());
  console.log('Notification.permission:', Notification.permission);

  if (!isNotificationSupported()) {
    alert('Notifications are not supported in this browser.');
    return false;
  }

  if (Notification.permission !== 'granted') {
    alert(`Notification permission is "${Notification.permission}". Please enable notifications in your browser settings.`);
    return false;
  }

  try {
    const notification = new Notification('MD Tasks', {
      body: 'Test notification - Notifications are working!',
      icon: '/favicon.svg',
      tag: 'test-notification',
      requireInteraction: false,
    });

    console.log('Notification created:', notification);

    notification.onshow = () => {
      console.log('Notification shown');
    };

    notification.onerror = (e) => {
      console.error('Notification error:', e);
      alert('Notification error occurred. Check browser console for details.');
    };

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    return true;
  } catch (e) {
    console.error('Failed to create notification:', e);
    alert(`Failed to create notification: ${e}`);
    return false;
  }
};

/**
 * Get today's date string in YYYY-MM-DD format
 */
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get tomorrow's date string in YYYY-MM-DD format
 */
export const getTomorrowString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

/**
 * Recursively collect all tasks with due dates
 */
const collectTasksWithDueDates = (tasks: Task[]): Task[] => {
  const result: Task[] = [];

  const traverse = (taskList: Task[]) => {
    for (const task of taskList) {
      if (task.dueDate && !task.completed && !task.isHeader) {
        result.push(task);
      }
      if (task.children) {
        traverse(task.children);
      }
    }
  };

  traverse(tasks);
  return result;
};

/**
 * Get overdue tasks (due date < today)
 */
export const getOverdueTasks = (tasks: Task[]): Task[] => {
  const today = getTodayString();
  return collectTasksWithDueDates(tasks).filter(task => task.dueDate! < today);
};

/**
 * Get tasks due today
 */
export const getTasksDueToday = (tasks: Task[]): Task[] => {
  const today = getTodayString();
  return collectTasksWithDueDates(tasks).filter(task => task.dueDate === today);
};

/**
 * Get tasks due tomorrow
 */
export const getTasksDueTomorrow = (tasks: Task[]): Task[] => {
  const tomorrow = getTomorrowString();
  return collectTasksWithDueDates(tasks).filter(task => task.dueDate === tomorrow);
};

/**
 * Send daily summary notification
 */
export const sendDailySummaryNotification = (
  overdueTasks: Task[],
  todayTasks: Task[],
  tomorrowTasks: Task[]
): void => {
  const total = overdueTasks.length + todayTasks.length + tomorrowTasks.length;

  if (total === 0) return;

  if (total === 1) {
    // Single task notification
    const task = overdueTasks[0] || todayTasks[0] || tomorrowTasks[0];
    const status = overdueTasks.length > 0 ? 'Overdue' :
                   todayTasks.length > 0 ? 'Due Today' : 'Due Tomorrow';

    sendNotification(`Task ${status}`, {
      body: task.text,
      tag: 'daily-reminder',
    });
  } else {
    // Multiple tasks notification
    const parts: string[] = [];
    if (overdueTasks.length > 0) {
      parts.push(`${overdueTasks.length} overdue`);
    }
    if (todayTasks.length > 0) {
      parts.push(`${todayTasks.length} due today`);
    }
    if (tomorrowTasks.length > 0) {
      parts.push(`${tomorrowTasks.length} due tomorrow`);
    }

    sendNotification(`${total} Tasks Need Attention`, {
      body: parts.join(', ') + '\nClick to view',
      tag: 'daily-reminder',
    });
  }
};

/**
 * Send individual task reminder
 */
export const sendTaskReminder = (task: Task): void => {
  const today = getTodayString();
  const tomorrow = getTomorrowString();

  let status = 'Due Soon';
  if (task.dueDate === today) {
    status = 'Due Today';
  } else if (task.dueDate === tomorrow) {
    status = 'Due Tomorrow';
  } else if (task.dueDate! < today) {
    status = 'Overdue';
  }

  sendNotification(`Task ${status}`, {
    body: task.text,
    tag: `task-reminder-${task.id}`,
  });
};

/**
 * Get current time in HH:MM format
 */
export const getCurrentTimeString = (): string => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};
