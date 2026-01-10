import React, { useMemo } from 'react';
import styled from 'styled-components';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Task, KanbanStatus } from '../types/Task';
import { getTaskStatus } from '../types/Task';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
  flex: 1;
  min-height: 0;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
`;

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: KanbanStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateTaskStatus,
}) => {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  // Filter to only root-level, non-header tasks
  const kanbanTasks = useMemo(() => {
    return tasks.filter(task => task.level === 0 && !task.isHeader);
  }, [tasks]);

  // Group tasks by status
  const groupedTasks = useMemo(() => {
    const groups: Record<KanbanStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'done': [],
    };

    kanbanTasks.forEach(task => {
      const status = getTaskStatus(task);
      groups[status].push(task);
    });

    return groups;
  }, [kanbanTasks]);

  // Configure sensors for mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const findTaskById = (id: string): Task | undefined => {
    return kanbanTasks.find(task => task.id === id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = findTaskById(event.active.id as string);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = () => {
    // Could be used for visual feedback during drag
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const columns: KanbanStatus[] = ['todo', 'in-progress', 'done'];
    if (columns.includes(overId as KanbanStatus)) {
      const task = findTaskById(taskId);
      if (task) {
        const currentStatus = getTaskStatus(task);
        if (currentStatus !== overId) {
          onUpdateTaskStatus(taskId, overId as KanbanStatus);
        }
      }
    } else {
      // Dropped on another card - find which column it's in
      const overTask = findTaskById(overId);
      if (overTask) {
        const overStatus = getTaskStatus(overTask);
        const task = findTaskById(taskId);
        if (task) {
          const currentStatus = getTaskStatus(task);
          if (currentStatus !== overStatus) {
            onUpdateTaskStatus(taskId, overStatus);
          }
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <BoardContainer>
        <KanbanColumn status="todo" tasks={groupedTasks['todo']} />
        <KanbanColumn status="in-progress" tasks={groupedTasks['in-progress']} />
        <KanbanColumn status="done" tasks={groupedTasks['done']} />
      </BoardContainer>

      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
