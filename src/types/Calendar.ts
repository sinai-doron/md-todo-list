import type { Task } from './Task';

export type CalendarViewMode = 'list' | 'month' | 'week' | 'day';

export type ListSourceMode = 'current' | 'all';

export type TaskCalendarStatus = 'overdue' | 'today' | 'upcoming' | 'completed';

export interface CalendarTask extends Task {
  listId?: string;
  listName?: string;
}

export interface CalendarDay {
  date: Date;
  dateString: string;        // YYYY-MM-DD format
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  tasks: CalendarTask[];
}

export interface CalendarWeek {
  days: CalendarDay[];
  weekNumber: number;
}
