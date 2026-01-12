import React from 'react';
import styled from 'styled-components';
import type { CalendarDay, CalendarTask } from '../../types/Calendar';
import { getTaskCalendarStatus } from '../../utils/calendarUtils';

const WeekContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #e0e0e0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e0e0e0;
`;

const DayColumn = styled.div<{
  $isToday: boolean;
  $isSelected: boolean;
}>`
  background: white;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  border-top: 3px solid ${props =>
    props.$isSelected ? '#6200ee' :
    props.$isToday ? '#6200ee' : 'transparent'};

  @media (max-width: 768px) {
    min-height: 300px;
  }
`;

const DayHeader = styled.div<{ $isToday: boolean }>`
  padding: 12px 8px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  background: ${props => props.$isToday ? '#ede7f6' : '#fafafa'};
`;

const DayName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const DayNumber = styled.div<{ $isToday: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: ${props => props.$isToday ? '600' : '400'};
  color: ${props => props.$isToday ? 'white' : '#333'};
  background: ${props => props.$isToday ? '#6200ee' : 'transparent'};
`;

const TasksList = styled.div`
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TaskItem = styled.div<{ $status: 'overdue' | 'today' | 'upcoming' | 'completed' }>`
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
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
  color: ${props => {
    switch (props.$status) {
      case 'overdue': return '#dc2626';
      case 'today': return '#92400e';
      case 'completed': return '#6b7280';
      default: return '#1e40af';
    }
  }};
  border-left: 3px solid ${props => {
    switch (props.$status) {
      case 'overdue': return '#dc2626';
      case 'today': return '#d97706';
      case 'completed': return '#9ca3af';
      default: return '#2563eb';
    }
  }};
  text-decoration: ${props => props.$status === 'completed' ? 'line-through' : 'none'};

  &:hover {
    filter: brightness(0.95);
  }

  @media (max-width: 768px) {
    padding: 6px 8px;
    font-size: 11px;
  }
`;

const TaskText = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
`;

const ListBadge = styled.span`
  display: inline-block;
  font-size: 10px;
  color: #888;
  margin-top: 4px;
`;

const EmptyDay = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 12px;
`;

interface WeekViewProps {
  days: CalendarDay[];
  onDayClick: (date: Date, tasks: CalendarTask[]) => void;
  onTaskClick: (task: CalendarTask) => void;
  showListName?: boolean;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeekView: React.FC<WeekViewProps> = ({
  days,
  onDayClick,
  onTaskClick,
  showListName = false,
}) => {
  return (
    <WeekContainer>
      <WeekGrid>
        {days.map((day, index) => (
          <DayColumn
            key={index}
            $isToday={day.isToday}
            $isSelected={day.isSelected}
          >
            <DayHeader
              $isToday={day.isToday}
              onClick={() => onDayClick(day.date, day.tasks)}
              style={{ cursor: 'pointer' }}
            >
              <DayName>{dayNames[day.date.getDay()]}</DayName>
              <DayNumber $isToday={day.isToday}>
                {day.date.getDate()}
              </DayNumber>
            </DayHeader>
            <TasksList>
              {day.tasks.length > 0 ? (
                day.tasks.map((task, taskIndex) => (
                  <TaskItem
                    key={taskIndex}
                    $status={getTaskCalendarStatus(task)}
                    onClick={() => onTaskClick(task)}
                  >
                    <TaskText>{task.text}</TaskText>
                    {showListName && task.listName && (
                      <ListBadge>{task.listName}</ListBadge>
                    )}
                  </TaskItem>
                ))
              ) : (
                <EmptyDay>No tasks</EmptyDay>
              )}
            </TasksList>
          </DayColumn>
        ))}
      </WeekGrid>
    </WeekContainer>
  );
};
