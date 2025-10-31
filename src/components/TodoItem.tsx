import React, { useState, KeyboardEvent } from 'react';
import styled from 'styled-components';
import type { Task } from '../types/Task';

const ItemContainer = styled.div<{ $level: number; $isDragging?: boolean; $isDropTarget?: boolean }>`
  margin-left: ${props => props.$level * 24}px;
  margin-bottom: 8px;
  opacity: ${props => props.$isDragging ? 0.3 : 1};
  transform: ${props => props.$isDragging ? 'scale(0.95)' : 'scale(1)'};
  transition: opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1), 
              transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1),
              margin-left 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
`;

const ItemContent = styled.div<{ $isHeader?: boolean; $isDraggable?: boolean; $completed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${props => props.$isHeader ? '12px 8px' : '8px'};
  border-radius: 4px;
  transition: background 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  background: ${props => props.$completed ? '#f9f9f9' : 'transparent'};

  &:hover {
    background: ${props => props.$isHeader ? 'transparent' : '#f5f5f5'};
  }
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: transform 0.2s;

  &:hover {
    color: #333;
  }
`;

const DragHandle = styled.div`
  cursor: grab;
  color: #999;
  font-size: 14px;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  user-select: none;
  
  ${ItemContent}:hover & {
    opacity: 1;
  }

  &:active {
    cursor: grabbing;
  }
`;

// Enhanced Drop Indicators
const DropIndicatorLine = styled.div<{ $position: 'before' | 'after' }>`
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: #6200ee;
  ${props => props.$position === 'before' ? 'top: -2px;' : 'bottom: -2px;'}
  border-radius: 2px;
  z-index: 100;
  pointer-events: none;
  box-shadow: 0 0 8px rgba(98, 0, 238, 0.4);
  
  &::before {
    content: '';
    position: absolute;
    ${props => props.$position === 'before' ? 'top: -4px;' : 'bottom: -4px;'}
    left: -4px;
    width: 8px;
    height: 8px;
    background: #6200ee;
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(98, 0, 238, 0.6);
  }
  
  &::after {
    content: '';
    position: absolute;
    ${props => props.$position === 'before' ? 'top: -4px;' : 'bottom: -4px;'}
    right: -4px;
    width: 8px;
    height: 8px;
    background: #6200ee;
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(98, 0, 238, 0.6);
  }
`;

const DropIndicatorInside = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid #6200ee;
  background: rgba(98, 0, 238, 0.08);
  border-radius: 6px;
  z-index: 50;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '→ Add as subtask';
    background: #6200ee;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(98, 0, 238, 0.3);
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: #4a90e2;
  pointer-events: auto;
  position: relative;
  z-index: 10;
`;

const TextInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  padding: 4px;
  
  &:focus {
    outline: none;
    background: white;
    border-radius: 3px;
    padding: 4px 8px;
  }
`;

const TextDisplay = styled.span<{ $completed: boolean; $isHeader?: boolean; $isDragging?: boolean }>`
  flex: 1;
  font-size: ${props => props.$isHeader ? '16px' : '14px'};
  font-weight: ${props => props.$isHeader ? '600' : '400'};
  color: ${props => props.$isDragging ? '#ccc' : props.$completed ? '#999' : props.$isHeader ? '#222' : '#333'};
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  cursor: ${props => props.$isHeader ? 'default' : 'text'};
  padding: 4px;
  opacity: ${props => props.$completed ? 0.6 : 1};
  transition: all 0.2s;
`;

const ButtonGroup = styled.div<{ $isHeader?: boolean }>`
  display: flex;
  gap: 4px;
  opacity: ${props => props.$isHeader ? 1 : 0};
  transition: opacity 0.2s;

  ${ItemContent}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;

  &:hover {
    background: #e0e0e0;
    color: #333;
  }
`;

const DeleteButton = styled(ActionButton)`
  &:hover {
    background: #ffebee;
    color: #d32f2f;
    border-color: #d32f2f;
  }
`;

interface TodoItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (parentId: string) => void;
  onMoveTask?: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (id: string) => void;
  collapsedSections?: Set<string>;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  task,
  onToggle,
  onUpdate,
  onDelete,
  onAddSubtask,
  onMoveTask,
  isCollapsed = false,
  onToggleCollapse,
  collapsedSections,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [isDragging, setIsDragging] = useState(false);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(task.id, editText.trim());
    } else {
      setEditText(task.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    // Determine drop position based on cursor location
    if (task.isHeader || (task.children && task.children.length > 0)) {
      // For headers or tasks with children: top third = before, bottom third = after, middle = inside
      if (y < height * 0.25) {
        setDropPosition('before');
      } else if (y > height * 0.75) {
        setDropPosition('after');
      } else {
        setDropPosition('inside');
      }
    } else {
      // For regular tasks: top half = before, bottom half = after
      if (y < height / 2) {
        setDropPosition('before');
      } else {
        setDropPosition('after');
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the element (not entering a child)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX >= rect.right ||
      e.clientY < rect.top ||
      e.clientY >= rect.bottom
    ) {
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedId = e.dataTransfer.getData('text/plain');
    
    if (draggedId !== task.id && onMoveTask && dropPosition) {
      onMoveTask(draggedId, task.id, dropPosition);
    }
    
    setDropPosition(null);
  };

  return (
    <>
      <ItemContainer 
        $level={task.level}
        $isDragging={isDragging}
        $isDropTarget={dropPosition !== null}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {dropPosition === 'before' && <DropIndicatorLine $position="before" />}
        {dropPosition === 'after' && <DropIndicatorLine $position="after" />}
        {dropPosition === 'inside' && <DropIndicatorInside />}
        <ItemContent $isHeader={task.isHeader} $completed={task.completed && !task.isHeader}>
          <DragHandle
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onMouseDown={(e) => {
              // Prevent drag handle from interfering with other elements
              e.stopPropagation();
            }}
          >
            ⋮⋮
          </DragHandle>
          {task.isHeader && task.children && task.children.length > 0 && (
            <CollapseButton onClick={() => onToggleCollapse?.(task.id)}>
              {isCollapsed ? '▶' : '▼'}
            </CollapseButton>
          )}
          {!task.isHeader && (
            <div style={{ position: 'relative', zIndex: 100 }}>
              <Checkbox
                checked={task.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  console.log('Checkbox onChange!', task.id, 'current:', task.completed);
                  onToggle(task.id);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  console.log('Checkbox mousedown!');
                }}
                onClick={(e) => {
                  console.log('Checkbox click!');
                }}
              />
            </div>
          )}
          {isEditing ? (
            <TextInput
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <TextDisplay
              $completed={task.completed}
              $isHeader={task.isHeader}
              $isDragging={isDragging}
              onClick={() => setIsEditing(true)}
            >
              {task.text}
            </TextDisplay>
          )}
          <ButtonGroup $isHeader={task.isHeader}>
            {task.isHeader ? (
              <>
                <ActionButton onClick={() => onAddSubtask(task.id)}>
                  + Add Task
                </ActionButton>
                <DeleteButton onClick={() => onDelete(task.id)}>
                  Delete
                </DeleteButton>
              </>
            ) : (
              <>
                <ActionButton onClick={() => onAddSubtask(task.id)}>
                  + Sub
                </ActionButton>
                <DeleteButton onClick={() => onDelete(task.id)}>
                  Delete
                </DeleteButton>
              </>
            )}
          </ButtonGroup>
        </ItemContent>
      </ItemContainer>
      {!isCollapsed && task.children?.map((child) => (
        <TodoItem
          key={child.id}
          task={child}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddSubtask={onAddSubtask}
          onMoveTask={onMoveTask}
          isCollapsed={collapsedSections?.has(child.id) || false}
          onToggleCollapse={onToggleCollapse}
          collapsedSections={collapsedSections}
        />
      ))}
    </>
  );
};

