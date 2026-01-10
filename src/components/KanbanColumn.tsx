import React from 'react';
import styled from 'styled-components';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, KanbanStatus } from '../types/Task';
import { KanbanCard } from './KanbanCard';

const ColumnContainer = styled.div<{ $isOver: boolean }>`
  background: ${props => props.$isOver ? 'rgba(98, 0, 238, 0.05)' : '#f8f9fa'};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  max-height: calc(100vh - 200px);
  transition: background 0.2s;
`;

const ColumnHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;

const ColumnTitle = styled.h3<{ $status: KanbanStatus }>`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => {
    switch (props.$status) {
      case 'todo': return '#6b7280';
      case 'in-progress': return '#2563eb';
      case 'done': return '#16a34a';
    }
  }};

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const TaskCount = styled.span<{ $status: KanbanStatus }>`
  background: ${props => {
    switch (props.$status) {
      case 'todo': return '#f3f4f6';
      case 'in-progress': return '#dbeafe';
      case 'done': return '#dcfce7';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'todo': return '#6b7280';
      case 'in-progress': return '#2563eb';
      case 'done': return '#16a34a';
    }
  }};
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
`;

const CardList = styled.div`
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #9ca3af;
  text-align: center;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  margin: 12px;

  .material-symbols-outlined {
    font-size: 32px;
    margin-bottom: 8px;
    opacity: 0.5;
  }
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 13px;
`;

interface KanbanColumnProps {
  status: KanbanStatus;
  tasks: Task[];
}

const getColumnConfig = (status: KanbanStatus) => {
  switch (status) {
    case 'todo':
      return { title: 'To Do', icon: 'radio_button_unchecked' };
    case 'in-progress':
      return { title: 'In Progress', icon: 'pending' };
    case 'done':
      return { title: 'Done', icon: 'check_circle' };
  }
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const config = getColumnConfig(status);
  const taskIds = tasks.map(t => t.id);

  return (
    <ColumnContainer ref={setNodeRef} $isOver={isOver}>
      <ColumnHeader>
        <ColumnTitle $status={status}>
          <span className="material-symbols-outlined">{config.icon}</span>
          {config.title}
        </ColumnTitle>
        <TaskCount $status={status}>{tasks.length}</TaskCount>
      </ColumnHeader>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <CardList>
          {tasks.length === 0 ? (
            <EmptyState>
              <span className="material-symbols-outlined">inbox</span>
              <EmptyText>
                {status === 'todo' && 'No tasks to do'}
                {status === 'in-progress' && 'Nothing in progress'}
                {status === 'done' && 'No completed tasks'}
              </EmptyText>
            </EmptyState>
          ) : (
            tasks.map(task => (
              <KanbanCard key={task.id} task={task} />
            ))
          )}
        </CardList>
      </SortableContext>
    </ColumnContainer>
  );
};
