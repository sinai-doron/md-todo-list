export type Task = {
  id: string;
  text: string;
  completed: boolean;
  level: number;
  isHeader?: boolean;
  children?: Task[];
  dueDate?: string; // ISO date string (YYYY-MM-DD)
};
