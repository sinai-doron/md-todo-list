import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { usePageTracking } from './hooks/useAnalytics';
import styled from 'styled-components';
import { MarkdownInput } from './components/MarkdownInput';
import { TodoList } from './components/TodoList';
import { Sidebar } from './components/Sidebar';
import { MarkdownVisualizerPage } from './pages/MarkdownVisualizerPage';
import { ProductivityDashboard } from './components/ProductivityDashboard';
import { SEO } from './components/SEO';
import type { Task } from './types/Task';
import type { TodoList as TodoListType } from './types/TodoList';
import { parseMarkdownToTasks, mergeTasks } from './utils/markdownParser';
import { exportTasksToMarkdown } from './utils/exportMarkdown';
import {
  loadAllLists,
  saveAllLists,
  createNewList,
} from './utils/storage';
import { useProductivityStats } from './hooks/useProductivityStats';
import {
  trackListCreated,
  trackListSwitched,
  trackListDeleted,
  trackListRenamed,
  trackTaskCompleted,
  trackTaskUncompleted,
  trackTaskUpdated,
  trackTaskDeleted,
  trackSubtaskAdded,
  trackTaskCreated,
  trackSectionAdded,
  trackTaskMoved,
  trackUndoAction,
  trackMarkdownExported,
  trackMarkdownDownloaded,
  trackMarkdownImported,
  trackBulkTasksAdded,
  trackEditorToggled,
  trackHideCompletedToggled,
  trackSearchUsed,
  trackMarkdownVisualizerOpened,
} from './utils/analytics';

const AppContainer = styled.div`
  min-height: 100vh;
  background-image: url('/forest-road.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  padding: 40px 20px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 0;
  }
`;

const MainWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
  color: white;
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: 36px;
  font-weight: 600;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
`;

const VisualizerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  .material-symbols-outlined {
    font-size: 20px;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const Attribution = styled.a`
  position: fixed;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  text-decoration: none;
  z-index: 1000;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    font-size: 11px;
    padding: 6px 10px;
    bottom: 12px;
    left: 12px;
  }
`;

const GitHubLink = styled.a`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: white;
  padding: 12px;
  border-radius: 50%;
  text-decoration: none;
  z-index: 1000;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translateY(-2px) rotate(360deg);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    top: 16px;
    right: 16px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

function TodoApp() {
  const navigate = useNavigate();

  // Multi-list state
  const [lists, setLists] = useState<{ [listId: string]: TodoListType }>({});
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Productivity statistics
  const { stats, recordTaskCompletion, recordTaskUncompletion } = useProductivityStats();
  
  // Undo history state
  const [taskHistory, setTaskHistory] = useState<Array<{ tasks: Task[]; timestamp: number }>>([]);
  const [canUndo, setCanUndo] = useState(false);
  
  // Current list state (derived from lists and currentListId)
  const currentList = currentListId ? lists[currentListId] : null;
  
  // Refs to track sync source and prevent infinite loops
  const isUpdatingFromMarkdown = useRef(false);
  const isUpdatingFromTasks = useRef(false);
  const debounceTimer = useRef<number | null>(null);
  const saveTimer = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  // Load all lists from localStorage on mount
  useEffect(() => {
    const storedData = loadAllLists();
    
    if (Object.keys(storedData.lists).length === 0) {
      // First time user - create a default list
      const defaultList = createNewList('My First List');
      storedData.lists[defaultList.id] = defaultList;
      storedData.currentListId = defaultList.id;
      saveAllLists(storedData);
    }
    
    setLists(storedData.lists);
    setCurrentListId(storedData.currentListId);
    isInitialMount.current = false;
  }, []);

  // Save to localStorage whenever state changes (debounced)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      return;
    }

    // Clear existing timer
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    // Debounce saves to avoid excessive writes
    saveTimer.current = window.setTimeout(() => {
      saveAllLists({ lists, currentListId });
    }, 300);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [lists, currentListId]);

  // Sync markdown → tasks for current list (with debouncing)
  useEffect(() => {
    if (!currentList) return;

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new debounced timer
    debounceTimer.current = window.setTimeout(() => {
      // Only proceed if this change didn't come from tasks being updated
      if (isUpdatingFromTasks.current) {
        isUpdatingFromTasks.current = false;
        return;
      }

      if (currentList.markdown.trim()) {
        isUpdatingFromMarkdown.current = true;
        const parsedTasks = parseMarkdownToTasks(currentList.markdown);
        
        // Update the current list
        setLists((prevLists) => {
          const prevListData = prevLists[currentList.id];
          const shouldMinimize = prevListData.tasks.length === 0 && parsedTasks.length > 0;
          
          return {
            ...prevLists,
            [currentList.id]: {
              ...prevListData,
              tasks: parsedTasks,
              isMinimized: shouldMinimize ? true : prevListData.isMinimized,
              updatedAt: Date.now(),
            },
          };
        });
      } else {
        // If markdown is empty, clear tasks
        isUpdatingFromMarkdown.current = true;
        setLists((prevLists) => ({
          ...prevLists,
          [currentList.id]: {
            ...prevLists[currentList.id],
            tasks: [],
            updatedAt: Date.now(),
          },
        }));
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [currentList?.markdown, currentList?.id]);

  // Sync tasks → markdown for current list
  useEffect(() => {
    if (!currentList) return;

    if (isUpdatingFromMarkdown.current) {
      isUpdatingFromMarkdown.current = false;
      return;
    }

    isUpdatingFromTasks.current = true;
    const newMarkdown = exportTasksToMarkdown(currentList.tasks);
    
    setLists((prevLists) => ({
      ...prevLists,
      [currentList.id]: {
        ...prevLists[currentList.id],
        markdown: newMarkdown,
        updatedAt: Date.now(),
      },
    }));
  }, [currentList?.tasks, currentList?.id]);

  // List management handlers
  const handleCreateList = () => {
    const newList = createNewList('New List');
    setLists((prev) => ({ ...prev, [newList.id]: newList }));
    setCurrentListId(newList.id);
    trackListCreated();
  };

  const handleSwitchList = (listId: string) => {
    setCurrentListId(listId);
    trackListSwitched();
  };

  const handleDeleteList = (listId: string) => {
    setLists((prev) => {
      const updated = { ...prev };
      delete updated[listId];
      return updated;
    });

    trackListDeleted();

    // If we deleted the current list, switch to another one
    if (currentListId === listId) {
      const remainingListIds = Object.keys(lists).filter(id => id !== listId);
      if (remainingListIds.length > 0) {
        setCurrentListId(remainingListIds[0]);
      } else {
        // No lists left, create a new one
        const newList = createNewList('My First List');
        setLists({ [newList.id]: newList });
        setCurrentListId(newList.id);
      }
    }
  };

  const handleListNameChange = (name: string) => {
    if (!currentListId) return;
    
    setLists((prev) => ({
      ...prev,
      [currentListId]: {
        ...prev[currentListId],
        name,
        updatedAt: Date.now(),
      },
    }));
    trackListRenamed();
  };

  const handleMarkdownChange = (newMarkdown: string) => {
    if (!currentListId) return;
    
    setLists((prev) => ({
      ...prev,
      [currentListId]: {
        ...prev[currentListId],
        markdown: newMarkdown,
        updatedAt: Date.now(),
      },
    }));
  };

  const handleToggleMinimize = () => {
    if (!currentListId) return;
    
    setLists((prev) => {
      const newIsMinimized = !prev[currentListId].isMinimized;
      trackEditorToggled(newIsMinimized);
      return {
        ...prev,
        [currentListId]: {
          ...prev[currentListId],
          isMinimized: newIsMinimized,
        },
      };
    });
  };

  // Task management helpers
  const updateCurrentListTasks = (updater: (tasks: Task[]) => Task[]) => {
    if (!currentListId) return;
    
    setLists((prev) => ({
      ...prev,
      [currentListId]: {
        ...prev[currentListId],
        tasks: updater(prev[currentListId].tasks),
        updatedAt: Date.now(),
      },
    }));
  };

  const updateTasksRecursively = (
    taskList: Task[],
    updater: (task: Task) => Task
  ): Task[] => {
    return taskList.map((task) => {
      const updatedTask = updater(task);
      if (updatedTask.children && updatedTask.children.length > 0) {
        return {
          ...updatedTask,
          children: updateTasksRecursively(updatedTask.children, updater),
        };
      }
      return updatedTask;
    });
  };

  const handleToggle = (id: string) => {
    if (!currentListId) return;

    updateCurrentListTasks((prevTasks) => {
      // First, find the task to determine its new completed state
      let newCompletedState = false;
      const findTask = (tasks: Task[]): Task | null => {
        for (const task of tasks) {
          if (task.id === id) return task;
          if (task.children) {
            const found = findTask(task.children);
            if (found) return found;
          }
        }
        return null;
      };

      const targetTask = findTask(prevTasks);
      if (targetTask) {
        newCompletedState = !targetTask.completed;
        // Track completion or uncompletion
        if (newCompletedState) {
          trackTaskCompleted();
          // Record in productivity stats (only for non-header tasks)
          if (!targetTask.isHeader) {
            recordTaskCompletion(id, currentListId);
          }
        } else {
          trackTaskUncompleted();
          // Record uncompletion in productivity stats
          if (!targetTask.isHeader) {
            recordTaskUncompletion(id, currentListId);
          }
        }
      }

      // Helper to mark a task and all its children with the same completed state
      const markTaskAndChildren = (task: Task, completed: boolean): Task => {
        const completedAt = completed ? Date.now() : undefined;
        const updatedTask = { ...task, completed, completedAt };
        if (updatedTask.children && updatedTask.children.length > 0) {
          updatedTask.children = updatedTask.children.map(child =>
            markTaskAndChildren(child, completed)
          );
        }
        return updatedTask;
      };

      return updateTasksRecursively(prevTasks, (task) => {
        if (task.id === id) {
          return markTaskAndChildren(task, newCompletedState);
        }
        return task;
      });
    });
  };

  const handleUpdate = (id: string, text: string) => {
    if (!currentListId) return;
    
    // Save current state to history before making changes
    const currentTasks = lists[currentListId].tasks;
    setTaskHistory(prev => [...prev.slice(-19), { tasks: currentTasks, timestamp: Date.now() }]);
    setCanUndo(true);
    
    trackTaskUpdated();
    
    updateCurrentListTasks((prevTasks) =>
      updateTasksRecursively(prevTasks, (task) =>
        task.id === id ? { ...task, text } : task
      )
    );
  };

  const removeTaskById = (taskList: Task[], id: string): Task[] => {
    return taskList
      .filter((task) => task.id !== id)
      .map((task) => ({
        ...task,
        children: task.children ? removeTaskById(task.children, id) : undefined,
      }));
  };

  const handleDelete = (id: string) => {
    if (!currentListId) return;
    
    // Save current state to history before making changes
    const currentTasks = lists[currentListId].tasks;
    setTaskHistory(prev => [...prev.slice(-19), { tasks: currentTasks, timestamp: Date.now() }]);
    setCanUndo(true);
    
    trackTaskDeleted();
    
    updateCurrentListTasks((prevTasks) => removeTaskById(prevTasks, id));
  };

  const addSubtaskToParent = (taskList: Task[], parentId: string): Task[] => {
    return taskList.map((task) => {
      if (task.id === parentId) {
        const newSubtask: Task = {
          id: crypto.randomUUID(),
          text: 'New subtask',
          completed: false,
          level: task.level + 1,
          children: [],
        };
        return {
          ...task,
          children: [...(task.children || []), newSubtask],
        };
      }
      if (task.children) {
        return {
          ...task,
          children: addSubtaskToParent(task.children, parentId),
        };
      }
      return task;
    });
  };

  const handleAddSubtask = (parentId: string) => {
    trackSubtaskAdded();
    updateCurrentListTasks((prevTasks) => addSubtaskToParent(prevTasks, parentId));
  };

  const handleAddRootTask = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: 'New task',
      completed: false,
      level: 0,
      children: [],
    };
    trackTaskCreated('manual');
    updateCurrentListTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleAddSection = () => {
    const newSection: Task = {
      id: crypto.randomUUID(),
      text: 'New Section',
      completed: false,
      level: 0,
      isHeader: true,
      children: [],
    };
    trackSectionAdded();
    updateCurrentListTasks((prevTasks) => [...prevTasks, newSection]);
  };

  const handleMoveTask = (
    draggedId: string,
    targetId: string,
    position: 'before' | 'after' | 'inside'
  ) => {
    if (!currentListId) return;
    
    // Save current state to history before making changes
    const currentTasks = lists[currentListId].tasks;
    setTaskHistory(prev => [...prev.slice(-19), { tasks: currentTasks, timestamp: Date.now() }]);
    setCanUndo(true);
    
    trackTaskMoved();
    
    updateCurrentListTasks((prevTasks) => {
      // Deep clone to avoid mutations
      const clonedTasks = JSON.parse(JSON.stringify(prevTasks)) as Task[];
      
      // Find and extract the dragged task
      let draggedTask: Task | null = null;
      
      const extractTask = (taskList: Task[]): Task[] => {
        const newList: Task[] = [];
        for (const task of taskList) {
          if (task.id === draggedId) {
            draggedTask = { ...task };
          } else {
            const newTask = { ...task };
            if (newTask.children) {
              newTask.children = extractTask(newTask.children);
            }
            newList.push(newTask);
          }
        }
        return newList;
      };

      const tasksWithoutDragged = extractTask(clonedTasks);
      
      if (!draggedTask) return prevTasks;

      // Helper to recursively update levels of a task and its children
      const updateLevels = (task: Task, newLevel: number): Task => {
        const updated = { ...task, level: newLevel };
        if (updated.children) {
          updated.children = updated.children.map(child => 
            updateLevels(child, newLevel + 1)
          );
        }
        return updated;
      };

      // Track if we've inserted the task
      let inserted = false;

      // Insert the task at the new position
      const insertTask = (taskList: Task[]): Task[] => {
        const result: Task[] = [];
        
        for (let i = 0; i < taskList.length; i++) {
          const task = taskList[i];
          
          if (task.id === targetId && !inserted) {
            inserted = true;
            if (position === 'before') {
              result.push(updateLevels(draggedTask!, task.level));
              result.push(task);
            } else if (position === 'after') {
              result.push(task);
              result.push(updateLevels(draggedTask!, task.level));
            } else if (position === 'inside') {
              // Add as child
              const updatedTask = {
                ...task,
                children: [
                  ...(task.children || []),
                  updateLevels(draggedTask!, task.level + 1)
                ],
              };
              result.push(updatedTask);
            }
          } else {
            // Check children recursively if not inserted yet
            if (task.children && task.children.length > 0 && !inserted) {
              const updatedChildren = insertTask(task.children);
              result.push({ ...task, children: updatedChildren });
            } else {
              result.push(task);
            }
          }
        }
        
        return result;
      };

      return insertTask(tasksWithoutDragged);
    });
  };

  const handleUndo = () => {
    if (!currentListId || taskHistory.length === 0) return;
    
    const lastState = taskHistory[taskHistory.length - 1];
    
    trackUndoAction();
    
    setLists((prev) => ({
      ...prev,
      [currentListId]: {
        ...prev[currentListId],
        tasks: lastState.tasks,
        updatedAt: Date.now(),
      },
    }));
    
    setTaskHistory(prev => prev.slice(0, -1));
    setCanUndo(taskHistory.length > 1);
  };

  const handleExport = async () => {
    if (!currentList) return;
    
    try {
      await navigator.clipboard.writeText(currentList.markdown);
      trackMarkdownExported();
      alert('✅ Markdown copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentList.markdown;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        trackMarkdownExported();
        alert('✅ Markdown copied to clipboard!');
      } catch (e) {
        alert('❌ Failed to copy to clipboard. Please try again.');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownload = () => {
    if (!currentList) return;
    
    // Create a blob with the markdown content
    const blob = new Blob([currentList.markdown], { type: 'text/markdown' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename from list name (sanitize it)
    const sanitizedName = currentList.name
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    link.download = `${sanitizedName}.md`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    trackMarkdownDownloaded();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportMarkdown = (file: File) => {
    if (!currentListId) return;

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.md') && !fileName.endsWith('.txt')) {
      alert('❌ Invalid file type. Please select a .md or .txt file.');
      trackMarkdownImported(false);
      return;
    }

    // Validate file size (max 1MB)
    const maxSize = 1048576; // 1MB in bytes
    if (file.size > maxSize) {
      alert('❌ File is too large. Maximum file size is 1MB.');
      trackMarkdownImported(false);
      return;
    }

    // Read file content
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (content !== undefined) {
        // Update markdown content
        setLists((prev) => ({
          ...prev,
          [currentListId]: {
            ...prev[currentListId],
            markdown: content,
            isMinimized: true, // Auto-minimize after import
            updatedAt: Date.now(),
          },
        }));
        trackMarkdownImported(true);
      }
    };

    reader.onerror = () => {
      alert('❌ Failed to read file. Please try again.');
      trackMarkdownImported(false);
    };

    reader.readAsText(file);
  };

  const handleAddTasksFromMarkdown = (markdown: string, parentId?: string) => {
    if (!currentListId) return;

    // Parse the new markdown into tasks
    const newTasks = parseMarkdownToTasks(markdown);
    
    if (newTasks.length === 0) {
      return;
    }

    // Save current state to history before making changes
    const currentTasks = lists[currentListId].tasks;
    setTaskHistory(prev => [...prev.slice(-19), { tasks: currentTasks, timestamp: Date.now() }]);
    setCanUndo(true);

    trackBulkTasksAdded(newTasks.length, 'markdown');

    // Merge the new tasks with existing tasks
    const mergedTasks = mergeTasks(currentTasks, newTasks, parentId);

    // Update the task list
    updateCurrentListTasks(() => mergedTasks);
  };

  const handleQuickAddTask = (text: string) => {
    if (!currentListId || !text.trim()) return;

    // Save current state to history before making changes
    const currentTasks = lists[currentListId].tasks;
    setTaskHistory(prev => [...prev.slice(-19), { tasks: currentTasks, timestamp: Date.now() }]);
    setCanUndo(true);

    trackTaskCreated('quick');

    // Create a new task at the root level
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      level: 0,
      children: [],
    };

    // Add the task to the list
    updateCurrentListTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleUpdateDueDate = (id: string, dueDate: string | undefined) => {
    trackTaskUpdated();

    updateCurrentListTasks((prevTasks) =>
      updateTasksRecursively(prevTasks, (task) =>
        task.id === id ? { ...task, dueDate } : task
      )
    );
  };

  // Filter tasks by search query
  const filterTasksBySearch = (tasks: Task[], query: string): Task[] => {
    if (!query.trim()) return tasks;
    
    const lowerQuery = query.toLowerCase();
    
    const filterRecursive = (taskList: Task[]): Task[] => {
      return taskList.reduce((acc: Task[], task) => {
        const textMatch = task.text.toLowerCase().includes(lowerQuery);
        const filteredChildren = task.children ? filterRecursive(task.children) : [];
        
        // Include task if it matches OR has matching children
        if (textMatch || filteredChildren.length > 0) {
          acc.push({
            ...task,
            children: filteredChildren.length > 0 ? filteredChildren : task.children,
          });
        }
        
        return acc;
      }, []);
    };
    
    return filterRecursive(tasks);
  };

  // Handler wrappers with analytics tracking
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      trackSearchUsed(query.length);
    }
  };

  const handleToggleHideCompleted = () => {
    const newValue = !hideCompleted;
    setHideCompleted(newValue);
    trackHideCompletedToggled(newValue);
  };

  // Don't render until we've loaded from storage
  if (isInitialMount.current) {
    return null;
  }

  return (
    <AppContainer>
      <SEO
        title="MD Tasks - Markdown Todo List Manager"
        description="Create and manage interactive task lists from markdown files. Convert MD files to todos, track progress, and boost productivity with our free online tool."
        canonical="/"
        keywords="md tasks, markdown todo list, task manager, markdown tasks, productivity tool"
      />
      <MainWrapper>
        <Header>
          <Title>Markdown Todo List</Title>
          <Subtitle>Transform your markdown into an interactive todo list</Subtitle>
          <HeaderActions>
            <VisualizerButton onClick={() => setIsDashboardOpen(true)}>
              <span className="material-symbols-outlined">insights</span>
              Productivity
            </VisualizerButton>
            <VisualizerButton
              onClick={() => {
                trackMarkdownVisualizerOpened();
                navigate('/visualizer');
              }}
            >
              <span className="material-symbols-outlined">preview</span>
              Markdown Visualizer
            </VisualizerButton>
          </HeaderActions>
        </Header>
        <ContentContainer>
          <Sidebar
            lists={lists}
            currentListId={currentListId}
            onCreateList={handleCreateList}
            onSwitchList={handleSwitchList}
            onDeleteList={handleDeleteList}
          />
          <ContentWrapper>
            {currentList && (
              <>
                <MarkdownInput
                  value={currentList.markdown}
                  onChange={handleMarkdownChange}
                  isMinimized={currentList.isMinimized}
                  onToggleMinimize={handleToggleMinimize}
                  hasContent={currentList.tasks.length > 0}
                  onImport={handleImportMarkdown}
                />
                <TodoList
                  tasks={filterTasksBySearch(currentList.tasks, searchQuery)}
                  listName={currentList.name}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  onListNameChange={handleListNameChange}
                  onToggle={handleToggle}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onAddSubtask={handleAddSubtask}
                  onAddRootTask={handleAddRootTask}
                  onAddSection={handleAddSection}
                  onMoveTask={handleMoveTask}
                  onExport={handleExport}
                  onDownload={handleDownload}
                  hideCompleted={hideCompleted}
                  onToggleHideCompleted={handleToggleHideCompleted}
                  onUndo={handleUndo}
                  canUndo={canUndo}
                  onAddTasksFromMarkdown={handleAddTasksFromMarkdown}
                  onQuickAddTask={handleQuickAddTask}
                  onUpdateDueDate={handleUpdateDueDate}
                />
              </>
            )}
          </ContentWrapper>
        </ContentContainer>
      </MainWrapper>
      <GitHubLink
        href="https://github.com/sinai-doron/md-todo-list"
        target="_blank"
        rel="noopener noreferrer"
        title="View on GitHub"
      >
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
      </GitHubLink>
      <Attribution
        href="https://unsplash.com/@heytowner?utm_source=todo-app&utm_medium=referral"
        target="_blank"
        rel="noopener noreferrer"
        title="Photo by John Towner on Unsplash"
      >

        Image by <span>John Towner</span>
      </Attribution>

      {isDashboardOpen && (
        <ProductivityDashboard
          stats={stats}
          lists={lists}
          onClose={() => setIsDashboardOpen(false)}
        />
      )}
    </AppContainer>
  );
}

function AppRoutes() {
  usePageTracking();

  return (
    <Routes>
      <Route path="/" element={<TodoApp />} />
      <Route path="/visualizer" element={<MarkdownVisualizerPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
