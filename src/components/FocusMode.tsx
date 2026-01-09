import React, { useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import type { Task } from '../types/Task';
import {
  trackFocusModeEntered,
  trackFocusModeExited,
  trackFocusModeTaskCompleted,
} from '../utils/analytics';
import { PomodoroTimer } from './PomodoroTimer';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ExitButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const TaskCard = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px 64px;
  max-width: 800px;
  width: 90%;
  text-align: center;
  animation: ${scaleIn} 0.3s ease-out;
`;

const TaskContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
`;

const TaskText = styled.h1<{ $completed: boolean }>`
  color: white;
  font-size: 32px;
  font-weight: 400;
  line-height: 1.4;
  margin: 0;
  text-decoration: ${props => props.$completed ? 'line-through' : 'none'};
  opacity: ${props => props.$completed ? 0.5 : 1};
  transition: all 0.3s;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  user-select: none;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  cursor: pointer;
`;

const StyledCheckbox = styled.div<{ $checked: boolean }>`
  width: 48px;
  height: 48px;
  border: 3px solid ${props => props.$checked ? '#22c55e' : 'rgba(255, 255, 255, 0.4)'};
  border-radius: 12px;
  background: ${props => props.$checked ? '#22c55e' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$checked ? '#16a34a' : 'rgba(255, 255, 255, 0.6)'};
    transform: scale(1.05);
  }

  .material-symbols-outlined {
    font-size: 32px;
    color: white;
    opacity: ${props => props.$checked ? 1 : 0};
    transition: opacity 0.2s;
  }
`;

const CheckboxLabel = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
`;

const CompletedMessage = styled.div`
  color: #22c55e;
  font-size: 18px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Hint = styled.p`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  margin: 0;
`;

interface FocusModeProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onToggle: (id: string) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({
  task,
  isOpen,
  onClose,
  onToggle,
}) => {
  const startTimeRef = useRef<number>(0);
  const wasCompletedRef = useRef<boolean>(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      startTimeRef.current = Date.now();
      wasCompletedRef.current = task?.completed || false;
      trackFocusModeEntered();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (isOpen && startTimeRef.current) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        trackFocusModeExited(timeSpent);
      }
    };
  }, [isOpen, handleKeyDown, task?.completed]);

  if (!isOpen || !task) {
    return null;
  }

  const handleToggle = () => {
    if (!task.completed) {
      trackFocusModeTaskCompleted();
    }
    onToggle(task.id);
  };

  return (
    <Overlay>
      <ExitButton onClick={onClose}>
        <span className="material-symbols-outlined">close</span>
        Exit Focus Mode
      </ExitButton>

      <TaskCard>
        <TaskContent>
          <TaskText $completed={task.completed}>
            {task.text}
          </TaskText>

          <PomodoroTimer />

          <CheckboxContainer>
            <HiddenCheckbox
              checked={task.completed}
              onChange={handleToggle}
            />
            <StyledCheckbox $checked={task.completed}>
              <span className="material-symbols-outlined">check</span>
            </StyledCheckbox>
            <CheckboxLabel>
              {task.completed ? 'Completed!' : 'Mark as complete'}
            </CheckboxLabel>
          </CheckboxContainer>

          {task.completed && (
            <CompletedMessage>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                celebration
              </span>
              Great job! Task completed.
            </CompletedMessage>
          )}
        </TaskContent>
      </TaskCard>

      <Hint>Press Escape to exit</Hint>
    </Overlay>
  );
};
