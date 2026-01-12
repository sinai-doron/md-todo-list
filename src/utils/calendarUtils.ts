import type { Task } from '../types/Task';
import type { CalendarDay, CalendarTask, TaskCalendarStatus } from '../types/Calendar';
import type { TodoList } from '../types/TodoList';
import { getTodayString } from './recurrence';

/**
 * Format a Date object to YYYY-MM-DD string
 */
export const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  return formatDateString(date) === getTodayString();
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateString(date1) === formatDateString(date2);
};

/**
 * Get the start of a week (Sunday)
 */
export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get an array of 7 days starting from a date
 */
export const getWeekDays = (startDate: Date): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(day.getDate() + i);
    days.push(day);
  }
  return days;
};

/**
 * Get the month name and year string
 */
export const getMonthYearString = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Get the week range string
 */
export const getWeekRangeString = (startDate: Date): string => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  const year = endDate.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}, ${year}`;
  }
  return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${year}`;
};

/**
 * Get the day string
 */
export const getDayString = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Get task calendar status for coloring
 */
export const getTaskCalendarStatus = (task: Task): TaskCalendarStatus => {
  if (task.completed) return 'completed';
  if (!task.dueDate) return 'upcoming';

  const today = getTodayString();
  if (task.dueDate < today) return 'overdue';
  if (task.dueDate === today) return 'today';
  return 'upcoming';
};

/**
 * Flatten nested tasks into a flat array (excluding headers)
 */
export const flattenTasks = (tasks: Task[], listId?: string, listName?: string): CalendarTask[] => {
  const result: CalendarTask[] = [];

  const traverse = (taskList: Task[]) => {
    taskList.forEach(task => {
      if (!task.isHeader) {
        result.push({ ...task, listId, listName });
      }
      if (task.children && task.children.length > 0) {
        traverse(task.children);
      }
    });
  };

  traverse(tasks);
  return result;
};

/**
 * Get all tasks from all lists
 */
export const getAllTasksFromLists = (lists: { [listId: string]: TodoList }): CalendarTask[] => {
  const allTasks: CalendarTask[] = [];

  Object.entries(lists).forEach(([listId, list]) => {
    const tasks = flattenTasks(list.tasks, listId, list.name);
    allTasks.push(...tasks);
  });

  return allTasks;
};

/**
 * Group tasks by their due date
 */
export const groupTasksByDate = (tasks: CalendarTask[]): Map<string, CalendarTask[]> => {
  const groups = new Map<string, CalendarTask[]>();

  tasks.forEach(task => {
    if (task.dueDate) {
      const existing = groups.get(task.dueDate) || [];
      groups.set(task.dueDate, [...existing, task]);
    }
  });

  return groups;
};

/**
 * Generate calendar days for a month view
 */
export const generateMonthDays = (
  year: number,
  month: number,
  tasksByDate: Map<string, CalendarTask[]>,
  selectedDate?: Date
): CalendarDay[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const days: CalendarDay[] = [];
  const today = getTodayString();
  const selectedString = selectedDate ? formatDateString(selectedDate) : null;

  // Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    const dateString = formatDateString(date);
    days.push({
      date,
      dateString,
      isCurrentMonth: false,
      isToday: dateString === today,
      isSelected: dateString === selectedString,
      tasks: tasksByDate.get(dateString) || [],
    });
  }

  // Current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateString = formatDateString(date);
    days.push({
      date,
      dateString,
      isCurrentMonth: true,
      isToday: dateString === today,
      isSelected: dateString === selectedString,
      tasks: tasksByDate.get(dateString) || [],
    });
  }

  // Next month padding (to complete 6 weeks = 42 days)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    const dateString = formatDateString(date);
    days.push({
      date,
      dateString,
      isCurrentMonth: false,
      isToday: dateString === today,
      isSelected: dateString === selectedString,
      tasks: tasksByDate.get(dateString) || [],
    });
  }

  return days;
};

/**
 * Generate calendar days for a week view
 */
export const generateWeekDays = (
  startDate: Date,
  tasksByDate: Map<string, CalendarTask[]>,
  selectedDate?: Date
): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const today = getTodayString();
  const selectedString = selectedDate ? formatDateString(selectedDate) : null;
  const currentMonth = new Date().getMonth();

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateString = formatDateString(date);

    days.push({
      date,
      dateString,
      isCurrentMonth: date.getMonth() === currentMonth,
      isToday: dateString === today,
      isSelected: dateString === selectedString,
      tasks: tasksByDate.get(dateString) || [],
    });
  }

  return days;
};

/**
 * Get tasks for a specific date
 */
export const getTasksForDate = (
  tasks: CalendarTask[],
  dateString: string
): CalendarTask[] => {
  return tasks.filter(task => task.dueDate === dateString);
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
 * Add weeks to a date
 */
export const addWeeks = (date: Date, weeks: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
};

/**
 * Add days to a date
 */
export const addDaysToDate = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get day names for calendar header
 */
export const getDayNames = (short: boolean = true): string[] => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return short ? days.map(d => d.slice(0, 3)) : days;
};
