import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { SEO } from '../components/SEO';
import { KanbanBoard } from '../components/KanbanBoard';
import type { Task, KanbanStatus } from '../types/Task';
import { getTaskStatus } from '../types/Task';
import type { TodoList } from '../types/TodoList';
import { loadAllLists, saveAllLists } from '../utils/storage';
import { useProductivityStats } from '../hooks/useProductivityStats';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;

  .material-symbols-outlined {
    color: #6200ee;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ListSelector = styled.select`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: white;
  cursor: pointer;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const TaskStats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #666;
`;

const StatItem = styled.span<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.$color};
  }
`;

const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  text-align: center;
  padding: 40px;

  .material-symbols-outlined {
    font-size: 64px;
    color: #ccc;
    margin-bottom: 16px;
  }
`;

const EmptyTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
`;

const EmptyDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

export const KanbanBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState<{ [listId: string]: TodoList }>({});
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const { recordTaskCompletion, recordTaskUncompletion } = useProductivityStats();

  // Load lists from storage
  const loadData = useCallback(() => {
    const storedData = loadAllLists();
    setLists(storedData.lists);
    setCurrentListId(storedData.currentListId);
  }, []);

  // Load lists on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload data when page becomes visible (handles tab switching and navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };

    const handleFocus = () => {
      loadData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadData]);

  const currentList = currentListId ? lists[currentListId] : null;

  // Count tasks by status
  const getTaskCounts = useCallback(() => {
    if (!currentList) return { todo: 0, inProgress: 0, done: 0 };

    let todo = 0, inProgress = 0, done = 0;

    const countTask = (task: Task) => {
      if (task.isHeader || task.level !== 0) return;

      if (task.completed || task.status === 'done') {
        done++;
      } else if (task.status === 'in-progress') {
        inProgress++;
      } else {
        todo++;
      }
    };

    currentList.tasks.forEach(countTask);
    return { todo, inProgress, done };
  }, [currentList]);

  const counts = getTaskCounts();

  // Find a task by ID recursively
  const findTaskById = useCallback((tasks: Task[], taskId: string): Task | null => {
    for (const task of tasks) {
      if (task.id === taskId) return task;
      if (task.children) {
        const found = findTaskById(task.children, taskId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Update task status
  const handleUpdateTaskStatus = useCallback((taskId: string, newStatus: KanbanStatus) => {
    if (!currentListId) return;

    const list = lists[currentListId];
    if (!list) return;

    // Find the task to get its current status
    const task = findTaskById(list.tasks, taskId);
    if (!task) return;

    const oldStatus = getTaskStatus(task);

    // Track productivity stats
    if (newStatus === 'done' && oldStatus !== 'done') {
      recordTaskCompletion(taskId, currentListId);
    } else if (newStatus !== 'done' && oldStatus === 'done') {
      recordTaskUncompletion(taskId, currentListId);
    }

    setLists(prevLists => {
      const prevList = prevLists[currentListId];
      if (!prevList) return prevLists;

      const updateTaskRecursively = (tasks: Task[]): Task[] => {
        return tasks.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              status: newStatus,
              completed: newStatus === 'done',
              completedAt: newStatus === 'done' ? Date.now() : undefined,
            };
          }
          if (t.children) {
            return {
              ...t,
              children: updateTaskRecursively(t.children),
            };
          }
          return t;
        });
      };

      const updatedLists = {
        ...prevLists,
        [currentListId]: {
          ...prevList,
          tasks: updateTaskRecursively(prevList.tasks),
          updatedAt: Date.now(),
        },
      };

      // Save to localStorage
      saveAllLists({ lists: updatedLists, currentListId });

      return updatedLists;
    });
  }, [currentListId, lists, findTaskById, recordTaskCompletion, recordTaskUncompletion]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleListChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newListId = e.target.value;
    setCurrentListId(newListId);

    // Save selection
    saveAllLists({ lists, currentListId: newListId });
  }, [lists]);

  // Handle Escape key to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBack();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleBack]);

  const listOptions = Object.values(lists).sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <PageContainer>
      <SEO
        title="Kanban Board - MD Tasks"
        description="View and manage your tasks in a Kanban board format. Drag and drop tasks between To Do, In Progress, and Done columns."
        canonical="/kanban"
        keywords="kanban board, task management, project board, todo kanban"
      />

      <Header>
        <HeaderLeft>
          <BackButton onClick={handleBack} title="Back to Todo List (Esc)">
            <span className="material-symbols-outlined">arrow_back</span>
          </BackButton>
          <Title>
            <span className="material-symbols-outlined">view_kanban</span>
            Kanban Board
          </Title>
        </HeaderLeft>

        <HeaderRight>
          <TaskStats>
            <StatItem $color="#6b7280">{counts.todo} To Do</StatItem>
            <StatItem $color="#2563eb">{counts.inProgress} In Progress</StatItem>
            <StatItem $color="#16a34a">{counts.done} Done</StatItem>
          </TaskStats>

          {listOptions.length > 0 && (
            <ListSelector value={currentListId || ''} onChange={handleListChange}>
              {listOptions.map(list => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </ListSelector>
          )}
        </HeaderRight>
      </Header>

      <Content>
        {!currentList || currentList.tasks.length === 0 ? (
          <EmptyState>
            <span className="material-symbols-outlined">view_kanban</span>
            <EmptyTitle>No tasks yet</EmptyTitle>
            <EmptyDescription>
              Add some tasks in the main view to see them here as Kanban cards.
            </EmptyDescription>
          </EmptyState>
        ) : (
          <KanbanBoard
            tasks={currentList.tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        )}
      </Content>
    </PageContainer>
  );
};
