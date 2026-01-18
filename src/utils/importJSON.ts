import type { Task, TaskTag } from '../types/Task';
import type { ExportedList, ImportValidationResult, ImportPreview } from '../types/Export';
import { EXPORT_VERSION, EXPORT_FORMAT } from '../types/Export';

/**
 * Validate the structure of an imported JSON file
 */
export function validateImportJSON(content: string): ImportValidationResult {
  const errors: string[] = [];

  // Try to parse JSON
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    return {
      valid: false,
      errors: ['Invalid JSON format. Please ensure the file contains valid JSON.'],
    };
  }

  // Check if it's an object
  if (typeof data !== 'object' || data === null) {
    return {
      valid: false,
      errors: ['Import file must be a JSON object.'],
    };
  }

  const obj = data as Record<string, unknown>;

  // Check format identifier
  if (obj.format !== EXPORT_FORMAT) {
    errors.push(`Invalid file format. Expected "${EXPORT_FORMAT}" but got "${obj.format || 'unknown'}".`);
  }

  // Check version
  if (typeof obj.version !== 'number') {
    errors.push('Missing or invalid version number.');
  } else if (obj.version > EXPORT_VERSION) {
    errors.push(`File version (${obj.version}) is newer than supported version (${EXPORT_VERSION}). Please update the app.`);
  }

  // Check list metadata
  if (!obj.list || typeof obj.list !== 'object') {
    errors.push('Missing list metadata.');
  } else {
    const list = obj.list as Record<string, unknown>;
    if (typeof list.name !== 'string' || !list.name.trim()) {
      errors.push('List name is missing or empty.');
    }
  }

  // Check tasks array
  if (!Array.isArray(obj.tasks)) {
    errors.push('Missing or invalid tasks array.');
  } else {
    // Validate task structure recursively
    const taskErrors = validateTasksStructure(obj.tasks as unknown[]);
    errors.push(...taskErrors);
  }

  // Check tags array
  if (!Array.isArray(obj.tags)) {
    errors.push('Missing or invalid tags array.');
  } else {
    const tagErrors = validateTagsStructure(obj.tags as unknown[]);
    errors.push(...tagErrors);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: data as ExportedList,
  };
}

/**
 * Validate task structure recursively
 */
function validateTasksStructure(tasks: unknown[], path: string = 'tasks'): string[] {
  const errors: string[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const taskPath = `${path}[${i}]`;

    if (typeof task !== 'object' || task === null) {
      errors.push(`${taskPath}: Task must be an object.`);
      continue;
    }

    const t = task as Record<string, unknown>;

    // Required fields
    if (typeof t.id !== 'string') {
      errors.push(`${taskPath}: Missing or invalid task ID.`);
    }
    if (typeof t.text !== 'string') {
      errors.push(`${taskPath}: Missing or invalid task text.`);
    }
    if (typeof t.completed !== 'boolean') {
      errors.push(`${taskPath}: Missing or invalid completed status.`);
    }
    if (typeof t.level !== 'number') {
      errors.push(`${taskPath}: Missing or invalid level.`);
    }

    // Validate children recursively
    if (t.children !== undefined) {
      if (!Array.isArray(t.children)) {
        errors.push(`${taskPath}: Children must be an array.`);
      } else {
        errors.push(...validateTasksStructure(t.children as unknown[], `${taskPath}.children`));
      }
    }
  }

  // Limit errors to first 10 to avoid overwhelming output
  return errors.slice(0, 10);
}

/**
 * Validate tags structure
 */
function validateTagsStructure(tags: unknown[]): string[] {
  const errors: string[] = [];

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];

    if (typeof tag !== 'object' || tag === null) {
      errors.push(`tags[${i}]: Tag must be an object.`);
      continue;
    }

    const t = tag as Record<string, unknown>;

    if (typeof t.id !== 'string') {
      errors.push(`tags[${i}]: Missing or invalid tag ID.`);
    }
    if (typeof t.name !== 'string') {
      errors.push(`tags[${i}]: Missing or invalid tag name.`);
    }
    if (typeof t.color !== 'string') {
      errors.push(`tags[${i}]: Missing or invalid tag color.`);
    }
  }

  return errors.slice(0, 5);
}

/**
 * Generate an import preview from validated data
 */
export function generateImportPreview(
  data: ExportedList,
  existingTags: TaskTag[]
): ImportPreview {
  // Count tasks recursively
  const countTasks = (tasks: Task[]): number => {
    let count = 0;
    for (const task of tasks) {
      if (!task.isHeader) count++;
      if (task.children) count += countTasks(task.children);
    }
    return count;
  };

  // Create a map of existing tags by name (case-insensitive)
  const existingTagsByName = new Map<string, TaskTag>(
    existingTags.map(t => [t.name.toLowerCase(), t])
  );

  // Categorize imported tags
  const newTags: TaskTag[] = [];
  const matchingTags: TaskTag[] = [];

  for (const tag of data.tags) {
    const existing = existingTagsByName.get(tag.name.toLowerCase());
    if (existing) {
      matchingTags.push(existing);
    } else {
      newTags.push(tag);
    }
  }

  return {
    listName: data.list.name,
    taskCount: countTasks(data.tasks),
    tagCount: data.tags.length,
    exportedAt: data.exportedAt,
    newTags,
    existingTags: matchingTags,
  };
}

/**
 * Merge imported tags with existing tags
 * Returns:
 * - updatedTags: The new complete tag list
 * - tagIdMap: A map from old tag IDs to new tag IDs (for updating task references)
 */
export function mergeImportedTags(
  importedTags: TaskTag[],
  existingTags: TaskTag[]
): { updatedTags: TaskTag[]; tagIdMap: Map<string, string> } {
  const tagIdMap = new Map<string, string>();
  const updatedTags = [...existingTags];

  // Create a map of existing tags by name (case-insensitive)
  const existingTagsByName = new Map<string, TaskTag>(
    existingTags.map(t => [t.name.toLowerCase(), t])
  );

  for (const importedTag of importedTags) {
    const existing = existingTagsByName.get(importedTag.name.toLowerCase());

    if (existing) {
      // Map to existing tag ID
      tagIdMap.set(importedTag.id, existing.id);
    } else {
      // Generate new ID for the imported tag
      const newId = `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      tagIdMap.set(importedTag.id, newId);

      // Add new tag with new ID
      updatedTags.push({
        ...importedTag,
        id: newId,
      });

      // Add to lookup map for future duplicates in same import
      existingTagsByName.set(importedTag.name.toLowerCase(), { ...importedTag, id: newId });
    }
  }

  return { updatedTags, tagIdMap };
}

/**
 * Update task tag references with new IDs
 */
export function updateTaskTagReferences(tasks: Task[], tagIdMap: Map<string, string>): Task[] {
  return tasks.map(task => {
    const updatedTask = { ...task };

    // Update tag references
    if (task.tags && task.tags.length > 0) {
      updatedTask.tags = task.tags.map(tagId => tagIdMap.get(tagId) || tagId);
    }

    // Update children recursively
    if (task.children && task.children.length > 0) {
      updatedTask.children = updateTaskTagReferences(task.children, tagIdMap);
    }

    return updatedTask;
  });
}

/**
 * Generate new IDs for all tasks to avoid conflicts
 */
export function regenerateTaskIds(tasks: Task[]): Task[] {
  return tasks.map(task => {
    const newId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const updatedTask: Task = {
      ...task,
      id: newId,
    };

    if (task.children && task.children.length > 0) {
      updatedTask.children = regenerateTaskIds(task.children);
    }

    return updatedTask;
  });
}
