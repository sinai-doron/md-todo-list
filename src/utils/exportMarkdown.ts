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
      // Each level gets 2 spaces of indentation
      const indentation = '  '.repeat(task.level);
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

export function exportSingleTaskToMarkdown(task: Task): string {
  const lines: string[] = [];

  const processTask = (currentTask: Task, baseLevel: number) => {
    if (currentTask.isHeader) {
      // Convert level back to header markdown, adjusted relative to the base level
      const relativeLevel = currentTask.level - baseLevel;
      const headerLevel = relativeLevel + 3; // level 0 = ###, level 1 = ####
      const hashes = '#'.repeat(headerLevel);
      lines.push(`${hashes} ${currentTask.text}`);
      lines.push(''); // Empty line after header
    } else {
      // Convert to bullet point with proper indentation
      // Calculate indentation relative to the base level
      const relativeLevel = currentTask.level - baseLevel;
      const indentation = '  '.repeat(relativeLevel);
      // Use checkbox syntax for completed tasks
      const checkbox = currentTask.completed ? '[x]' : '[ ]';
      lines.push(`${indentation}* ${checkbox} ${currentTask.text}`);
    }

    // Process children recursively
    if (currentTask.children && currentTask.children.length > 0) {
      currentTask.children.forEach(child => processTask(child, baseLevel));
      
      // Add empty line after section if it's a header
      if (currentTask.isHeader) {
        lines.push('');
      }
    }
  };

  // Process the single task and its children, using its level as the base
  processTask(task, task.level);

  // Clean up multiple consecutive empty lines
  const markdown = lines.join('\n').replace(/\n{3,}/g, '\n\n');
  
  return markdown.trim();
}

