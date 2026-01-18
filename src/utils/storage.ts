import type { StorageData, TodoList } from '../types/TodoList';
import type { TaskTag } from '../types/Task';

const STORAGE_KEY = 'markdown-todo-app-state';
const TAGS_STORAGE_KEY = 'md-tasks-tags';

/**
 * Load all lists from localStorage
 */
export const loadAllLists = (): StorageData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { lists: {}, currentListId: null };
    }
    
    const parsed = JSON.parse(stored) as StorageData;
    
    // Validate structure
    if (!parsed.lists || typeof parsed.lists !== 'object') {
      console.warn('Invalid storage structure, resetting...');
      return { lists: {}, currentListId: null };
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return { lists: {}, currentListId: null };
  }
};

/**
 * Save all lists to localStorage
 */
export const saveAllLists = (data: StorageData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    // Handle quota exceeded or other errors
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      alert('Storage quota exceeded. Please delete some lists to free up space.');
    }
  }
};

/**
 * Load the ID of the last opened list
 */
export const loadCurrentListId = (): string | null => {
  const data = loadAllLists();
  return data.currentListId;
};

/**
 * Save the current list ID
 */
export const saveCurrentListId = (listId: string | null): void => {
  const data = loadAllLists();
  data.currentListId = listId;
  saveAllLists(data);
};

/**
 * Create a new list with default values
 */
export const createNewList = (name: string = 'New List'): TodoList => {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name,
    tasks: [],
    markdown: '',
    isMinimized: false,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Update a specific list in storage
 */
export const updateList = (list: TodoList): void => {
  const data = loadAllLists();
  data.lists[list.id] = {
    ...list,
    updatedAt: Date.now(),
  };
  saveAllLists(data);
};

/**
 * Delete a list from storage
 */
export const deleteList = (listId: string): void => {
  const data = loadAllLists();
  delete data.lists[listId];

  // If we deleted the current list, clear currentListId
  if (data.currentListId === listId) {
    data.currentListId = null;
  }

  saveAllLists(data);
};

/**
 * Load global tags from localStorage
 */
export const loadTags = (): TaskTag[] => {
  try {
    const stored = localStorage.getItem(TAGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load tags from localStorage:', error);
    return [];
  }
};

/**
 * Save global tags to localStorage
 */
export const saveTags = (tags: TaskTag[]): void => {
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  } catch (error) {
    console.error('Failed to save tags to localStorage:', error);
  }
};

