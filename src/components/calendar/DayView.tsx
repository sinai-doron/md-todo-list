import React from 'react';
import styled from 'styled-components';
import type { CalendarTask } from '../../types/Calendar';
import { getTaskCalendarStatus, getDayString } from '../../utils/calendarUtils';

const DayContainer = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const DayHeader = styled.div<{ $isToday: boolean }>`
  padding: 16px 20px;
  background: ${props => props.$isToday ? '#ede7f6' : '#fafafa'};
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DayNumber = styled.div<{ $isToday: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.$isToday ? 'white' : '#333'};
  background: ${props => props.$isToday ? '#6200ee' : 'transparent'};
  border: ${props => props.$isToday ? 'none' : '2px solid #e0e0e0'};
`;

const DayInfo = styled.div`
  flex: 1;
`;

const DayName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const DayDate = styled.div`
  font-size: 14px;
  color: #666;
`;

const TaskCount = styled.div`
  font-size: 14px;
  color: #666;
  padding: 6px 12px;
  background: #f0f0f0;
  border-radius: 16px;
`;

const TasksSection = styled.div`
  padding: 16px;
  min-height: 300px;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
`;

const TaskGroup = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TaskItem = styled.div<{ $status: 'overdue' | 'today' | 'upcoming' | 'completed' }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  background: ${props => {
    switch (props.$status) {
      case 'overdue': return '#fee2e2';
      case 'today': return '#fef3c7';
      case 'completed': return '#f3f4f6';
      default: return '#dbeafe';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.$status) {
      case 'overdue': return '#dc2626';
      case 'today': return '#d97706';
      case 'completed': return '#9ca3af';
      default: return '#2563eb';
    }
  }};

  &:hover {
    filter: brightness(0.97);
    transform: translateX(2px);
  }
`;

const TaskCheckbox = styled.div<{ $completed: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.$completed ? '#9ca3af' : '#6200ee'};
  background: ${props => props.$completed ? '#9ca3af' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;

  .material-symbols-outlined {
    font-size: 14px;
    color: white;
  }
`;

const TaskContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const TaskText = styled.div<{ $completed: boolean }>`
  font-size: 15px;
  color: ${props => props.$completed ? '#6b7280' : '#333'};
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  line-height: 1.4;
  margin-bottom: 4px;
`;

const TaskMeta = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;

  .material-symbols-outlined {
    font-size: 14px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  text-align: center;

  .material-symbols-outlined {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
`;

const EmptyTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
`;

const EmptySubtitle = styled.div`
  font-size: 14px;
`;

interface DayViewProps {
  date: Date;
  tasks: CalendarTask[];
  onTaskClick: (task: CalendarTask) => void;
  showListName?: boolean;
}

export const DayView: React.FC<DayViewProps> = ({
  date,
  tasks,
  onTaskClick,
  showListName = false,
}) => {
  const isToday = getDayString(date) === getDayString(new Date());

  // Group tasks by status
  const overdueTasks = tasks.filter(t => !t.completed && getTaskCalendarStatus(t) === 'overdue');
  const activeTasks = tasks.filter(t => !t.completed && getTaskCalendarStatus(t) !== 'overdue');
  const completedTasks = tasks.filter(t => t.completed);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const renderTask = (task: CalendarTask) => {
    const status = getTaskCalendarStatus(task);

    return (
      <TaskItem
        key={task.id}
        $status={status}
        onClick={() => onTaskClick(task)}
      >
        <TaskCheckbox $completed={task.completed}>
          {task.completed && (
            <span className="material-symbols-outlined">check</span>
          )}
        </TaskCheckbox>
        <TaskContent>
          <TaskText $completed={task.completed}>{task.text}</TaskText>
          <TaskMeta>
            {task.isRecurring && (
              <MetaItem>
                <span className="material-symbols-outlined">repeat</span>
                Recurring
              </MetaItem>
            )}
            {showListName && task.listName && (
              <MetaItem>
                <span className="material-symbols-outlined">folder</span>
                {task.listName}
              </MetaItem>
            )}
          </TaskMeta>
        </TaskContent>
      </TaskItem>
    );
  };

  return (
    <DayContainer>
      <DayHeader $isToday={isToday}>
        <DayNumber $isToday={isToday}>
          {date.getDate()}
        </DayNumber>
        <DayInfo>
          <DayName>{dayNames[date.getDay()]}</DayName>
          <DayDate>{monthNames[date.getMonth()]} {date.getFullYear()}</DayDate>
        </DayInfo>
        <TaskCount>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </TaskCount>
      </DayHeader>

      <TasksSection>
        {tasks.length === 0 ? (
          <EmptyState>
            <span className="material-symbols-outlined">event_available</span>
            <EmptyTitle>No tasks scheduled</EmptyTitle>
            <EmptySubtitle>Tasks with this due date will appear here</EmptySubtitle>
          </EmptyState>
        ) : (
          <>
            {overdueTasks.length > 0 && (
              <TaskGroup>
                <SectionTitle>Overdue</SectionTitle>
                <TasksList>
                  {overdueTasks.map(renderTask)}
                </TasksList>
              </TaskGroup>
            )}

            {activeTasks.length > 0 && (
              <TaskGroup>
                <SectionTitle>
                  {isToday ? 'Due Today' : 'Scheduled'}
                </SectionTitle>
                <TasksList>
                  {activeTasks.map(renderTask)}
                </TasksList>
              </TaskGroup>
            )}

            {completedTasks.length > 0 && (
              <TaskGroup>
                <SectionTitle>Completed</SectionTitle>
                <TasksList>
                  {completedTasks.map(renderTask)}
                </TasksList>
              </TaskGroup>
            )}
          </>
        )}
      </TasksSection>
    </DayContainer>
  );
};
