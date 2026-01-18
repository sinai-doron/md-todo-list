import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import type { Priority } from '../types/Task';

const Container = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const PriorityButton = styled.button<{ $priority?: Priority }>`
  background: ${props => {
    switch (props.$priority) {
      case 'high': return 'rgba(239, 68, 68, 0.1)';
      case 'medium': return 'rgba(249, 115, 22, 0.1)';
      case 'low': return 'rgba(59, 130, 246, 0.1)';
      default: return 'transparent';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$priority) {
      case 'high': return 'rgba(239, 68, 68, 0.3)';
      case 'medium': return 'rgba(249, 115, 22, 0.3)';
      case 'low': return 'rgba(59, 130, 246, 0.3)';
      default: return 'transparent';
    }
  }};
  color: ${props => {
    switch (props.$priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#ea580c';
      case 'low': return '#2563eb';
      default: return '#999';
    }
  }};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${props => {
      switch (props.$priority) {
        case 'high': return 'rgba(239, 68, 68, 0.2)';
        case 'medium': return 'rgba(249, 115, 22, 0.2)';
        case 'low': return 'rgba(59, 130, 246, 0.2)';
        default: return '#f5f5f5';
      }
    }};
    border-color: ${props => {
      switch (props.$priority) {
        case 'high': return 'rgba(239, 68, 68, 0.5)';
        case 'medium': return 'rgba(249, 115, 22, 0.5)';
        case 'low': return 'rgba(59, 130, 246, 0.5)';
        default: return '#ccc';
      }
    }};
  }

  .material-symbols-outlined {
    font-size: 14px;
  }
`;

const Dropdown = styled.div<{ $top: number; $left: number; $openUpward?: boolean }>`
  position: fixed;
  top: ${props => props.$openUpward ? 'auto' : `${props.$top}px`};
  bottom: ${props => props.$openUpward ? `${props.$top}px` : 'auto'};
  left: ${props => props.$left}px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  padding: 8px;
  z-index: 99999;
  min-width: 140px;
`;

const PriorityOption = styled.button<{ $priority?: Priority; $isSelected: boolean }>`
  background: ${props => props.$isSelected ? '#f0f0f0' : 'none'};
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  transition: background 0.15s;

  &:hover {
    background: #f5f5f5;
  }
`;

const PriorityDot = styled.span<{ $priority?: Priority }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f97316';
      case 'low': return '#3b82f6';
      default: return '#d1d5db';
    }
  }};
`;

const PriorityLabel = styled.span<{ $priority?: Priority }>`
  color: ${props => {
    switch (props.$priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#ea580c';
      case 'low': return '#2563eb';
      default: return '#666';
    }
  }};
`;

interface PriorityPickerProps {
  priority?: Priority;
  onPriorityChange: (priority: Priority | undefined) => void;
}

export const PriorityPicker: React.FC<PriorityPickerProps> = ({
  priority,
  onPriorityChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [openUpward, setOpenUpward] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const shouldOpenUpward = spaceBelow < 200;

      setOpenUpward(shouldOpenUpward);
      setDropdownPosition({
        top: shouldOpenUpward ? viewportHeight - rect.top + 4 : rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (newPriority: Priority | undefined) => {
    onPriorityChange(newPriority);
    setIsOpen(false);
  };

  const getPriorityLabel = (p?: Priority) => {
    switch (p) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Priority';
    }
  };

  return (
    <Container>
      <PriorityButton
        ref={buttonRef}
        $priority={priority}
        onClick={() => setIsOpen(!isOpen)}
        title="Set priority"
      >
        <span className="material-symbols-outlined">flag</span>
        {priority && getPriorityLabel(priority)}
      </PriorityButton>

      {isOpen &&
        createPortal(
          <Dropdown
            ref={dropdownRef}
            $top={dropdownPosition.top}
            $left={dropdownPosition.left}
            $openUpward={openUpward}
          >
            <PriorityOption
              $priority="high"
              $isSelected={priority === 'high'}
              onClick={() => handleSelect('high')}
            >
              <PriorityDot $priority="high" />
              <PriorityLabel $priority="high">High</PriorityLabel>
            </PriorityOption>
            <PriorityOption
              $priority="medium"
              $isSelected={priority === 'medium'}
              onClick={() => handleSelect('medium')}
            >
              <PriorityDot $priority="medium" />
              <PriorityLabel $priority="medium">Medium</PriorityLabel>
            </PriorityOption>
            <PriorityOption
              $priority="low"
              $isSelected={priority === 'low'}
              onClick={() => handleSelect('low')}
            >
              <PriorityDot $priority="low" />
              <PriorityLabel $priority="low">Low</PriorityLabel>
            </PriorityOption>
            {priority && (
              <PriorityOption
                $isSelected={false}
                onClick={() => handleSelect(undefined)}
              >
                <PriorityDot />
                <PriorityLabel>Clear</PriorityLabel>
              </PriorityOption>
            )}
          </Dropdown>,
          document.body
        )}
    </Container>
  );
};

export const getPriorityColor = (priority?: Priority): string => {
  switch (priority) {
    case 'high': return '#ef4444';
    case 'medium': return '#f97316';
    case 'low': return '#3b82f6';
    default: return 'transparent';
  }
};
