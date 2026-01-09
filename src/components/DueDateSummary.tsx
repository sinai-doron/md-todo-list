import React from 'react';
import styled from 'styled-components';
import type { Task } from '../types/Task';
import { getDateStatus } from './DueDatePicker';

const SummaryContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  margin-bottom: 16px;
`;

const SummaryChip = styled.button<{ $color: string; $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid ${props => props.$isActive ? props.$color : '#e0e0e0'};
  background: ${props => props.$isActive ? props.$color : 'white'};
  color: ${props => props.$isActive ? 'white' : props.$color};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$isActive ? props.$color : `${props.$color}15`};
    border-color: ${props => props.$color};
  }

  .count {
    background: ${props => props.$isActive ? 'rgba(255,255,255,0.3)' : `${props.$color}20`};
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
  }

  .material-symbols-outlined {
    font-size: 16px;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

export type DueDateFilter = 'overdue' | 'today' | 'upcoming' | null;

interface DueDateSummaryProps {
  tasks: Task[];
  activeFilter: DueDateFilter;
  onFilterChange: (filter: DueDateFilter) => void;
}

// Recursively count tasks by due date status
const countTasksByDueStatus = (tasks: Task[]): { overdue: number; today: number; upcoming: number } => {
  let overdue = 0;
  let today = 0;
  let upcoming = 0;

  const countRecursive = (taskList: Task[]) => {
    for (const task of taskList) {
      if (!task.isHeader && task.dueDate) {
        const status = getDateStatus(task.dueDate);
        if (status === 'overdue') overdue++;
        else if (status === 'today') today++;
        else if (status === 'upcoming') upcoming++;
      }
      if (task.children) {
        countRecursive(task.children);
      }
    }
  };

  countRecursive(tasks);
  return { overdue, today, upcoming };
};

export const DueDateSummary: React.FC<DueDateSummaryProps> = ({
  tasks,
  activeFilter,
  onFilterChange,
}) => {
  const counts = countTasksByDueStatus(tasks);
  const totalWithDates = counts.overdue + counts.today + counts.upcoming;

  // Don't show if no tasks have due dates
  if (totalWithDates === 0) {
    return null;
  }

  const handleChipClick = (filter: DueDateFilter) => {
    if (activeFilter === filter) {
      onFilterChange(null); // Toggle off
    } else {
      onFilterChange(filter);
    }
  };

  return (
    <SummaryContainer>
      {counts.overdue > 0 && (
        <SummaryChip
          $color="#dc2626"
          $isActive={activeFilter === 'overdue'}
          onClick={() => handleChipClick('overdue')}
        >
          <span className="material-symbols-outlined">warning</span>
          Overdue
          <span className="count">{counts.overdue}</span>
        </SummaryChip>
      )}
      {counts.today > 0 && (
        <SummaryChip
          $color="#d97706"
          $isActive={activeFilter === 'today'}
          onClick={() => handleChipClick('today')}
        >
          <span className="material-symbols-outlined">today</span>
          Today
          <span className="count">{counts.today}</span>
        </SummaryChip>
      )}
      {counts.upcoming > 0 && (
        <SummaryChip
          $color="#2563eb"
          $isActive={activeFilter === 'upcoming'}
          onClick={() => handleChipClick('upcoming')}
        >
          <span className="material-symbols-outlined">date_range</span>
          Upcoming
          <span className="count">{counts.upcoming}</span>
        </SummaryChip>
      )}
      {activeFilter && (
        <ClearButton onClick={() => onFilterChange(null)}>
          Clear filter
        </ClearButton>
      )}
    </SummaryContainer>
  );
};

export { countTasksByDueStatus };
