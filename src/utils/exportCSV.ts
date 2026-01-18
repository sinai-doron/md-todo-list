import type { Task, TaskTag, KanbanStatus } from '../types/Task';

/**
 * Escape a CSV field properly
 * - Wrap in quotes if contains comma, quote, or newline
 * - Escape internal quotes by doubling them
 */
function escapeCSVField(value: string | undefined | null): string {
  if (value === undefined || value === null) return '';

  const str = String(value);

  // Check if escaping is needed
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    // Escape double quotes by doubling them
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return str;
}

/**
 * Generate indent string for CSV
 * Empty string for level 0, ">" for level 1, ">>" for level 2, etc.
 */
function getIndentString(level: number): string {
  if (level === 0) return '';
  return '>'.repeat(level);
}

/**
 * Format priority for display
 */
function formatPriority(priority: string | undefined): string {
  if (!priority) return '';
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

/**
 * Format status for display
 */
function formatStatus(status: KanbanStatus | undefined, completed: boolean): string {
  if (status) return status;
  return completed ? 'done' : 'todo';
}

/**
 * Get tag names from IDs
 */
function getTagNames(tagIds: string[] | undefined, allTags: TaskTag[]): string {
  if (!tagIds || tagIds.length === 0) return '';

  const tagMap = new Map(allTags.map(t => [t.id, t.name]));
  return tagIds
    .map(id => tagMap.get(id))
    .filter(Boolean)
    .join(', ');
}

/**
 * Truncate notes for CSV (first 100 chars)
 */
function truncateNotes(notes: string | undefined): string {
  if (!notes) return '';

  // Remove newlines and extra whitespace
  const cleaned = notes.replace(/\s+/g, ' ').trim();

  if (cleaned.length <= 100) return cleaned;
  return cleaned.substring(0, 97) + '...';
}

interface CSVRow {
  indent: string;
  type: 'Task' | 'Section';
  text: string;
  completed: string;
  dueDate: string;
  priority: string;
  tags: string;
  status: string;
  notes: string;
}

/**
 * Flatten tasks into CSV rows
 */
function flattenTasksToRows(tasks: Task[], allTags: TaskTag[]): CSVRow[] {
  const rows: CSVRow[] = [];

  const traverse = (taskList: Task[], level: number) => {
    for (const task of taskList) {
      rows.push({
        indent: getIndentString(level),
        type: task.isHeader ? 'Section' : 'Task',
        text: task.text,
        completed: task.isHeader ? '' : (task.completed ? 'Yes' : 'No'),
        dueDate: task.dueDate || '',
        priority: formatPriority(task.priority),
        tags: getTagNames(task.tags, allTags),
        status: task.isHeader ? '' : formatStatus(task.status, task.completed),
        notes: truncateNotes(task.notes),
      });

      if (task.children && task.children.length > 0) {
        traverse(task.children, level + 1);
      }
    }
  };

  traverse(tasks, 0);
  return rows;
}

/**
 * CSV column headers
 */
const CSV_HEADERS = [
  'Indent',
  'Type',
  'Text',
  'Completed',
  'Due Date',
  'Priority',
  'Tags',
  'Status',
  'Notes',
];

/**
 * Export tasks to CSV format
 */
export function exportListToCSV(tasks: Task[], allTags: TaskTag[]): string {
  const rows = flattenTasksToRows(tasks, allTags);

  // Build CSV string
  const lines: string[] = [];

  // Header row
  lines.push(CSV_HEADERS.join(','));

  // Data rows
  for (const row of rows) {
    const values = [
      escapeCSVField(row.indent),
      escapeCSVField(row.type),
      escapeCSVField(row.text),
      escapeCSVField(row.completed),
      escapeCSVField(row.dueDate),
      escapeCSVField(row.priority),
      escapeCSVField(row.tags),
      escapeCSVField(row.status),
      escapeCSVField(row.notes),
    ];
    lines.push(values.join(','));
  }

  return lines.join('\n');
}
