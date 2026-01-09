// Daily completion record
export type DailyStats = {
  date: string; // YYYY-MM-DD format
  completedCount: number;
  taskIds: string[]; // IDs of tasks completed that day
};

// Per-list statistics
export type ListStats = {
  listId: string;
  totalCompleted: number;
  lastCompletedAt: number | null;
};

// Main statistics storage structure
export type ProductivityStats = {
  dailyHistory: DailyStats[]; // Last 90 days max, rolling window
  listStats: { [listId: string]: ListStats };
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
};

// Default empty statistics
export const DEFAULT_STATS: ProductivityStats = {
  dailyHistory: [],
  listStats: {},
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
};
