import type { Task } from './Task';

export type TodoList = {
  id: string;
  name: string;
  tasks: Task[];
  markdown: string;
  isMinimized: boolean;
  createdAt: number;
  updatedAt: number;
};

export type StorageData = {
  lists: {
    [listId: string]: TodoList;
  };
  currentListId: string | null;
};

