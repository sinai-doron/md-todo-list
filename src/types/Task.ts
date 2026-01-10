export type KanbanStatus = 'todo' | 'in-progress' | 'done';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export type RecurrenceRule = {
  frequency: RecurrenceFrequency;
  interval: number;           // Every N days/weeks/months
  daysOfWeek?: number[];      // 0-6 (Sun-Sat) for weekly recurrence
  dayOfMonth?: number;        // 1-31 for monthly recurrence
  endDate?: string;           // Optional end date (YYYY-MM-DD)
};

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  level: number;
  isHeader?: boolean;
  children?: Task[];
  dueDate?: string;           // ISO date string (YYYY-MM-DD)
  completedAt?: number;       // Unix timestamp when task was completed
  status?: KanbanStatus;      // Kanban column status
  recurrence?: RecurrenceRule; // Recurring task configuration
  isRecurring?: boolean;      // Flag for recurring tasks
  lastCompletedDate?: string; // Last completion date for recurring tasks
};

/**
 * Get the Kanban status for a task.
 * If explicit status is set, use it. Otherwise derive from completed state.
 */
export const getTaskStatus = (task: Task): KanbanStatus => {
  if (task.status) return task.status;
  return task.completed ? 'done' : 'todo';
};

/**
 * Count total and completed subtasks recursively
 */
export const countSubtasks = (task: Task): { total: number; completed: number } => {
  let total = 0;
  let completed = 0;

  const count = (children: Task[] | undefined) => {
    if (!children) return;
    for (const child of children) {
      if (!child.isHeader) {
        total++;
        if (child.completed) completed++;
      }
      count(child.children);
    }
  };

  count(task.children);
  return { total, completed };
};
