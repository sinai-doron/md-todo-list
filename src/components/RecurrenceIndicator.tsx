import React from 'react';
import styled from 'styled-components';
import type { RecurrenceRule } from '../types/Task';
import { getRecurrenceDescription } from '../utils/recurrence';

const IndicatorButton = styled.button<{ $hasRecurrence: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$hasRecurrence ? 'rgba(98, 0, 238, 0.1)' : 'transparent'};
  border: none;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: ${props => props.$hasRecurrence ? '#6200ee' : '#999'};

  &:hover {
    background: ${props => props.$hasRecurrence ? 'rgba(98, 0, 238, 0.15)' : 'rgba(0, 0, 0, 0.05)'};
    color: ${props => props.$hasRecurrence ? '#6200ee' : '#666'};
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;

  &:hover .tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: #333;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  z-index: 1000;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
`;

interface RecurrenceIndicatorProps {
  recurrence?: RecurrenceRule;
  onClick: () => void;
}

export const RecurrenceIndicator: React.FC<RecurrenceIndicatorProps> = ({
  recurrence,
  onClick,
}) => {
  const hasRecurrence = !!recurrence;
  const description = recurrence ? getRecurrenceDescription(recurrence) : 'Set repeat';

  return (
    <TooltipWrapper>
      <IndicatorButton
        $hasRecurrence={hasRecurrence}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        title={description}
      >
        <span className="material-symbols-outlined">
          {hasRecurrence ? 'repeat' : 'event_repeat'}
        </span>
      </IndicatorButton>
      <Tooltip className="tooltip">{description}</Tooltip>
    </TooltipWrapper>
  );
};

/**
 * Simple badge to show recurrence without interaction
 */
const BadgeWrapper = styled.span<{ $compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(98, 0, 238, 0.1);
  color: #6200ee;
  padding: ${props => props.$compact ? '2px 6px' : '4px 8px'};
  border-radius: 4px;
  font-size: ${props => props.$compact ? '11px' : '12px'};
  font-weight: 500;

  .material-symbols-outlined {
    font-size: ${props => props.$compact ? '14px' : '16px'};
  }
`;

interface RecurrenceBadgeProps {
  recurrence: RecurrenceRule;
  compact?: boolean;
}

export const RecurrenceBadge: React.FC<RecurrenceBadgeProps> = ({
  recurrence,
  compact = false,
}) => {
  const description = getRecurrenceDescription(recurrence);

  return (
    <BadgeWrapper $compact={compact} title={description}>
      <span className="material-symbols-outlined">repeat</span>
      {!compact && <span>{description}</span>}
    </BadgeWrapper>
  );
};
