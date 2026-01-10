import React from 'react';
import styled from 'styled-components';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types/Task';
import { countSubtasks } from '../types/Task';

const CardContainer = styled.div<{ $isDragging: boolean; $isOverdue: boolean; $isDueToday: boolean }>`
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: ${props => props.$isDragging
    ? '0 8px 16px rgba(0, 0, 0, 0.15)'
    : '0 1px 3px rgba(0, 0, 0, 0.08)'};
  cursor: grab;
  transition: box-shadow 0.2s, transform 0.2s;
  border-left: 3px solid ${props => {
    if (props.$isOverdue) return '#ef4444';
    if (props.$isDueToday) return '#f97316';
    return 'transparent';
  }};
  opacity: ${props => props.$isDragging ? 0.5 : 1};

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }

  &:active {
    cursor: grabbing;
  }
`;

const TaskText = styled.div`
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 8px;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const BadgeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const DueDateBadge = styled.span<{ $status: 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'none' }>`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${props => {
    switch (props.$status) {
      case 'overdue': return '#fef2f2';
      case 'today': return '#fff7ed';
      case 'tomorrow': return '#fefce8';
      case 'upcoming': return '#eff6ff';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'overdue': return '#dc2626';
      case 'today': return '#ea580c';
      case 'tomorrow': return '#ca8a04';
      case 'upcoming': return '#2563eb';
      default: return '#6b7280';
    }
  }};

  .material-symbols-outlined {
    font-size: 12px;
  }
`;

const SubtaskBadge = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;

  .material-symbols-outlined {
    font-size: 12px;
  }
`;

const ProgressBar = styled.div`
  width: 40px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${props => props.$percent}%;
  background: #6200ee;
  transition: width 0.3s;
`;

interface KanbanCardProps {
  task: Task;
}

const getDueDateStatus = (dueDate: string | undefined): 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'none' => {
  if (!dueDate) return 'none';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');

  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  return 'upcoming';
};

const formatDueDate = (dueDate: string | undefined, status: string): string => {
  if (!dueDate) return '';

  switch (status) {
    case 'overdue': {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDate + 'T00:00:00');
      const diffDays = Math.abs(Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      return `${diffDays}d overdue`;
    }
    case 'today': return 'Today';
    case 'tomorrow': return 'Tomorrow';
    case 'upcoming': {
      const due = new Date(dueDate + 'T00:00:00');
      return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    default: return '';
  }
};

export const KanbanCard: React.FC<KanbanCardProps> = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueDateStatus = getDueDateStatus(task.dueDate);
  const subtaskCount = countSubtasks(task);
  const hasSubtasks = subtaskCount.total > 0;
  const subtaskPercent = hasSubtasks ? Math.round((subtaskCount.completed / subtaskCount.total) * 100) : 0;

  return (
    <CardContainer
      ref={setNodeRef}
      style={style}
      $isDragging={isDragging}
      $isOverdue={dueDateStatus === 'overdue'}
      $isDueToday={dueDateStatus === 'today'}
      {...attributes}
      {...listeners}
    >
      <TaskText>{task.text}</TaskText>

      <CardFooter>
        <BadgeContainer>
          {dueDateStatus !== 'none' && (
            <DueDateBadge $status={dueDateStatus}>
              <span className="material-symbols-outlined">calendar_today</span>
              {formatDueDate(task.dueDate, dueDateStatus)}
            </DueDateBadge>
          )}

          {hasSubtasks && (
            <SubtaskBadge>
              <span className="material-symbols-outlined">checklist</span>
              {subtaskCount.completed}/{subtaskCount.total}
            </SubtaskBadge>
          )}
        </BadgeContainer>

        {hasSubtasks && (
          <ProgressBar>
            <ProgressFill $percent={subtaskPercent} />
          </ProgressBar>
        )}
      </CardFooter>
    </CardContainer>
  );
};
