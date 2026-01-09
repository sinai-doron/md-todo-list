import { useState, useCallback, useEffect } from 'react';
import type { ProductivityStats } from '../types/Statistics';
import {
  loadStats,
  recordCompletion,
  recordUncompletion,
  getTodayCompletions,
  getWeekCompletions,
  getCompletionsForDays,
} from '../utils/statisticsStorage';

export interface UseProductivityStatsReturn {
  stats: ProductivityStats;
  recordTaskCompletion: (taskId: string, listId: string) => void;
  recordTaskUncompletion: (taskId: string, listId: string) => void;
  todayCompletions: number;
  weekCompletions: number;
  getChartData: (days: number) => { date: string; count: number }[];
}

export const useProductivityStats = (): UseProductivityStatsReturn => {
  const [stats, setStats] = useState<ProductivityStats>(() => loadStats());

  // Reload stats when component mounts (in case of multiple tabs)
  useEffect(() => {
    setStats(loadStats());
  }, []);

  const recordTaskCompletion = useCallback((taskId: string, listId: string) => {
    setStats(currentStats => recordCompletion(currentStats, taskId, listId));
  }, []);

  const recordTaskUncompletion = useCallback((taskId: string, listId: string) => {
    setStats(currentStats => recordUncompletion(currentStats, taskId, listId));
  }, []);

  const getChartData = useCallback((days: number) => {
    return getCompletionsForDays(stats, days);
  }, [stats]);

  return {
    stats,
    recordTaskCompletion,
    recordTaskUncompletion,
    todayCompletions: getTodayCompletions(stats),
    weekCompletions: getWeekCompletions(stats),
    getChartData,
  };
};
