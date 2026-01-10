/**
 * Recurrence utilities for calculating next due dates
 */

import type { RecurrenceRule } from '../types/Task';

/**
 * Get today's date as YYYY-MM-DD string
 */
export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Parse a date string to a Date object (at midnight local time)
 */
export const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Format a Date to YYYY-MM-DD string
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add weeks to a date
 */
export const addWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, weeks * 7);
};

/**
 * Add months to a date
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Find the next occurrence day for weekly recurrence with specific days
 */
const findNextWeekday = (
  fromDate: Date,
  daysOfWeek: number[],
  interval: number
): Date => {
  if (daysOfWeek.length === 0) {
    // No specific days, just add weeks
    return addWeeks(fromDate, interval);
  }

  const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
  const currentDay = fromDate.getDay();

  // First, check if there's a matching day in the current week (after today)
  for (const day of sortedDays) {
    if (day > currentDay) {
      const daysUntil = day - currentDay;
      return addDays(fromDate, daysUntil);
    }
  }

  // If no day found in current week, go to first day of next interval week(s)
  const daysUntilFirstDay = 7 - currentDay + sortedDays[0] + (interval - 1) * 7;
  return addDays(fromDate, daysUntilFirstDay);
};

/**
 * Calculate the next due date for a recurring task
 *
 * @param currentDueDate - The current due date (or undefined)
 * @param recurrence - The recurrence rule
 * @param completedDate - The date the task was completed (defaults to today)
 * @returns The next due date string, or null if recurrence has ended
 */
export const calculateNextDueDate = (
  _currentDueDate: string | undefined,
  recurrence: RecurrenceRule,
  completedDate?: string
): string | null => {
  const today = getTodayString();
  const completedDateStr = completedDate || today;
  const baseDate = parseDate(completedDateStr);

  // Check if recurrence has ended
  if (recurrence.endDate && completedDateStr >= recurrence.endDate) {
    return null;
  }

  let nextDate: Date;

  switch (recurrence.frequency) {
    case 'daily':
      nextDate = addDays(baseDate, recurrence.interval);
      break;

    case 'weekly':
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        nextDate = findNextWeekday(baseDate, recurrence.daysOfWeek, recurrence.interval);
      } else {
        nextDate = addWeeks(baseDate, recurrence.interval);
      }
      break;

    case 'monthly':
      nextDate = addMonths(baseDate, recurrence.interval);
      // If specific day of month is set, use it
      if (recurrence.dayOfMonth) {
        nextDate.setDate(Math.min(recurrence.dayOfMonth, getDaysInMonth(nextDate)));
      }
      break;

    case 'custom':
      // Custom uses interval as days
      nextDate = addDays(baseDate, recurrence.interval);
      break;

    default:
      nextDate = addDays(baseDate, 1);
  }

  const nextDateStr = formatDate(nextDate);

  // Check if next date is beyond end date
  if (recurrence.endDate && nextDateStr > recurrence.endDate) {
    return null;
  }

  return nextDateStr;
};

/**
 * Get days in a given month
 */
const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

/**
 * Get human-readable description of a recurrence rule
 */
export const getRecurrenceDescription = (recurrence: RecurrenceRule): string => {
  const { frequency, interval, daysOfWeek, dayOfMonth } = recurrence;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  switch (frequency) {
    case 'daily':
      return interval === 1 ? 'Daily' : `Every ${interval} days`;

    case 'weekly':
      const weeklyBase = interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
      if (daysOfWeek && daysOfWeek.length > 0 && daysOfWeek.length < 7) {
        const days = daysOfWeek.sort((a, b) => a - b).map(d => dayNames[d]).join(', ');
        return `${weeklyBase} on ${days}`;
      }
      return weeklyBase;

    case 'monthly':
      const monthlyBase = interval === 1 ? 'Monthly' : `Every ${interval} months`;
      if (dayOfMonth) {
        const suffix = getOrdinalSuffix(dayOfMonth);
        return `${monthlyBase} on the ${dayOfMonth}${suffix}`;
      }
      return monthlyBase;

    case 'custom':
      return `Every ${interval} days`;

    default:
      return 'Recurring';
  }
};

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

/**
 * Check if a task is overdue
 */
export const isOverdue = (dueDate: string | undefined): boolean => {
  if (!dueDate) return false;
  return dueDate < getTodayString();
};

/**
 * Check if a task is due today
 */
export const isDueToday = (dueDate: string | undefined): boolean => {
  if (!dueDate) return false;
  return dueDate === getTodayString();
};

/**
 * Create a default recurrence rule
 */
export const createDefaultRecurrence = (frequency: RecurrenceRule['frequency']): RecurrenceRule => {
  switch (frequency) {
    case 'daily':
      return { frequency: 'daily', interval: 1 };
    case 'weekly':
      return { frequency: 'weekly', interval: 1, daysOfWeek: [new Date().getDay()] };
    case 'monthly':
      return { frequency: 'monthly', interval: 1, dayOfMonth: new Date().getDate() };
    case 'custom':
      return { frequency: 'custom', interval: 1 };
    default:
      return { frequency: 'daily', interval: 1 };
  }
};
