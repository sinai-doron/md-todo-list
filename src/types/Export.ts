import type { Task, TaskTag } from './Task';

export const EXPORT_VERSION = 1;
export const EXPORT_FORMAT = 'md-tasks-export';

export type ExportFormat = 'json' | 'csv' | 'markdown';

export interface ExportedListMetadata {
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface ExportedList {
  version: typeof EXPORT_VERSION;
  exportedAt: string;           // ISO timestamp
  format: typeof EXPORT_FORMAT;
  list: ExportedListMetadata;
  tasks: Task[];                // Full task structure with all metadata
  tags: TaskTag[];              // Only tags used by tasks in this list
}

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  data?: ExportedList;
}

export interface ImportPreview {
  listName: string;
  taskCount: number;
  tagCount: number;
  exportedAt: string;
  newTags: TaskTag[];           // Tags that don't exist yet
  existingTags: TaskTag[];      // Tags that already exist (by name)
}

export type ImportMode = 'new' | 'replace';
