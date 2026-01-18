import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import type { CalendarTask } from '../../types/Calendar';
import type { Priority } from '../../types/Task';
import { getTaskCalendarStatus } from '../../utils/calendarUtils';
import { getRecurrenceDescription } from '../../utils/recurrence';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div<{ $status: 'overdue' | 'today' | 'upcoming' | 'completed' }>`
  padding: 20px 24px;
  background: ${props => {
    switch (props.$status) {
      case 'overdue': return '#fee2e2';
      case 'today': return '#fef3c7';
      case 'completed': return '#f3f4f6';
      default: return '#dbeafe';
    }
  }};
  border-bottom: 1px solid #e0e0e0;
`;

const StatusBadge = styled.span<{ $status: 'overdue' | 'today' | 'upcoming' | 'completed' }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.$status) {
      case 'overdue': return '#dc2626';
      case 'today': return '#d97706';
      case 'completed': return '#6b7280';
      default: return '#2563eb';
    }
  }};
  color: white;
  margin-bottom: 12px;
`;

const TaskTitle = styled.h2<{ $completed: boolean }>`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.$completed ? '#6b7280' : '#333'};
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  line-height: 1.4;
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const DetailSection = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const DetailValue = styled.div`
  font-size: 15px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;

  .material-symbols-outlined {
    font-size: 20px;
    color: #666;
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$primary ? '#6200ee' : '#f0f0f0'};
  color: ${props => props.$primary ? 'white' : '#333'};

  &:hover {
    background: ${props => props.$primary ? '#5000d0' : '#e0e0e0'};
  }
`;

const PriorityBadge = styled.span<{ $priority: Priority }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background: ${props => {
    switch (props.$priority) {
      case 'high': return '#fef2f2';
      case 'medium': return '#fff7ed';
      case 'low': return '#eff6ff';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#ea580c';
      case 'low': return '#2563eb';
      default: return '#6b7280';
    }
  }};
`;

const PriorityDot = styled.span<{ $priority: Priority }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f97316';
      case 'low': return '#3b82f6';
      default: return '#9ca3af';
    }
  }};
`;

const NotesContainer = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 0.5em;
    margin-bottom: 0.25em;
    color: #333;
  }

  h1 { font-size: 1.25em; }
  h2 { font-size: 1.15em; }
  h3 { font-size: 1.05em; }

  p {
    margin: 0.5em 0;
  }

  ul, ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }

  code {
    background: #e5e7eb;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  pre {
    background: #1f2937;
    color: #f9fafb;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;

    code {
      background: none;
      padding: 0;
    }
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TagBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => `${props.$color}20`};
  color: ${props => props.$color};
  border: 1px solid ${props => `${props.$color}40`};
`;

interface TaskDetailModalProps {
  task: CalendarTask;
  onClose: () => void;
  onNavigateToTask?: (task: CalendarTask) => void;
  availableTags?: Array<{ id: string; name: string; color: string }>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onNavigateToTask,
  availableTags = [],
}) => {
  const status = getTaskCalendarStatus(task);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'overdue': return 'Overdue';
      case 'today': return 'Due Today';
      case 'completed': return 'Completed';
      default: return 'Upcoming';
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return '';
    }
  };

  const taskTags = task.tags
    ? availableTags.filter(tag => task.tags?.includes(tag.id))
    : [];

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader $status={status}>
          <StatusBadge $status={status}>{getStatusLabel()}</StatusBadge>
          <TaskTitle $completed={task.completed}>{task.text}</TaskTitle>
        </ModalHeader>

        <ModalBody>
          {task.dueDate && (
            <DetailSection>
              <DetailLabel>Due Date</DetailLabel>
              <DetailValue>
                <span className="material-symbols-outlined">calendar_today</span>
                {formatDate(task.dueDate)}
              </DetailValue>
            </DetailSection>
          )}

          {task.priority && (
            <DetailSection>
              <DetailLabel>Priority</DetailLabel>
              <PriorityBadge $priority={task.priority}>
                <PriorityDot $priority={task.priority} />
                {getPriorityLabel(task.priority)}
              </PriorityBadge>
            </DetailSection>
          )}

          {task.isRecurring && task.recurrence && (
            <DetailSection>
              <DetailLabel>Recurrence</DetailLabel>
              <DetailValue>
                <span className="material-symbols-outlined">repeat</span>
                {getRecurrenceDescription(task.recurrence)}
              </DetailValue>
            </DetailSection>
          )}

          {taskTags.length > 0 && (
            <DetailSection>
              <DetailLabel>Tags</DetailLabel>
              <TagsContainer>
                {taskTags.map(tag => (
                  <TagBadge key={tag.id} $color={tag.color}>
                    {tag.name}
                  </TagBadge>
                ))}
              </TagsContainer>
            </DetailSection>
          )}

          {task.listName && (
            <DetailSection>
              <DetailLabel>List</DetailLabel>
              <DetailValue>
                <span className="material-symbols-outlined">folder</span>
                {task.listName}
              </DetailValue>
            </DetailSection>
          )}

          {task.completedAt && (
            <DetailSection>
              <DetailLabel>Completed</DetailLabel>
              <DetailValue>
                <span className="material-symbols-outlined">check_circle</span>
                {new Date(task.completedAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </DetailValue>
            </DetailSection>
          )}

          {task.notes && (
            <DetailSection>
              <DetailLabel>Notes</DetailLabel>
              <NotesContainer>
                <ReactMarkdown>{task.notes}</ReactMarkdown>
              </NotesContainer>
            </DetailSection>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
          {onNavigateToTask && (
            <Button $primary onClick={() => onNavigateToTask(task)}>
              Go to Task
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </Overlay>
  );
};
