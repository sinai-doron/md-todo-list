import type { ProductivityStats, DailyStats } from '../types/Statistics';
import { DEFAULT_STATS } from '../types/Statistics';

const STATS_STORAGE_KEY = 'markdown-todo-app-stats';
const MAX_HISTORY_DAYS = 90;

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
const getYesterdayString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

/**
 * Clean up old entries beyond the rolling window
 */
const cleanupOldStats = (stats: ProductivityStats): ProductivityStats => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  return {
    ...stats,
    dailyHistory: stats.dailyHistory.filter(d => d.date >= cutoffStr),
  };
};

/**
 * Calculate current streak from daily history
 */
const calculateStreak = (dailyHistory: DailyStats[]): number => {
  const today = getTodayString();
  const yesterday = getYesterdayString();

  const sortedDays = [...dailyHistory]
    .filter(d => d.completedCount > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sortedDays.length === 0) return 0;

  // Check if streak includes today or yesterday
  const mostRecent = sortedDays[0].date;
  if (mostRecent !== today && mostRecent !== yesterday) {
    return 0; // Streak broken
  }

  let streak = 1;
  let currentDate = new Date(mostRecent + 'T00:00:00');

  for (let i = 1; i < sortedDays.length; i++) {
    currentDate.setDate(currentDate.getDate() - 1);
    const expectedDate = currentDate.toISOString().split('T')[0];

    if (sortedDays[i].date === expectedDate) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Load statistics from localStorage
 */
export const loadStats = (): ProductivityStats => {
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ProductivityStats;
      const cleaned = cleanupOldStats(parsed);
      // Recalculate streak on load
      cleaned.currentStreak = calculateStreak(cleaned.dailyHistory);
      return cleaned;
    }
  } catch (e) {
    console.error('Failed to load statistics:', e);
  }
  return { ...DEFAULT_STATS };
};

/**
 * Save statistics to localStorage
 */
export const saveStats = (stats: ProductivityStats): void => {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save statistics:', e);
  }
};

/**
 * Record a task completion
 */
export const recordCompletion = (
  stats: ProductivityStats,
  taskId: string,
  listId: string
): ProductivityStats => {
  const today = getTodayString();
  const newStats = { ...stats };

  // Update daily history
  const existingDayIndex = newStats.dailyHistory.findIndex(d => d.date === today);
  if (existingDayIndex >= 0) {
    const existingDay = newStats.dailyHistory[existingDayIndex];
    if (!existingDay.taskIds.includes(taskId)) {
      newStats.dailyHistory = [
        ...newStats.dailyHistory.slice(0, existingDayIndex),
        {
          ...existingDay,
          completedCount: existingDay.completedCount + 1,
          taskIds: [...existingDay.taskIds, taskId],
        },
        ...newStats.dailyHistory.slice(existingDayIndex + 1),
      ];
    }
  } else {
    newStats.dailyHistory = [
      ...newStats.dailyHistory,
      { date: today, completedCount: 1, taskIds: [taskId] },
    ];
  }

  // Update list stats
  const existingListStats = newStats.listStats[listId] || {
    listId,
    totalCompleted: 0,
    lastCompletedAt: null,
  };
  newStats.listStats = {
    ...newStats.listStats,
    [listId]: {
      ...existingListStats,
      totalCompleted: existingListStats.totalCompleted + 1,
      lastCompletedAt: Date.now(),
    },
  };

  // Update streak
  newStats.currentStreak = calculateStreak(newStats.dailyHistory);
  newStats.longestStreak = Math.max(newStats.longestStreak, newStats.currentStreak);
  newStats.lastActiveDate = today;

  saveStats(newStats);
  return newStats;
};

/**
 * Record a task uncompletion (undo)
 */
export const recordUncompletion = (
  stats: ProductivityStats,
  taskId: string,
  listId: string
): ProductivityStats => {
  const today = getTodayString();
  const newStats = { ...stats };

  // Update daily history - only remove if completed today
  const existingDayIndex = newStats.dailyHistory.findIndex(d => d.date === today);
  if (existingDayIndex >= 0) {
    const existingDay = newStats.dailyHistory[existingDayIndex];
    if (existingDay.taskIds.includes(taskId)) {
      const newTaskIds = existingDay.taskIds.filter(id => id !== taskId);
      if (newTaskIds.length === 0) {
        // Remove the day entry entirely
        newStats.dailyHistory = [
          ...newStats.dailyHistory.slice(0, existingDayIndex),
          ...newStats.dailyHistory.slice(existingDayIndex + 1),
        ];
      } else {
        newStats.dailyHistory = [
          ...newStats.dailyHistory.slice(0, existingDayIndex),
          {
            ...existingDay,
            completedCount: existingDay.completedCount - 1,
            taskIds: newTaskIds,
          },
          ...newStats.dailyHistory.slice(existingDayIndex + 1),
        ];
      }
    }
  }

  // Update list stats
  const existingListStats = newStats.listStats[listId];
  if (existingListStats && existingListStats.totalCompleted > 0) {
    newStats.listStats = {
      ...newStats.listStats,
      [listId]: {
        ...existingListStats,
        totalCompleted: existingListStats.totalCompleted - 1,
      },
    };
  }

  // Recalculate streak
  newStats.currentStreak = calculateStreak(newStats.dailyHistory);

  saveStats(newStats);
  return newStats;
};

/**
 * Get completions for a specific number of days
 */
export const getCompletionsForDays = (
  stats: ProductivityStats,
  days: number
): { date: string; count: number }[] => {
  const result: { date: string; count: number }[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayStats = stats.dailyHistory.find(d => d.date === dateStr);
    result.push({
      date: dateStr,
      count: dayStats?.completedCount || 0,
    });
  }

  return result;
};

/**
 * Get total completions for today
 */
export const getTodayCompletions = (stats: ProductivityStats): number => {
  const today = getTodayString();
  const dayStats = stats.dailyHistory.find(d => d.date === today);
  return dayStats?.completedCount || 0;
};

/**
 * Get total completions for this week (last 7 days)
 */
export const getWeekCompletions = (stats: ProductivityStats): number => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().split('T')[0];

  return stats.dailyHistory
    .filter(d => d.date >= cutoff)
    .reduce((sum, d) => sum + d.completedCount, 0);
};
