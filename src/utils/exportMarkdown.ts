import type { Task } from '../types/Task';

export function exportTasksToMarkdown(tasks: Task[]): string {
  const lines: string[] = [];

  const processTask = (task: Task) => {
    if (task.isHeader) {
      // Convert level back to header markdown
      const headerLevel = task.level + 3; // level 0 = ###, level 1 = ####
      const hashes = '#'.repeat(headerLevel);
      lines.push(`${hashes} ${task.text}`);
      lines.push(''); // Empty line after header
    } else {
      // Convert to bullet point with proper indentation
      // Calculate indentation: each level beyond the parent header needs 2 spaces
      const indentation = '  '.repeat(Math.max(0, task.level - 1));
      // Use checkbox syntax for completed tasks
      const checkbox = task.completed ? '[x]' : '[ ]';
      lines.push(`${indentation}* ${checkbox} ${task.text}`);
    }

    // Process children recursively
    if (task.children && task.children.length > 0) {
      task.children.forEach(child => processTask(child));
      
      // Add empty line after section if it's a header
      if (task.isHeader) {
        lines.push('');
      }
    }
  };

  tasks.forEach(task => processTask(task));

  // Clean up multiple consecutive empty lines
  const markdown = lines.join('\n').replace(/\n{3,}/g, '\n\n');
  
  return markdown.trim();
}

