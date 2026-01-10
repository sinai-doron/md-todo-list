import React, { useState } from 'react';
import styled from 'styled-components';
import type { Task, RecurrenceRule } from '../types/Task';
import { TodoItem } from './TodoItem';
import { AddTasksModal } from './AddTasksModal';
import { QuickTaskInput } from './QuickTaskInput';
import { FocusMode } from './FocusMode';
import { DueDateSummary, type DueDateFilter } from './DueDateSummary';
import { getDateStatus } from './DueDatePicker';

const Container = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e0e0e0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
`;

const TitleInput = styled.input`
  margin: 0;
  font-size: 20px;
  color: #333;
  border: none;
  background: transparent;
  font-family: inherit;
  font-weight: inherit;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #f0f0f0;
  }

  &:focus {
    outline: none;
    background: #f0f0f0;
  }
`;

const Stats = styled.div`
  font-size: 14px;
  color: #666;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  margin-top: 12px;
  margin-bottom: 24px;
`;

const ProgressBarBackground = styled.div`
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #4a90e2 0%, #357abd 100%);
  transition: width 0.3s ease;
  border-radius: 4px;
  
  ${props => props.$percentage === 100 && `
    background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
  `}
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const ProgressPercentage = styled.span<{ $isComplete: boolean }>`
  font-weight: 600;
  color: ${props => props.$isComplete ? '#16a34a' : '#4a90e2'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
`;

// Material Design Toolbar
const MaterialToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  margin-bottom: 24px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Material Design Speed Dial FAB
const SpeedDialContainer = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1001;

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
  }
`;

const FAB = styled.button<{ $isOpen: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: #6200ee;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 3px 5px -1px rgba(0,0,0,0.2), 
              0 6px 10px 0 rgba(0,0,0,0.14), 
              0 1px 18px 0 rgba(0,0,0,0.12);
  transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  
  &:hover {
    background: #7c3aed;
    box-shadow: 0 5px 5px -3px rgba(0,0,0,0.2),
                0 8px 10px 1px rgba(0,0,0,0.14),
                0 3px 14px 2px rgba(0,0,0,0.12);
  }

  &:active {
    box-shadow: 0 7px 8px -4px rgba(0,0,0,0.2),
                0 12px 17px 2px rgba(0,0,0,0.14),
                0 5px 22px 4px rgba(0,0,0,0.12);
  }

  ${props => props.$isOpen && `
    transform: rotate(45deg);
  `}
`;

const SpeedDialBackdrop = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: ${props => props.$isOpen ? '1' : '0'};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 1000;
`;

const SpeedDialActions = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: ${props => props.$isOpen ? '1' : '0'};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 1002;
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
`;

const MiniFAB = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: white;
  color: #6200ee;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2),
              0 4px 5px 0 rgba(0,0,0,0.14),
              0 1px 10px 0 rgba(0,0,0,0.12);
  transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  
  &:hover {
    background: #f5f5f5;
    box-shadow: 0 3px 5px -1px rgba(0,0,0,0.2),
                0 6px 10px 0 rgba(0,0,0,0.14),
                0 1px 18px 0 rgba(0,0,0,0.12);
  }

  &::before {
    content: attr(data-tooltip);
    position: absolute;
    right: calc(100% + 12px);
    background: rgba(97, 97, 97, 0.9);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  }

  &:hover::before {
    opacity: 1;
  }
`;

// Material Design Icon Button
const IconButton = styled.button<{ $active?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$active ? 'rgba(98, 0, 238, 0.08)' : 'transparent'};
  color: ${props => props.$active ? '#6200ee' : 'rgba(0, 0, 0, 0.54)'};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  
  &:hover {
    background: rgba(98, 0, 238, 0.08);
    color: #6200ee;
  }

  &:active {
    background: rgba(98, 0, 238, 0.16);
  }

  &::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(97, 97, 97, 0.9);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  }

  &:hover::after {
    opacity: 1;
  }
`;

// Material Design Overflow Menu
const OverflowMenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const OverflowMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 5px 5px -3px rgba(0,0,0,0.2),
              0 8px 10px 1px rgba(0,0,0,0.14),
              0 3px 14px 2px rgba(0,0,0,0.12);
  min-width: 180px;
  opacity: ${props => props.$isOpen ? '1' : '0'};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'scale(1)' : 'scale(0.8)'};
  transform-origin: top right;
  transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 100;
  overflow: hidden;
`;

const MenuItem = styled.button`
  width: 100%;
  background: transparent;
  border: none;
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  
  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  &:active {
    background: rgba(0, 0, 0, 0.08);
  }

  .icon {
    font-size: 18px;
    color: rgba(0, 0, 0, 0.54);
  }
`;

const SearchResultInfo = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
  font-style: italic;
`;

const SearchContainer = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  max-width: ${props => props.$isOpen ? '300px' : '0px'};
  opacity: ${props => props.$isOpen ? '1' : '0'};
  transition: all 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
`;

const CompactSearchInput = styled.input`
  width: 240px;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  font-size: 13px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }

  &::placeholder {
    color: #999;
  }
`;

// Smart Section Headers for due date grouping
const SectionHeader = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin: 16px 0 8px 0;
  background: ${props => `${props.$color}10`};
  border-left: 4px solid ${props => props.$color};
  border-radius: 0 8px 8px 0;
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.$color};

  .material-symbols-outlined {
    font-size: 18px;
  }

  .count {
    background: ${props => `${props.$color}20`};
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    margin-left: auto;
  }
`;

const GroupedTasksContainer = styled.div`
  margin-bottom: 8px;
`;

interface TodoListProps {
  tasks: Task[];
  listName: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onListNameChange: (name: string) => void;
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (parentId: string) => void;
  onAddRootTask: () => void;
  onAddSection: () => void;
  onMoveTask: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  onExport: () => void;
  onDownload: () => void;
  hideCompleted: boolean;
  onToggleHideCompleted: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onAddTasksFromMarkdown: (markdown: string, parentId?: string) => void;
  onQuickAddTask: (text: string) => void;
  onUpdateDueDate: (id: string, dueDate: string | undefined) => void;
  onUpdateRecurrence: (id: string, recurrence: RecurrenceRule | undefined) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  listName,
  searchQuery = '',
  onSearchChange,
  onListNameChange,
  onToggle,
  onUpdate,
  onDelete,
  onAddSubtask,
  onAddRootTask,
  onAddSection,
  onMoveTask,
  onExport,
  onDownload,
  hideCompleted,
  onToggleHideCompleted,
  onUndo,
  canUndo,
  onAddTasksFromMarkdown,
  onQuickAddTask,
  onUpdateDueDate,
  onUpdateRecurrence,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [isAddTasksModalOpen, setIsAddTasksModalOpen] = useState(false);
  const [addTasksTargetId, setAddTasksTargetId] = useState<string | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>(null);

  const countTasks = (taskList: Task[]): { total: number; completed: number } => {
    let total = 0;
    let completed = 0;

    const count = (tasks: Task[]) => {
      tasks.forEach((task) => {
        // Only count actual tasks, not headers/sections
        if (!task.isHeader) {
          total++;
          if (task.completed) completed++;
        }
        if (task.children) count(task.children);
      });
    };

    count(taskList);
    return { total, completed };
  };

  const filterCompletedTasks = (taskList: Task[]): Task[] => {
    if (!hideCompleted) return taskList;

    return taskList
      .filter(task => {
        // Keep headers if they have non-completed children
        if (task.isHeader) {
          return task.children && task.children.length > 0 &&
                 filterCompletedTasks(task.children).length > 0;
        }
        // Filter out completed tasks
        return !task.completed;
      })
      .map(task => ({
        ...task,
        children: task.children ? filterCompletedTasks(task.children) : undefined,
      }));
  };

  // Filter tasks by due date status
  const filterByDueDate = (taskList: Task[]): Task[] => {
    if (!dueDateFilter) return taskList;

    const matchesFilter = (task: Task): boolean => {
      if (!task.dueDate) return false;
      const status = getDateStatus(task.dueDate);
      return status === dueDateFilter;
    };

    const filterRecursive = (tasks: Task[]): Task[] => {
      return tasks
        .filter(task => {
          if (task.isHeader) {
            // Keep headers if they have matching children
            const filteredChildren = task.children ? filterRecursive(task.children) : [];
            return filteredChildren.length > 0;
          }
          // Check if task matches or has matching children
          const hasMatchingChildren = task.children ? filterRecursive(task.children).length > 0 : false;
          return matchesFilter(task) || hasMatchingChildren;
        })
        .map(task => ({
          ...task,
          children: task.children ? filterRecursive(task.children) : undefined,
        }));
    };

    return filterRecursive(taskList);
  };

  // Group tasks by due date for smart sections
  type GroupedTasks = {
    overdue: Task[];
    today: Task[];
    tomorrow: Task[];
    thisWeek: Task[];
    later: Task[];
    noDueDate: Task[];
  };

  const groupTasksByDueDate = (taskList: Task[]): GroupedTasks => {
    const groups: GroupedTasks = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
      noDueDate: [],
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Flatten all non-header tasks for grouping
    const flattenTasks = (tasks: Task[]): Task[] => {
      const result: Task[] = [];
      for (const task of tasks) {
        if (!task.isHeader) {
          result.push(task);
        }
        if (task.children) {
          result.push(...flattenTasks(task.children));
        }
      }
      return result;
    };

    const allTasks = flattenTasks(taskList);

    for (const task of allTasks) {
      if (!task.dueDate) {
        groups.noDueDate.push(task);
        continue;
      }

      const dueDate = new Date(task.dueDate + 'T00:00:00');
      const status = getDateStatus(task.dueDate);

      if (status === 'overdue') {
        groups.overdue.push(task);
      } else if (dueDate.getTime() === today.getTime()) {
        groups.today.push(task);
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(task);
      } else if (dueDate < nextWeek) {
        groups.thisWeek.push(task);
      } else {
        groups.later.push(task);
      }
    }

    return groups;
  };

  const { total, completed } = countTasks(tasks);
  const filteredByCompleted = filterCompletedTasks(tasks);
  const displayedTasks = filterByDueDate(filteredByCompleted);
  const groupedTasks = dueDateFilter ? groupTasksByDueDate(displayedTasks) : null;
  const hasSearchQuery = searchQuery.trim().length > 0;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Collect all section IDs recursively
  const getAllSectionIds = (taskList: Task[]): string[] => {
    const ids: string[] = [];
    taskList.forEach(task => {
      if (task.isHeader && task.children && task.children.length > 0) {
        ids.push(task.id);
      }
      if (task.children) {
        ids.push(...getAllSectionIds(task.children));
      }
    });
    return ids;
  };

  const handleCollapseAll = () => {
    const allSectionIds = getAllSectionIds(tasks);
    setCollapsedSections(new Set(allSectionIds));
  };

  const handleExpandAll = () => {
    setCollapsedSections(new Set());
  };

  const toggleSectionCollapse = (id: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const hasSections = getAllSectionIds(tasks).length > 0;

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-speed-dial]') && !target.closest('[data-overflow]')) {
        setIsSpeedDialOpen(false);
        setIsOverflowOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add keyboard shortcut for undo (Cmd/Ctrl + Z)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'z' && canUndo) {
        event.preventDefault();
        onUndo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, onUndo]);

  const handleSpeedDialAction = (action: () => void) => {
    action();
    setIsSpeedDialOpen(false);
  };

  const handleOverflowAction = (action: () => void) => {
    action();
    setIsOverflowOpen(false);
  };

  const handleOpenAddTasksModal = (parentId?: string) => {
    setAddTasksTargetId(parentId);
    setIsAddTasksModalOpen(true);
    setIsSpeedDialOpen(false);
  };

  const handleCloseAddTasksModal = () => {
    setIsAddTasksModalOpen(false);
    setAddTasksTargetId(undefined);
  };

  const handleAddTasks = (markdown: string) => {
    onAddTasksFromMarkdown(markdown, addTasksTargetId);
  };

  // Helper to get task name by ID (for modal title)
  const getTaskNameById = (taskId: string | undefined): string | undefined => {
    if (!taskId) return undefined;
    
    const findTask = (tasks: Task[]): Task | null => {
      for (const task of tasks) {
        if (task.id === taskId) return task;
        if (task.children) {
          const found = findTask(task.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const task = findTask(tasks);
    return task?.text;
  };

  // Helper to find a task by ID
  const getTaskById = (taskId: string | null): Task | null => {
    if (!taskId) return null;

    const findTask = (taskList: Task[]): Task | null => {
      for (const task of taskList) {
        if (task.id === taskId) return task;
        if (task.children) {
          const found = findTask(task.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findTask(tasks);
  };

  const focusedTask = getTaskById(focusedTaskId);

  // Recursive render function to properly handle collapsed state at all levels
  const renderTask = (task: Task): React.ReactNode => (
    <TodoItem
      key={task.id}
      task={task}
      onToggle={onToggle}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onAddSubtask={onAddSubtask}
      onMoveTask={onMoveTask}
      onFocus={setFocusedTaskId}
      isCollapsed={collapsedSections.has(task.id)}
      onToggleCollapse={toggleSectionCollapse}
      collapsedSections={collapsedSections}
      onAddTasksFromMarkdown={handleOpenAddTasksModal}
      onUpdateDueDate={onUpdateDueDate}
      onUpdateRecurrence={onUpdateRecurrence}
    />
  );

  if (tasks.length === 0 && !hasSearchQuery) {
    return (
      <>
        <Container>
          <QuickTaskInput onAddTask={onQuickAddTask} autoFocus={false} />
          <Header>
            <TitleInput
              value={listName}
              onChange={(e) => onListNameChange(e.target.value)}
              placeholder="Todo List"
            />
            <Stats>0 / 0 completed</Stats>
          </Header>
          <MaterialToolbar>
            <ToolbarSection>
              {onSearchChange && (
                <>
                  <IconButton
                    $active={isSearchOpen}
                    data-tooltip="Search"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                  >
                    <span className="material-symbols-outlined">search</span>
                  </IconButton>
                  <SearchContainer $isOpen={isSearchOpen}>
                    <CompactSearchInput
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      autoFocus={isSearchOpen}
                    />
                  </SearchContainer>
                </>
              )}
              <IconButton
                $active={hideCompleted}
                data-tooltip={hideCompleted ? "Show Completed" : "Hide Completed"}
                onClick={onToggleHideCompleted}
              >
                {hideCompleted ? '👁' : '🙈'}
              </IconButton>
              <IconButton
                data-tooltip="Undo (Cmd+Z)"
                onClick={onUndo}
                disabled={!canUndo}
                style={{ opacity: canUndo ? 1 : 0.3, cursor: canUndo ? 'pointer' : 'not-allowed' }}
              >
                <span className="material-symbols-outlined">undo</span>
              </IconButton>
              {hasSections && (
                <>
                  <IconButton
                    data-tooltip="Collapse All"
                    onClick={handleCollapseAll}
                  >
                    <span className="material-symbols-outlined">collapse_all</span>
                  </IconButton>
                  <IconButton
                    data-tooltip="Expand All"
                    onClick={handleExpandAll}
                  >
                    <span className="material-symbols-outlined">expand_all</span>
                  </IconButton>
                </>
              )}
            </ToolbarSection>
            <ToolbarSection>
              <OverflowMenuContainer data-overflow>
                <IconButton
                  data-tooltip="More actions"
                  onClick={() => setIsOverflowOpen(!isOverflowOpen)}
                >
                  ⋮
                </IconButton>
                <OverflowMenu $isOpen={isOverflowOpen}>
                  <MenuItem onClick={() => handleOverflowAction(onExport)}>
                    <span className="icon">📋</span>
                    Copy Markdown
                  </MenuItem>
                  <MenuItem onClick={() => handleOverflowAction(onDownload)}>
                    <span className="material-symbols-outlined icon">download_2</span>
                    Download .md
                  </MenuItem>
                </OverflowMenu>
              </OverflowMenuContainer>
            </ToolbarSection>
          </MaterialToolbar>
          <EmptyState>
            No tasks yet. Paste markdown above, add a section, or add a task to get started!
          </EmptyState>
        </Container>
        <SpeedDialContainer data-speed-dial>
          <SpeedDialBackdrop 
            $isOpen={isSpeedDialOpen}
            onClick={() => setIsSpeedDialOpen(false)}
          />
          <SpeedDialActions $isOpen={isSpeedDialOpen}>
            <MiniFAB 
              data-tooltip="Add from Markdown"
              onClick={() => handleSpeedDialAction(() => handleOpenAddTasksModal())}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>post_add</span>
            </MiniFAB>
            <MiniFAB 
              data-tooltip="Add Section"
              onClick={() => handleSpeedDialAction(onAddSection)}
            >
              📑
            </MiniFAB>
            <MiniFAB 
              data-tooltip="Add Task"
              onClick={() => handleSpeedDialAction(onAddRootTask)}
            >
              ✓
            </MiniFAB>
          </SpeedDialActions>
          <FAB 
            $isOpen={isSpeedDialOpen}
            onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
          >
            +
          </FAB>
        </SpeedDialContainer>
        <AddTasksModal
          isOpen={isAddTasksModalOpen}
          onClose={handleCloseAddTasksModal}
          onAdd={handleAddTasks}
          targetName={getTaskNameById(addTasksTargetId)}
        />
        <FocusMode
          task={focusedTask}
          isOpen={focusedTaskId !== null}
          onClose={() => setFocusedTaskId(null)}
          onToggle={onToggle}
        />
      </>
    );
  }

  return (
    <>
      <Container>
        <QuickTaskInput onAddTask={onQuickAddTask} autoFocus={false} />
        <Header>
          <TitleInput
            value={listName}
            onChange={(e) => onListNameChange(e.target.value)}
            placeholder="Todo List"
          />
          <Stats>
            {completed} / {total} completed
          </Stats>
        </Header>
        {total > 0 && (
          <ProgressBarContainer>
            <ProgressBarBackground>
              <ProgressBarFill $percentage={completionPercentage} />
            </ProgressBarBackground>
            <ProgressText>
              <span>{completed} of {total} tasks completed</span>
              <ProgressPercentage $isComplete={completionPercentage === 100}>
                {completionPercentage}%
              </ProgressPercentage>
            </ProgressText>
          </ProgressBarContainer>
        )}
        <DueDateSummary
          tasks={tasks}
          activeFilter={dueDateFilter}
          onFilterChange={setDueDateFilter}
        />
          <MaterialToolbar>
            <ToolbarSection>
              {onSearchChange && (
                <>
                  <IconButton
                    $active={isSearchOpen}
                    data-tooltip="Search"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                  >
                    <span className="material-symbols-outlined">search</span>
                  </IconButton>
                  <SearchContainer $isOpen={isSearchOpen}>
                    <CompactSearchInput
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      autoFocus={isSearchOpen}
                    />
                  </SearchContainer>
                </>
              )}
              <IconButton
                $active={hideCompleted}
                data-tooltip={hideCompleted ? "Show Completed" : "Hide Completed"}
                onClick={onToggleHideCompleted}
              >
                {hideCompleted ? '👁' : '🙈'}
              </IconButton>
              <IconButton
                data-tooltip="Undo (Cmd+Z)"
                onClick={onUndo}
                disabled={!canUndo}
                style={{ opacity: canUndo ? 1 : 0.3, cursor: canUndo ? 'pointer' : 'not-allowed' }}
              >
                <span className="material-symbols-outlined">undo</span>
              </IconButton>
              {hasSections && (
                <>
                  <IconButton
                    data-tooltip="Collapse All"
                    onClick={handleCollapseAll}
                  >
                    <span className="material-symbols-outlined">collapse_all</span>
                  </IconButton>
                  <IconButton
                    data-tooltip="Expand All"
                    onClick={handleExpandAll}
                  >
                    <span className="material-symbols-outlined">expand_all</span>
                  </IconButton>
                </>
              )}
            </ToolbarSection>
          <ToolbarSection>
            <OverflowMenuContainer data-overflow>
              <IconButton
                data-tooltip="More actions"
                onClick={() => setIsOverflowOpen(!isOverflowOpen)}
              >
                ⋮
              </IconButton>
                <OverflowMenu $isOpen={isOverflowOpen}>
                  <MenuItem onClick={() => handleOverflowAction(onExport)}>
                    <span className="icon">📋</span>
                    Copy Markdown
                  </MenuItem>
                  <MenuItem onClick={() => handleOverflowAction(onDownload)}>
                    <span className="material-symbols-outlined icon">download_2</span>
                    Download .md
                  </MenuItem>
                </OverflowMenu>
            </OverflowMenuContainer>
          </ToolbarSection>
        </MaterialToolbar>
        {hasSearchQuery && displayedTasks.length === 0 ? (
          <SearchResultInfo>
            No tasks found matching "{searchQuery}"
          </SearchResultInfo>
        ) : displayedTasks.length === 0 && hideCompleted ? (
          <EmptyState>
            All tasks are completed! Toggle "Show Completed" to see them.
          </EmptyState>
        ) : displayedTasks.length === 0 && dueDateFilter ? (
          <EmptyState>
            No tasks with this due date status.
          </EmptyState>
        ) : groupedTasks ? (
          // Render grouped tasks when due date filter is active
          <>
            {groupedTasks.overdue.length > 0 && (
              <GroupedTasksContainer>
                <SectionHeader $color="#dc2626">
                  <span className="material-symbols-outlined">warning</span>
                  Overdue
                  <span className="count">{groupedTasks.overdue.length}</span>
                </SectionHeader>
                {groupedTasks.overdue.map(renderTask)}
              </GroupedTasksContainer>
            )}
            {groupedTasks.today.length > 0 && (
              <GroupedTasksContainer>
                <SectionHeader $color="#d97706">
                  <span className="material-symbols-outlined">today</span>
                  Today
                  <span className="count">{groupedTasks.today.length}</span>
                </SectionHeader>
                {groupedTasks.today.map(renderTask)}
              </GroupedTasksContainer>
            )}
            {groupedTasks.tomorrow.length > 0 && (
              <GroupedTasksContainer>
                <SectionHeader $color="#2563eb">
                  <span className="material-symbols-outlined">event</span>
                  Tomorrow
                  <span className="count">{groupedTasks.tomorrow.length}</span>
                </SectionHeader>
                {groupedTasks.tomorrow.map(renderTask)}
              </GroupedTasksContainer>
            )}
            {groupedTasks.thisWeek.length > 0 && (
              <GroupedTasksContainer>
                <SectionHeader $color="#2563eb">
                  <span className="material-symbols-outlined">date_range</span>
                  This Week
                  <span className="count">{groupedTasks.thisWeek.length}</span>
                </SectionHeader>
                {groupedTasks.thisWeek.map(renderTask)}
              </GroupedTasksContainer>
            )}
            {groupedTasks.later.length > 0 && (
              <GroupedTasksContainer>
                <SectionHeader $color="#6b7280">
                  <span className="material-symbols-outlined">schedule</span>
                  Later
                  <span className="count">{groupedTasks.later.length}</span>
                </SectionHeader>
                {groupedTasks.later.map(renderTask)}
              </GroupedTasksContainer>
            )}
          </>
        ) : (
          displayedTasks.map(renderTask)
        )}
      </Container>
      <SpeedDialContainer data-speed-dial>
        <SpeedDialBackdrop 
          $isOpen={isSpeedDialOpen}
          onClick={() => setIsSpeedDialOpen(false)}
        />
        <SpeedDialActions $isOpen={isSpeedDialOpen}>
          <MiniFAB 
            data-tooltip="Add from Markdown"
            onClick={() => handleSpeedDialAction(() => handleOpenAddTasksModal())}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>post_add</span>
          </MiniFAB>
          <MiniFAB 
            data-tooltip="Add Section"
            onClick={() => handleSpeedDialAction(onAddSection)}
          >
            📑
          </MiniFAB>
          <MiniFAB 
            data-tooltip="Add Task"
            onClick={() => handleSpeedDialAction(onAddRootTask)}
          >
            ✓
          </MiniFAB>
        </SpeedDialActions>
        <FAB 
          $isOpen={isSpeedDialOpen}
          onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
        >
          +
        </FAB>
      </SpeedDialContainer>
      <AddTasksModal
        isOpen={isAddTasksModalOpen}
        onClose={handleCloseAddTasksModal}
        onAdd={handleAddTasks}
        targetName={getTaskNameById(addTasksTargetId)}
      />
      <FocusMode
        task={focusedTask}
        isOpen={focusedTaskId !== null}
        onClose={() => setFocusedTaskId(null)}
        onToggle={onToggle}
      />
    </>
  );
};

