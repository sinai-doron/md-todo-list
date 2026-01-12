import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { CalendarViewMode, CalendarTask } from '../types/Calendar';
import type { TodoList as TodoListType } from '../types/TodoList';
import { CalendarView } from '../components/calendar/CalendarView';
import { SEO } from '../components/SEO';
import { loadAllLists } from '../utils/storage';

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

const KeyboardHint = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #888;

  @media (max-width: 768px) {
    display: none;
  }
`;

const KeyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  color: #666;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const CalendarWrapper = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export function CalendarPage() {
  const navigate = useNavigate();
  const [lists, setLists] = useState<{ [listId: string]: TodoListType }>({});
  const [viewMode, setViewMode] = useState<CalendarViewMode>('day');

  // Load lists from storage
  useEffect(() => {
    const storedData = loadAllLists();
    setLists(storedData.lists);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'd':
          setViewMode('day');
          break;
        case 'w':
          setViewMode('week');
          break;
        case 'm':
          setViewMode('month');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get all tasks from all lists
  const getAllTasks = () => {
    const allTasks: CalendarTask[] = [];
    Object.entries(lists).forEach(([listId, list]) => {
      const addTasksRecursively = (tasks: typeof list.tasks, listName: string) => {
        tasks.forEach(task => {
          if (!task.isHeader) {
            allTasks.push({
              ...task,
              listId,
              listName,
            });
          }
          if (task.children) {
            addTasksRecursively(task.children, listName);
          }
        });
      };
      addTasksRecursively(list.tasks, list.name);
    });
    return allTasks;
  };

  const handleNavigateToTask = (_task: CalendarTask) => {
    // Navigate to todo page - could potentially pass state to highlight the task
    navigate('/todo');
  };

  const handleViewChange = (view: CalendarViewMode) => {
    if (view === 'list') {
      // If user clicks list view, navigate to todo page
      navigate('/todo');
    } else {
      setViewMode(view);
    }
  };

  return (
    <PageContainer>
      <SEO
        title="Calendar - MD Tasks"
        description="View your tasks in a calendar format. See your schedule by day, week, or month."
        canonical="/calendar"
        keywords="calendar view, task calendar, schedule, productivity"
      />
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate('/')} title="Back to Home">
            <span className="material-symbols-outlined">arrow_back</span>
          </BackButton>
          <Title>
            <span className="material-symbols-outlined">calendar_month</span>
            Calendar
          </Title>
        </HeaderLeft>
        <HeaderRight>
          <KeyboardHint>
            <KeyBadge>D</KeyBadge> Day
            <KeyBadge>W</KeyBadge> Week
            <KeyBadge>M</KeyBadge> Month
          </KeyboardHint>
        </HeaderRight>
      </Header>
      <MainContent>
        <CalendarWrapper>
          <CalendarView
            tasks={getAllTasks()}
            allLists={lists}
            viewMode={viewMode}
            onViewChange={handleViewChange}
            onNavigateToTask={handleNavigateToTask}
          />
        </CalendarWrapper>
      </MainContent>
    </PageContainer>
  );
}
