/**
 * Habit and completion types for the Habit Tracker feature
 */

export type HabitFrequency = 'daily' | 'weekly';

export type Habit = {
  id: string;
  name: string;
  description?: string;
  icon?: string;              // Material icon name
  color?: string;             // Hex color for the habit
  createdAt: number;          // Unix timestamp
  isArchived?: boolean;       // Hidden from active view but keeps history
  frequency: HabitFrequency;
  daysOfWeek?: number[];      // 0-6 (Sun-Sat) for weekly habits
  targetPerDay?: number;      // For countable habits (e.g., glasses of water)
};

export type HabitCompletion = {
  habitId: string;
  date: string;               // YYYY-MM-DD format
  count: number;              // Number of completions (usually 1, or count for countable habits)
  completedAt: number;        // Unix timestamp
};

export type HabitWithStats = Habit & {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  todayCount: number;
  totalCompletions: number;
};

/**
 * Predefined habit icons for quick selection
 */
export const HABIT_ICONS = [
  { name: 'fitness_center', label: 'Exercise' },
  { name: 'self_improvement', label: 'Meditation' },
  { name: 'menu_book', label: 'Reading' },
  { name: 'local_drink', label: 'Water' },
  { name: 'bedtime', label: 'Sleep' },
  { name: 'directions_run', label: 'Running' },
  { name: 'restaurant', label: 'Healthy Eating' },
  { name: 'code', label: 'Coding' },
  { name: 'brush', label: 'Creative' },
  { name: 'school', label: 'Learning' },
  { name: 'volunteer_activism', label: 'Gratitude' },
  { name: 'savings', label: 'Finance' },
] as const;

/**
 * Predefined colors for habits
 */
export const HABIT_COLORS = [
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
] as const;

/**
 * Get today's date as YYYY-MM-DD string
 */
export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Get date string for a specific date
 */
export const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Check if a habit is due on a specific day
 */
export const isHabitDueOnDay = (habit: Habit, date: Date): boolean => {
  if (habit.frequency === 'daily') {
    return true;
  }

  if (habit.frequency === 'weekly' && habit.daysOfWeek) {
    const dayOfWeek = date.getDay();
    return habit.daysOfWeek.includes(dayOfWeek);
  }

  return true;
};
