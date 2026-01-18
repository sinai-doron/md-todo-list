import type { Task, TaskTag, RecurrenceRule } from '../types/Task';
import { getRecurrenceDescription } from './recurrence';

/**
 * Get tag names from IDs
 */
function getTagNames(tagIds: string[] | undefined, allTags: TaskTag[]): string[] {
  if (!tagIds || tagIds.length === 0) return [];

  const tagMap = new Map(allTags.map(t => [t.id, t.name]));
  return tagIds
    .map(id => tagMap.get(id))
    .filter((name): name is string => Boolean(name));
}

/**
 * Format recurrence rule for inline metadata
 */
function formatRecurrenceForExport(recurrence: RecurrenceRule): string {
  // Use a simplified format for the inline metadata
  const { frequency, interval, daysOfWeek, dayOfMonth, endDate } = recurrence;

  let result: string = frequency;
  if (interval > 1) {
    result = `every-${interval}-${frequency.replace('ly', 's')}`;
  }

  if (daysOfWeek && daysOfWeek.length > 0) {
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    result += `:${daysOfWeek.map(d => dayNames[d]).join('+')}`;
  }

  if (dayOfMonth) {
    result += `:day-${dayOfMonth}`;
  }

  if (endDate) {
    result += `:until-${endDate}`;
  }

  return result;
}

/**
 * Build inline metadata string for a task
 */
function buildMetadataString(task: Task, allTags: TaskTag[]): string {
  const parts: string[] = [];

  // Priority
  if (task.priority) {
    parts.push(`@priority:${task.priority}`);
  }

  // Due date
  if (task.dueDate) {
    parts.push(`@due:${task.dueDate}`);
  }

  // Recurrence
  if (task.isRecurring && task.recurrence) {
    parts.push(`@repeat:${formatRecurrenceForExport(task.recurrence)}`);
  }

  // Tags
  const tagNames = getTagNames(task.tags, allTags);
  if (tagNames.length > 0) {
    // Join tags with commas, replace spaces with hyphens
    const sanitizedTags = tagNames.map(t => t.replace(/\s+/g, '-').toLowerCase());
    parts.push(`@tags:${sanitizedTags.join(',')}`);
  }

  // Status (only if explicitly set and not default)
  if (task.status && task.status !== 'todo' && task.status !== 'done') {
    parts.push(`@status:${task.status}`);
  }

  // Completed timestamp
  if (task.completed && task.completedAt) {
    const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
    parts.push(`@completed:${completedDate}`);
  }

  return parts.join(' ');
}

/**
 * Format notes as blockquote
 */
function formatNotesAsBlockquote(notes: string, indent: string): string {
  const lines = notes.split('\n');
  return lines.map(line => `${indent}> ${line}`).join('\n');
}

/**
 * Export tasks to enhanced Markdown format with inline metadata
 */
export function exportListToEnhancedMarkdown(
  listName: string,
  tasks: Task[],
  allTags: TaskTag[]
): string {
  const lines: string[] = [];

  // List title
  lines.push(`# ${listName}`);
  lines.push('');

  /**
   * Recursively render tasks
   */
  const renderTasks = (taskList: Task[], level: number) => {
    const indent = '  '.repeat(level);

    for (const task of taskList) {
      if (task.isHeader) {
        // Section header
        const headerLevel = Math.min(level + 2, 6); // h2-h6
        lines.push('');
        lines.push(`${'#'.repeat(headerLevel)} ${task.text}`);
        lines.push('');
      } else {
        // Regular task
        const checkbox = task.completed ? '[x]' : '[ ]';
        const metadata = buildMetadataString(task, allTags);
        const metadataSuffix = metadata ? ` ${metadata}` : '';

        lines.push(`${indent}- ${checkbox} ${task.text}${metadataSuffix}`);

        // Add notes as blockquote if present
        if (task.notes) {
          lines.push(formatNotesAsBlockquote(task.notes, indent + '  '));
        }
      }

      // Render children
      if (task.children && task.children.length > 0) {
        renderTasks(task.children, task.isHeader ? level : level + 1);
      }
    }
  };

  renderTasks(tasks, 0);

  // Add metadata legend at the end
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*Metadata syntax: `@priority:high` `@due:YYYY-MM-DD` `@tags:tag1,tag2` `@repeat:daily` `@status:in-progress` `@completed:YYYY-MM-DD`*');

  return lines.join('\n');
}

/**
 * Get human-readable recurrence description for display
 */
export function getRecurrenceDisplayText(recurrence: RecurrenceRule): string {
  return getRecurrenceDescription(recurrence);
}
