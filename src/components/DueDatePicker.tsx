import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const DueDateButton = styled.button<{ $hasDate: boolean; $status: 'overdue' | 'today' | 'upcoming' | 'none' }>`
  background: ${props => {
    if (!props.$hasDate) return 'transparent';
    switch (props.$status) {
      case 'overdue': return 'rgba(239, 68, 68, 0.1)';
      case 'today': return 'rgba(245, 158, 11, 0.1)';
      case 'upcoming': return 'rgba(59, 130, 246, 0.1)';
      default: return 'transparent';
    }
  }};
  border: 1px solid ${props => {
    if (!props.$hasDate) return 'transparent';
    switch (props.$status) {
      case 'overdue': return 'rgba(239, 68, 68, 0.3)';
      case 'today': return 'rgba(245, 158, 11, 0.3)';
      case 'upcoming': return 'rgba(59, 130, 246, 0.3)';
      default: return '#e0e0e0';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'overdue': return '#dc2626';
      case 'today': return '#d97706';
      case 'upcoming': return '#2563eb';
      default: return '#666';
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
      switch (props.$status) {
        case 'overdue': return 'rgba(239, 68, 68, 0.2)';
        case 'today': return 'rgba(245, 158, 11, 0.2)';
        case 'upcoming': return 'rgba(59, 130, 246, 0.2)';
        default: return '#f5f5f5';
      }
    }};
    border-color: ${props => {
      switch (props.$status) {
        case 'overdue': return 'rgba(239, 68, 68, 0.5)';
        case 'today': return 'rgba(245, 158, 11, 0.5)';
        case 'upcoming': return 'rgba(59, 130, 246, 0.5)';
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
  padding: 12px;
  z-index: 99999;
  min-width: 200px;
  max-height: 80vh;
  overflow-y: auto;
`;

const QuickOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
`;

const QuickOption = styled.button`
  background: none;
  border: none;
  padding: 8px 12px;
  text-align: left;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  .material-symbols-outlined {
    font-size: 16px;
    color: #666;
  }
`;

const DateInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DateInputLabel = styled.label`
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  padding: 8px 12px;
  text-align: center;
  font-size: 13px;
  color: #dc2626;
  cursor: pointer;
  border-radius: 4px;
  margin-top: 8px;
  width: 100%;
  transition: background 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

interface DueDatePickerProps {
  dueDate: string | undefined;
  onChange: (date: string | undefined) => void;
  disabled?: boolean;
}

const getDateStatus = (dueDate: string | undefined): 'overdue' | 'today' | 'upcoming' | 'none' => {
  if (!dueDate) return 'none';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');

  if (due < today) return 'overdue';
  if (due.getTime() === today.getTime()) return 'today';
  return 'upcoming';
};

const formatDisplayDate = (dueDate: string | undefined): string => {
  if (!dueDate) return '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const due = new Date(dueDate + 'T00:00:00');

  if (due.getTime() === today.getTime()) return 'Today';
  if (due.getTime() === tomorrow.getTime()) return 'Tomorrow';

  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays <= 7) return due.toLocaleDateString('en-US', { weekday: 'short' });

  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getTomorrowString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getNextWeekString = (): string => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return nextWeek.toISOString().split('T')[0];
};

export const DueDatePicker: React.FC<DueDatePickerProps> = ({
  dueDate,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, openUpward: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const status = getDateStatus(dueDate);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 280; // Approximate height of dropdown
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setPosition({
        top: openUpward ? (window.innerHeight - rect.top + 4) : (rect.bottom + 4),
        left: rect.left,
        openUpward,
      });
    }
    setIsOpen(true);
  };

  const handleQuickOption = (date: string) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value || undefined);
  };

  const handleClear = () => {
    onChange(undefined);
    setIsOpen(false);
  };

  if (disabled) {
    return null;
  }

  return (
    <Container>
      <DueDateButton
        ref={buttonRef}
        $hasDate={!!dueDate}
        $status={status}
        onClick={(e) => {
          e.stopPropagation();
          if (isOpen) {
            setIsOpen(false);
          } else {
            handleOpen();
          }
        }}
        title={dueDate ? `Due: ${dueDate}` : 'Set due date'}
      >
        <span className="material-symbols-outlined">
          {status === 'overdue' ? 'warning' : 'calendar_today'}
        </span>
        {dueDate ? formatDisplayDate(dueDate) : 'Due date'}
      </DueDateButton>

      {isOpen && createPortal(
        <Dropdown
          ref={dropdownRef}
          $top={position.top}
          $left={position.left}
          $openUpward={position.openUpward}
          onClick={(e) => e.stopPropagation()}
        >
          <QuickOptions>
            <QuickOption onClick={() => handleQuickOption(getTodayString())}>
              <span className="material-symbols-outlined">today</span>
              Today
            </QuickOption>
            <QuickOption onClick={() => handleQuickOption(getTomorrowString())}>
              <span className="material-symbols-outlined">event</span>
              Tomorrow
            </QuickOption>
            <QuickOption onClick={() => handleQuickOption(getNextWeekString())}>
              <span className="material-symbols-outlined">date_range</span>
              Next week
            </QuickOption>
          </QuickOptions>

          <DateInputContainer>
            <DateInputLabel>Pick a date</DateInputLabel>
            <DateInput
              type="date"
              value={dueDate || ''}
              onChange={handleDateChange}
              min={getTodayString()}
            />
          </DateInputContainer>

          {dueDate && (
            <ClearButton onClick={handleClear}>
              Clear due date
            </ClearButton>
          )}
        </Dropdown>,
        document.body
      )}
    </Container>
  );
};

export { getDateStatus, formatDisplayDate };
