import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import type { Task } from '../types/Task';
import { generateGoogleCalendarUrl, downloadICS } from '../utils/calendar';
import { trackAddToGoogleCalendar, trackDownloadICS } from '../utils/analytics';

const CalendarButton = styled.button`
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

const DropdownContainer = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${props => props.$top}px;
  left: ${props => props.$left}px;
  z-index: 10000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #333;
  transition: background 0.15s;

  &:hover {
    background: #f5f5f5;
  }

  .material-symbols-outlined {
    font-size: 20px;
    color: #666;
  }
`;

const ItemText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ItemLabel = styled.span`
  font-weight: 500;
`;

const ItemDescription = styled.span`
  font-size: 12px;
  color: #888;
`;

interface AddToCalendarProps {
  task: Task;
}

export const AddToCalendar: React.FC<AddToCalendarProps> = ({ task }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 200;

      // Position below the button
      let top = rect.bottom + 4;
      let left = rect.left;

      // Adjust if dropdown would go off-screen right
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 16;
      }

      // Adjust if dropdown would go off-screen bottom
      if (top + 150 > window.innerHeight) {
        top = rect.top - 150 - 4;
      }

      setPosition({ top, left });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(task);
    if (url) {
      window.open(url, '_blank');
      trackAddToGoogleCalendar();
    }
    setIsOpen(false);
  };

  const handleDownloadICS = () => {
    downloadICS(task);
    trackDownloadICS();
    setIsOpen(false);
  };

  // Don't render if task has no due date
  if (!task.dueDate) return null;

  return (
    <>
      <CalendarButton
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        title="Add to calendar"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>event</span>
      </CalendarButton>

      {isOpen &&
        createPortal(
          <DropdownContainer
            ref={dropdownRef}
            $top={position.top}
            $left={position.left}
          >
            <DropdownHeader>Add to Calendar</DropdownHeader>
            <DropdownItem onClick={handleGoogleCalendar}>
              <span className="material-symbols-outlined">calendar_today</span>
              <ItemText>
                <ItemLabel>Google Calendar</ItemLabel>
                <ItemDescription>Opens in new tab</ItemDescription>
              </ItemText>
            </DropdownItem>
            <DropdownItem onClick={handleDownloadICS}>
              <span className="material-symbols-outlined">download_2</span>
              <ItemText>
                <ItemLabel>Download .ics file</ItemLabel>
                <ItemDescription>Works with any calendar app</ItemDescription>
              </ItemText>
            </DropdownItem>
          </DropdownContainer>,
          document.body
        )}
    </>
  );
};
