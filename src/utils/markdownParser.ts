import type { Task } from '../types/Task';

export function parseMarkdownToTasks(markdown: string): Task[] {
  const lines = markdown.split('\n');
  const tasks: Task[] = [];
  const stack: { task: Task; level: number }[] = [];
  let lastHeaderLevel = -1;

  lines.forEach((line) => {
    // Skip empty lines and horizontal rules
    if (!line.trim() || line.trim().startsWith('---')) {
      return;
    }

    // Parse headers (### or ####)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headerMatch) {
      const headerLevel = headerMatch[1].length; // 3 for ###, 4 for ####, etc.
      lastHeaderLevel = headerLevel;
      const level = headerLevel - 3; // ### becomes 0, #### becomes 1, etc.
      const text = headerMatch[2].replace(/\*\*/g, ''); // Remove bold markers

      const task: Task = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        level,
        isHeader: true,
        children: [],
      };

      addTaskToHierarchy(task, level, tasks, stack);
      return;
    }

    // Parse bullet points with indentation (with optional checkbox)
    const bulletMatch = line.match(/^(\s*)[*\-+]\s+(.+)/);
    if (bulletMatch) {
      const indentation = bulletMatch[1].length;
      // Bullets under headers: use header level as base, add indentation levels
      const baseLevel = lastHeaderLevel >= 0 ? lastHeaderLevel - 3 : 0;
      const level = baseLevel + 1 + Math.floor(indentation / 2);
      let text = bulletMatch[2];
      let completed = false;

      // Check for checkbox syntax [x] or [ ]
      const checkboxMatch = text.match(/^\[([ x])\]\s+(.+)/);
      if (checkboxMatch) {
        completed = checkboxMatch[1] === 'x';
        text = checkboxMatch[2];
      }

      const task: Task = {
        id: crypto.randomUUID(),
        text,
        completed,
        level,
        children: [],
      };

      addTaskToHierarchy(task, level, tasks, stack);
    }
  });

  return tasks;
}

function addTaskToHierarchy(
  task: Task,
  level: number,
  tasks: Task[],
  stack: { task: Task; level: number }[]
): void {
  // Remove items from stack that are at same or deeper level
  while (stack.length > 0 && stack[stack.length - 1].level >= level) {
    stack.pop();
  }

  if (stack.length === 0) {
    // Top-level task
    tasks.push(task);
  } else {
    // Add as child to the parent at the top of the stack
    const parent = stack[stack.length - 1].task;
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(task);
  }

  // Add current task to stack
  stack.push({ task, level });
}

/**
 * Smart merge: Adds new tasks to existing task list
 * @param existingTasks - The current task list
 * @param newTasks - Tasks parsed from new markdown to add
 * @param parentId - Optional ID of parent task to add under (null = root level)
 * @returns Updated task list with new tasks merged in
 */
export function mergeTasks(
  existingTasks: Task[],
  newTasks: Task[],
  parentId?: string
): Task[] {
  if (newTasks.length === 0) {
    return existingTasks;
  }

  // Helper to adjust levels of tasks and their children
  const adjustLevels = (tasks: Task[], levelOffset: number): Task[] => {
    return tasks.map(task => ({
      ...task,
      level: task.level + levelOffset,
      children: task.children ? adjustLevels(task.children, levelOffset) : undefined,
    }));
  };

  // If no parent, append to root level
  if (!parentId) {
    // Adjust levels to be root level (0)
    const adjustedNewTasks = adjustLevels(newTasks, 0);
    return [...existingTasks, ...adjustedNewTasks];
  }

  // Find parent task and add as children
  const addToParent = (tasks: Task[]): Task[] => {
    return tasks.map(task => {
      if (task.id === parentId) {
        // Found the parent - add new tasks as children
        const parentLevel = task.level;
        const adjustedNewTasks = adjustLevels(newTasks, parentLevel + 1);
        
        return {
          ...task,
          children: [...(task.children || []), ...adjustedNewTasks],
        };
      }
      
      // Recursively search in children
      if (task.children) {
        return {
          ...task,
          children: addToParent(task.children),
        };
      }
      
      return task;
    });
  };

  return addToParent(existingTasks);
}
