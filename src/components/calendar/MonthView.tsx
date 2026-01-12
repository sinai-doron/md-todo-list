import React from 'react';
import styled from 'styled-components';
import type { CalendarDay, CalendarTask } from '../../types/Calendar';
import { getDayNames, getTaskCalendarStatus } from '../../utils/calendarUtils';

const MonthContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #e0e0e0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const WeekdayHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f5f5;
`;

const WeekdayCell = styled.div`
  padding: 12px 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e0e0e0;
`;

const DayCell = styled.div<{
  $isCurrentMonth: boolean;
  $isToday: boolean;
  $isSelected: boolean;
  $hasTasks: boolean;
}>`
  background: white;
  min-height: 90px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.15s;
  opacity: ${props => props.$isCurrentMonth ? 1 : 0.4};
  border: 2px solid ${props =>
    props.$isSelected ? '#6200ee' :
    props.$isToday ? '#6200ee40' : 'transparent'};

  &:hover {
    background: #fafafa;
  }

  @media (max-width: 768px) {
    min-height: 70px;
    padding: 4px;
  }
`;

const DayNumber = styled.div<{ $isToday: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: ${props => props.$isToday ? '600' : '400'};
  color: ${props => props.$isToday ? 'white' : '#333'};
  background: ${props => props.$isToday ? '#6200ee' : 'transparent'};
  margin-bottom: 4px;

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
`;

const TasksContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
`;

const TaskDot = styled.div<{ $status: 'overdue' | 'today' | 'upcoming' | 'completed' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: ${props => {
    switch (props.$status) {
      case 'overdue': return '#fee2e2';
      case 'today': return '#fef3c7';
      case 'completed': return '#f3f4f6';
      default: return '#dbeafe';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'overdue': return '#dc2626';
      case 'today': return '#d97706';
      case 'completed': return '#6b7280';
      default: return '#2563eb';
    }
  }};
  text-decoration: ${props => props.$status === 'completed' ? 'line-through' : 'none'};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    padding: 1px 4px;
    font-size: 10px;

    &::before {
      width: 4px;
      height: 4px;
    }
  }
`;

const MoreTasks = styled.div`
  font-size: 11px;
  color: #666;
  padding: 2px 6px;

  @media (max-width: 768px) {
    font-size: 10px;
    padding: 1px 4px;
  }
`;

const TaskDotsOnly = styled.div`
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  margin-top: 4px;
`;

const SmallDot = styled.div<{ $status: 'overdue' | 'today' | 'upcoming' | 'completed' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'overdue': return '#dc2626';
      case 'today': return '#d97706';
      case 'completed': return '#9ca3af';
      default: return '#2563eb';
    }
  }};

  @media (max-width: 768px) {
    width: 6px;
    height: 6px;
  }
`;

interface MonthViewProps {
  days: CalendarDay[];
  onDayClick: (date: Date, tasks: CalendarTask[]) => void;
  compact?: boolean;
}

export const MonthView: React.FC<MonthViewProps> = ({
  days,
  onDayClick,
  compact = false,
}) => {
  const dayNames = getDayNames(true);
  const maxVisibleTasks = compact ? 0 : 3;

  const renderTasks = (tasks: CalendarTask[]) => {
    if (tasks.length === 0) return null;

    // On mobile or compact mode, just show dots
    if (compact || window.innerWidth <= 768) {
      return (
        <TaskDotsOnly>
          {tasks.slice(0, 5).map((task, i) => (
            <SmallDot key={i} $status={getTaskCalendarStatus(task)} />
          ))}
          {tasks.length > 5 && (
            <MoreTasks>+{tasks.length - 5}</MoreTasks>
          )}
        </TaskDotsOnly>
      );
    }

    const visibleTasks = tasks.slice(0, maxVisibleTasks);
    const remainingCount = tasks.length - maxVisibleTasks;

    return (
      <TasksContainer>
        {visibleTasks.map((task, i) => (
          <TaskDot key={i} $status={getTaskCalendarStatus(task)}>
            {task.text}
          </TaskDot>
        ))}
        {remainingCount > 0 && (
          <MoreTasks>+{remainingCount} more</MoreTasks>
        )}
      </TasksContainer>
    );
  };

  return (
    <MonthContainer>
      <WeekdayHeader>
        {dayNames.map(day => (
          <WeekdayCell key={day}>{day}</WeekdayCell>
        ))}
      </WeekdayHeader>
      <MonthGrid>
        {days.map((day, index) => (
          <DayCell
            key={index}
            $isCurrentMonth={day.isCurrentMonth}
            $isToday={day.isToday}
            $isSelected={day.isSelected}
            $hasTasks={day.tasks.length > 0}
            onClick={() => onDayClick(day.date, day.tasks)}
          >
            <DayNumber $isToday={day.isToday}>
              {day.date.getDate()}
            </DayNumber>
            {renderTasks(day.tasks)}
          </DayCell>
        ))}
      </MonthGrid>
    </MonthContainer>
  );
};
