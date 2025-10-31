import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { MarkdownInput } from './components/MarkdownInput';
import { TodoList } from './components/TodoList';
import { Sidebar } from './components/Sidebar';
import type { Task } from './types/Task';
import type { TodoList as TodoListType } from './types/TodoList';
import { parseMarkdownToTasks } from './utils/markdownParser';
import { exportTasksToMarkdown } from './utils/exportMarkdown';
import {
  loadAllLists,
  saveAllLists,
  createNewList,
} from './utils/storage';

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

function App() {
  // Multi-list state
  const [lists, setLists] = useState<{ [listId: string]: TodoListType }>({});
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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
  };

  const handleSwitchList = (listId: string) => {
    setCurrentListId(listId);
  };

  const handleDeleteList = (listId: string) => {
    setLists((prev) => {
      const updated = { ...prev };
      delete updated[listId];
      return updated;
    });

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
    
    setLists((prev) => ({
      ...prev,
      [currentListId]: {
        ...prev[currentListId],
        isMinimized: !prev[currentListId].isMinimized,
      },
    }));
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
      }

      // Helper to mark a task and all its children with the same completed state
      const markTaskAndChildren = (task: Task, completed: boolean): Task => {
        const updatedTask = { ...task, completed };
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
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  // Don't render until we've loaded from storage
  if (isInitialMount.current) {
    return null;
  }

  return (
    <AppContainer>
      <MainWrapper>
        <Header>
          <Title>Markdown Todo List</Title>
          <Subtitle>Transform your markdown into an interactive todo list</Subtitle>
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
                />
                <TodoList
                  tasks={filterTasksBySearch(currentList.tasks, searchQuery)}
                  listName={currentList.name}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
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
                  onToggleHideCompleted={() => setHideCompleted(!hideCompleted)}
                  onUndo={handleUndo}
                  canUndo={canUndo}
                />
              </>
            )}
          </ContentWrapper>
        </ContentContainer>
      </MainWrapper>
    </AppContainer>
  );
}

export default App;
