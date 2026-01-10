/**
 * Habit statistics and streak calculation utilities
 */

import type { Habit, HabitCompletion } from '../types/Habit';
import { getTodayString, getDateString, isHabitDueOnDay } from '../types/Habit';

/**
 * Calculate the current streak for a habit
 */
export const calculateStreak = (
  habit: Habit,
  completions: HabitCompletion[]
): number => {
  if (completions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort completions by date descending
  const sortedCompletions = [...completions]
    .filter(c => c.count > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sortedCompletions.length === 0) return 0;

  // Create a set of completed dates for fast lookup
  const completedDates = new Set(sortedCompletions.map(c => c.date));

  let streak = 0;
  let checkDate = new Date(today);

  // Check if today is completed or if it's still due
  const todayStr = getTodayString();
  const isTodayDue = isHabitDueOnDay(habit, today);
  const isTodayCompleted = completedDates.has(todayStr);

  // If today is due but not completed, start checking from yesterday
  if (isTodayDue && !isTodayCompleted) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days with completions
  while (true) {
    const dateStr = getDateString(checkDate);
    const isDue = isHabitDueOnDay(habit, checkDate);

    if (isDue) {
      if (completedDates.has(dateStr)) {
        streak++;
      } else {
        // Streak broken - no completion on a due day
        break;
      }
    }
    // If not a due day, continue checking (skip non-due days)

    checkDate.setDate(checkDate.getDate() - 1);

    // Don't go back more than 365 days
    const daysDiff = Math.floor((today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) break;
  }

  return streak;
};

/**
 * Calculate the longest streak for a habit
 */
export const calculateLongestStreak = (
  habit: Habit,
  completions: HabitCompletion[]
): number => {
  if (completions.length === 0) return 0;

  // Sort completions by date ascending
  const sortedCompletions = [...completions]
    .filter(c => c.count > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sortedCompletions.length === 0) return 0;

  // Create a set of completed dates
  const completedDates = new Set(sortedCompletions.map(c => c.date));

  // Get the date range
  const firstDate = new Date(sortedCompletions[0].date + 'T00:00:00');
  const lastDate = new Date(sortedCompletions[sortedCompletions.length - 1].date + 'T00:00:00');

  let longestStreak = 0;
  let currentStreak = 0;
  let checkDate = new Date(firstDate);

  while (checkDate <= lastDate) {
    const dateStr = getDateString(checkDate);
    const isDue = isHabitDueOnDay(habit, checkDate);

    if (isDue) {
      if (completedDates.has(dateStr)) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    checkDate.setDate(checkDate.getDate() + 1);
  }

  return longestStreak;
};

/**
 * Generate heatmap data for the last 365 days
 */
export type HeatmapData = {
  date: string;
  count: number;
  dayOfWeek: number; // 0-6 (Sun-Sat)
  weekIndex: number;
}[];

export const generateHeatmapData = (
  completions: HabitCompletion[],
  days: number = 365
): HeatmapData => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create a map of date -> total count
  const completionMap = new Map<string, number>();
  completions.forEach(c => {
    const current = completionMap.get(c.date) || 0;
    completionMap.set(c.date, current + c.count);
  });

  const data: HeatmapData = [];

  // Find the start date (go back to Sunday of the week containing `days` ago)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);
  // Adjust to the previous Sunday
  const dayOfStartWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfStartWeek);

  // Generate data for each day
  let weekIndex = 0;
  let currentDay = new Date(startDate);

  while (currentDay <= today) {
    const dateStr = getDateString(currentDay);
    const dayOfWeek = currentDay.getDay();

    data.push({
      date: dateStr,
      count: completionMap.get(dateStr) || 0,
      dayOfWeek,
      weekIndex,
    });

    currentDay.setDate(currentDay.getDate() + 1);

    // Increment week index when we hit Sunday
    if (currentDay.getDay() === 0) {
      weekIndex++;
    }
  }

  return data;
};

/**
 * Get completion rate for a habit
 */
export const calculateCompletionRate = (
  habit: Habit,
  completions: HabitCompletion[],
  days: number = 30
): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dueDays = 0;
  let completedDays = 0;

  const completedDates = new Set(
    completions.filter(c => c.count > 0).map(c => c.date)
  );

  for (let i = 0; i < days; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);

    if (isHabitDueOnDay(habit, checkDate)) {
      dueDays++;
      const dateStr = getDateString(checkDate);
      if (completedDates.has(dateStr)) {
        completedDays++;
      }
    }
  }

  if (dueDays === 0) return 0;
  return Math.round((completedDays / dueDays) * 100);
};

/**
 * Get total completions in a date range
 */
export const getTotalCompletionsInRange = (
  completions: HabitCompletion[],
  startDate: string,
  endDate: string
): number => {
  return completions
    .filter(c => c.date >= startDate && c.date <= endDate)
    .reduce((sum, c) => sum + c.count, 0);
};

/**
 * Get completion data grouped by habit for summary
 */
export type HabitSummary = {
  habitId: string;
  name: string;
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
};

/**
 * Get the color intensity level for a heatmap cell (0-4)
 */
export const getHeatmapIntensity = (count: number): number => {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
};

/**
 * Format a date for display in tooltips
 */
export const formatDateForTooltip = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
