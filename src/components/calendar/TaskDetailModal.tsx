import React from 'react';
import styled from 'styled-components';
import type { CalendarTask } from '../../types/Calendar';
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

interface TaskDetailModalProps {
  task: CalendarTask;
  onClose: () => void;
  onNavigateToTask?: (task: CalendarTask) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onNavigateToTask,
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

          {task.isRecurring && task.recurrence && (
            <DetailSection>
              <DetailLabel>Recurrence</DetailLabel>
              <DetailValue>
                <span className="material-symbols-outlined">repeat</span>
                {getRecurrenceDescription(task.recurrence)}
              </DetailValue>
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
