import { useState, useEffect, useCallback } from 'react';
import type { Habit, HabitCompletion, HabitWithStats } from '../types/Habit';
import { getTodayString, isHabitDueOnDay } from '../types/Habit';
import {
  loadHabits,
  createHabit as createHabitStorage,
  updateHabit as updateHabitStorage,
  deleteHabit as deleteHabitStorage,
  archiveHabit as archiveHabitStorage,
  loadCompletions,
  recordCompletion,
  removeCompletion,
  getHabitCompletions,
  getTodayCount,
} from '../utils/habitStorage';
import {
  calculateStreak,
  calculateLongestStreak,
} from '../utils/habitStats';

interface UseHabitsReturn {
  habits: HabitWithStats[];
  activeHabits: HabitWithStats[];
  todaysHabits: HabitWithStats[];
  archivedHabits: HabitWithStats[];
  completions: HabitCompletion[];
  isLoading: boolean;
  createHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Habit;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string, archived: boolean) => void;
  toggleHabitCompletion: (habitId: string, date?: string) => void;
  incrementHabitCompletion: (habitId: string, date?: string) => void;
  decrementHabitCompletion: (habitId: string, date?: string) => void;
  refreshHabits: () => void;
}

export const useHabits = (): UseHabitsReturn => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadedHabits = loadHabits();
    const loadedCompletions = loadCompletions();
    setHabits(loadedHabits);
    setCompletions(loadedCompletions);
    setIsLoading(false);
  }, []);

  // Refresh data from storage
  const refreshHabits = useCallback(() => {
    const loadedHabits = loadHabits();
    const loadedCompletions = loadCompletions();
    setHabits(loadedHabits);
    setCompletions(loadedCompletions);
  }, []);

  // Calculate stats for a single habit
  const calculateHabitStats = useCallback((habit: Habit): HabitWithStats => {
    const habitCompletions = getHabitCompletions(habit.id);
    const todayCount = getTodayCount(habit.id);

    return {
      ...habit,
      currentStreak: calculateStreak(habit, habitCompletions),
      longestStreak: calculateLongestStreak(habit, habitCompletions),
      completedToday: todayCount > 0,
      todayCount,
      totalCompletions: habitCompletions.reduce((sum, c) => sum + c.count, 0),
    };
  }, []);

  // Habits with stats
  const habitsWithStats: HabitWithStats[] = habits.map(calculateHabitStats);

  // Filter active (non-archived) habits
  const activeHabits = habitsWithStats.filter(h => !h.isArchived);

  // Filter habits due today
  const todaysHabits = activeHabits.filter(h => {
    const today = new Date();
    return isHabitDueOnDay(h, today);
  });

  // Archived habits
  const archivedHabits = habitsWithStats.filter(h => h.isArchived);

  // Create a new habit
  const handleCreateHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt'>): Habit => {
    const newHabit = createHabitStorage(habitData);
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, []);

  // Update a habit
  const handleUpdateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    const updatedHabit = updateHabitStorage(id, updates);
    if (updatedHabit) {
      setHabits(prev => prev.map(h => h.id === id ? updatedHabit : h));
    }
  }, []);

  // Delete a habit
  const handleDeleteHabit = useCallback((id: string) => {
    const success = deleteHabitStorage(id);
    if (success) {
      setHabits(prev => prev.filter(h => h.id !== id));
      setCompletions(prev => prev.filter(c => c.habitId !== id));
    }
  }, []);

  // Archive/unarchive a habit
  const handleArchiveHabit = useCallback((id: string, archived: boolean) => {
    const updatedHabit = archiveHabitStorage(id, archived);
    if (updatedHabit) {
      setHabits(prev => prev.map(h => h.id === id ? updatedHabit : h));
    }
  }, []);

  // Toggle habit completion for a date (complete/uncomplete)
  const handleToggleHabitCompletion = useCallback((habitId: string, date?: string) => {
    const completionDate = date || getTodayString();
    const existingCompletion = completions.find(
      c => c.habitId === habitId && c.date === completionDate
    );

    if (existingCompletion && existingCompletion.count > 0) {
      // Remove completion
      removeCompletion(habitId, completionDate);
      setCompletions(prev => prev.filter(
        c => !(c.habitId === habitId && c.date === completionDate)
      ));
    } else {
      // Add completion
      const newCompletion = recordCompletion(habitId, completionDate, 1);
      setCompletions(prev => {
        const filtered = prev.filter(
          c => !(c.habitId === habitId && c.date === completionDate)
        );
        return [...filtered, newCompletion];
      });
    }
  }, [completions]);

  // Increment habit completion count
  const handleIncrementHabitCompletion = useCallback((habitId: string, date?: string) => {
    const completionDate = date || getTodayString();
    const newCompletion = recordCompletion(habitId, completionDate, 1);
    setCompletions(prev => {
      const filtered = prev.filter(
        c => !(c.habitId === habitId && c.date === completionDate)
      );
      return [...filtered, newCompletion];
    });
  }, []);

  // Decrement habit completion count
  const handleDecrementHabitCompletion = useCallback((habitId: string, date?: string) => {
    const completionDate = date || getTodayString();
    const existingCompletion = completions.find(
      c => c.habitId === habitId && c.date === completionDate
    );

    if (!existingCompletion || existingCompletion.count <= 0) return;

    if (existingCompletion.count === 1) {
      // Remove completion entirely
      removeCompletion(habitId, completionDate);
      setCompletions(prev => prev.filter(
        c => !(c.habitId === habitId && c.date === completionDate)
      ));
    } else {
      // Decrement count
      const updated = {
        ...existingCompletion,
        count: existingCompletion.count - 1,
      };
      setCompletions(prev => prev.map(c =>
        c.habitId === habitId && c.date === completionDate ? updated : c
      ));
    }
  }, [completions]);

  return {
    habits: habitsWithStats,
    activeHabits,
    todaysHabits,
    archivedHabits,
    completions,
    isLoading,
    createHabit: handleCreateHabit,
    updateHabit: handleUpdateHabit,
    deleteHabit: handleDeleteHabit,
    archiveHabit: handleArchiveHabit,
    toggleHabitCompletion: handleToggleHabitCompletion,
    incrementHabitCompletion: handleIncrementHabitCompletion,
    decrementHabitCompletion: handleDecrementHabitCompletion,
    refreshHabits,
  };
};
