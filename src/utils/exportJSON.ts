import type { Task, TaskTag } from '../types/Task';
import type { ExportedList } from '../types/Export';
import { EXPORT_VERSION, EXPORT_FORMAT } from '../types/Export';

/**
 * Collect all unique tag IDs used in the task tree
 */
function collectUsedTagIds(tasks: Task[]): Set<string> {
  const tagIds = new Set<string>();

  const traverse = (taskList: Task[]) => {
    for (const task of taskList) {
      if (task.tags) {
        task.tags.forEach(tagId => tagIds.add(tagId));
      }
      if (task.children) {
        traverse(task.children);
      }
    }
  };

  traverse(tasks);
  return tagIds;
}

/**
 * Filter tags to only include those used by tasks
 */
function filterUsedTags(tasks: Task[], allTags: TaskTag[]): TaskTag[] {
  const usedIds = collectUsedTagIds(tasks);
  return allTags.filter(tag => usedIds.has(tag.id));
}

/**
 * Export a list to JSON format with full metadata
 */
export function exportListToJSON(
  listName: string,
  tasks: Task[],
  allTags: TaskTag[],
  createdAt?: number,
  updatedAt?: number
): ExportedList {
  const now = Date.now();
  const usedTags = filterUsedTags(tasks, allTags);

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    format: EXPORT_FORMAT,
    list: {
      name: listName,
      createdAt: createdAt || now,
      updatedAt: updatedAt || now,
    },
    tasks,
    tags: usedTags,
  };
}

/**
 * Convert exported list to JSON string
 */
export function exportListToJSONString(
  listName: string,
  tasks: Task[],
  allTags: TaskTag[],
  createdAt?: number,
  updatedAt?: number
): string {
  const exportData = exportListToJSON(listName, tasks, allTags, createdAt, updatedAt);
  return JSON.stringify(exportData, null, 2);
}

/**
 * Get summary statistics for the export
 */
export function getExportSummary(tasks: Task[], allTags: TaskTag[]): {
  taskCount: number;
  tagCount: number;
} {
  let taskCount = 0;

  const countTasks = (taskList: Task[]) => {
    for (const task of taskList) {
      if (!task.isHeader) {
        taskCount++;
      }
      if (task.children) {
        countTasks(task.children);
      }
    }
  };

  countTasks(tasks);
  const usedTags = filterUsedTags(tasks, allTags);

  return {
    taskCount,
    tagCount: usedTags.length,
  };
}
