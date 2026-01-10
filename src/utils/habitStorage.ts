/**
 * Habit storage utilities for localStorage persistence
 */

import type { Habit, HabitCompletion } from '../types/Habit';
import { getTodayString } from '../types/Habit';

const HABITS_KEY = 'habits';
const COMPLETIONS_KEY = 'habit_completions';

// Rolling window for completion history (365 days)
const MAX_HISTORY_DAYS = 365;

/**
 * Load all habits from localStorage
 */
export const loadHabits = (): Habit[] => {
  try {
    const stored = localStorage.getItem(HABITS_KEY);
    if (stored) {
      return JSON.parse(stored) as Habit[];
    }
  } catch (error) {
    console.error('Error loading habits:', error);
  }
  return [];
};

/**
 * Save all habits to localStorage
 */
export const saveHabits = (habits: Habit[]): void => {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error('Error saving habits:', error);
  }
};

/**
 * Create a new habit
 */
export const createHabit = (habit: Omit<Habit, 'id' | 'createdAt'>): Habit => {
  const newHabit: Habit = {
    ...habit,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  const habits = loadHabits();
  habits.push(newHabit);
  saveHabits(habits);

  return newHabit;
};

/**
 * Update an existing habit
 */
export const updateHabit = (id: string, updates: Partial<Habit>): Habit | null => {
  const habits = loadHabits();
  const index = habits.findIndex(h => h.id === id);

  if (index === -1) return null;

  habits[index] = { ...habits[index], ...updates };
  saveHabits(habits);

  return habits[index];
};

/**
 * Delete a habit (also removes its completions)
 */
export const deleteHabit = (id: string): boolean => {
  const habits = loadHabits();
  const filtered = habits.filter(h => h.id !== id);

  if (filtered.length === habits.length) return false;

  saveHabits(filtered);

  // Also remove completions for this habit
  const completions = loadCompletions();
  const filteredCompletions = completions.filter(c => c.habitId !== id);
  saveCompletions(filteredCompletions);

  return true;
};

/**
 * Archive/unarchive a habit
 */
export const archiveHabit = (id: string, archived: boolean): Habit | null => {
  return updateHabit(id, { isArchived: archived });
};

/**
 * Load all completions from localStorage
 */
export const loadCompletions = (): HabitCompletion[] => {
  try {
    const stored = localStorage.getItem(COMPLETIONS_KEY);
    if (stored) {
      return JSON.parse(stored) as HabitCompletion[];
    }
  } catch (error) {
    console.error('Error loading completions:', error);
  }
  return [];
};

/**
 * Save all completions to localStorage (with cleanup)
 */
export const saveCompletions = (completions: HabitCompletion[]): void => {
  try {
    // Clean up old completions beyond the rolling window
    const cutoffDate = getCutoffDate();
    const filtered = completions.filter(c => c.date >= cutoffDate);
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error saving completions:', error);
  }
};

/**
 * Get the cutoff date for the rolling window
 */
const getCutoffDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - MAX_HISTORY_DAYS);
  return date.toISOString().split('T')[0];
};

/**
 * Record a habit completion
 */
export const recordCompletion = (
  habitId: string,
  date?: string,
  count: number = 1
): HabitCompletion => {
  const completionDate = date || getTodayString();
  const completions = loadCompletions();

  // Check if there's already a completion for this habit on this date
  const existingIndex = completions.findIndex(
    c => c.habitId === habitId && c.date === completionDate
  );

  let completion: HabitCompletion;

  if (existingIndex >= 0) {
    // Update existing completion count
    completion = {
      ...completions[existingIndex],
      count: completions[existingIndex].count + count,
      completedAt: Date.now(),
    };
    completions[existingIndex] = completion;
  } else {
    // Create new completion
    completion = {
      habitId,
      date: completionDate,
      count,
      completedAt: Date.now(),
    };
    completions.push(completion);
  }

  saveCompletions(completions);
  return completion;
};

/**
 * Remove a completion for a habit on a specific date
 */
export const removeCompletion = (habitId: string, date?: string): boolean => {
  const completionDate = date || getTodayString();
  const completions = loadCompletions();
  const filtered = completions.filter(
    c => !(c.habitId === habitId && c.date === completionDate)
  );

  if (filtered.length === completions.length) return false;

  saveCompletions(filtered);
  return true;
};

/**
 * Decrement completion count (for countable habits)
 */
export const decrementCompletion = (habitId: string, date?: string): HabitCompletion | null => {
  const completionDate = date || getTodayString();
  const completions = loadCompletions();
  const index = completions.findIndex(
    c => c.habitId === habitId && c.date === completionDate
  );

  if (index === -1) return null;

  if (completions[index].count <= 1) {
    // Remove the completion entirely
    completions.splice(index, 1);
    saveCompletions(completions);
    return null;
  }

  // Decrement the count
  completions[index] = {
    ...completions[index],
    count: completions[index].count - 1,
    completedAt: Date.now(),
  };

  saveCompletions(completions);
  return completions[index];
};

/**
 * Get completions for a specific habit
 */
export const getHabitCompletions = (habitId: string): HabitCompletion[] => {
  const completions = loadCompletions();
  return completions.filter(c => c.habitId === habitId);
};

/**
 * Get completions for a specific date
 */
export const getCompletionsForDate = (date: string): HabitCompletion[] => {
  const completions = loadCompletions();
  return completions.filter(c => c.date === date);
};

/**
 * Get completion for a specific habit on a specific date
 */
export const getCompletion = (habitId: string, date: string): HabitCompletion | undefined => {
  const completions = loadCompletions();
  return completions.find(c => c.habitId === habitId && c.date === date);
};

/**
 * Check if a habit is completed today
 */
export const isCompletedToday = (habitId: string): boolean => {
  const today = getTodayString();
  const completion = getCompletion(habitId, today);
  return completion !== undefined && completion.count > 0;
};

/**
 * Get today's completion count for a habit
 */
export const getTodayCount = (habitId: string): number => {
  const today = getTodayString();
  const completion = getCompletion(habitId, today);
  return completion?.count || 0;
};

/**
 * Get all completions in a date range
 */
export const getCompletionsInRange = (
  startDate: string,
  endDate: string
): HabitCompletion[] => {
  const completions = loadCompletions();
  return completions.filter(c => c.date >= startDate && c.date <= endDate);
};
