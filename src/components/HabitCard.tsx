import React from 'react';
import styled from 'styled-components';
import type { HabitWithStats } from '../types/Habit';

const Card = styled.div<{ $color: string; $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 2px solid ${props => props.$completed ? props.$color : '#e0e0e0'};
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: ${props => props.$color};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const IconWrapper = styled.div<{ $color: string; $completed: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$completed ? props.$color : `${props.$color}20`};
  color: ${props => props.$completed ? 'white' : props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;

  .material-symbols-outlined {
    font-size: 24px;
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Name = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const Description = styled.div`
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

const StreakBadge = styled.div<{ $hasStreak: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: ${props => props.$hasStreak ? '#fff3e0' : '#f5f5f5'};
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.$hasStreak ? '#f57c00' : '#999'};

  .material-symbols-outlined {
    font-size: 16px;
  }
`;

const CheckButton = styled.button<{ $checked: boolean; $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${props => props.$checked ? props.$color : '#ddd'};
  background: ${props => props.$checked ? props.$color : 'transparent'};
  color: ${props => props.$checked ? 'white' : '#ddd'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    border-color: ${props => props.$color};
    background: ${props => props.$checked ? props.$color : `${props.$color}10`};
    color: ${props => props.$checked ? 'white' : props.$color};
  }

  .material-symbols-outlined {
    font-size: 24px;
  }
`;

const CountDisplay = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.$color};
`;

const CountButton = styled.button<{ $color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid ${props => props.$color};
  background: transparent;
  color: ${props => props.$color};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 18px;
  line-height: 1;

  &:hover {
    background: ${props => `${props.$color}10`};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

interface HabitCardProps {
  habit: HabitWithStats;
  onToggle: (habitId: string) => void;
  onIncrement?: (habitId: string) => void;
  onDecrement?: (habitId: string) => void;
  onClick?: (habit: HabitWithStats) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggle,
  onIncrement,
  onDecrement,
  onClick,
}) => {
  const color = habit.color || '#22c55e';
  const isCountable = habit.targetPerDay && habit.targetPerDay > 1;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(habit.id);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIncrement?.(habit.id);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (habit.todayCount > 0) {
      onDecrement?.(habit.id);
    }
  };

  return (
    <Card
      $color={color}
      $completed={habit.completedToday}
      onClick={() => onClick?.(habit)}
    >
      <IconWrapper $color={color} $completed={habit.completedToday}>
        <span className="material-symbols-outlined">
          {habit.icon || 'check_circle'}
        </span>
      </IconWrapper>

      <Content>
        <Name>{habit.name}</Name>
        {habit.description && <Description>{habit.description}</Description>}
      </Content>

      <Stats>
        <StreakBadge $hasStreak={habit.currentStreak > 0}>
          <span className="material-symbols-outlined">local_fire_department</span>
          {habit.currentStreak} {habit.currentStreak === 1 ? 'day' : 'days'}
        </StreakBadge>

        {isCountable ? (
          <CountDisplay $color={color}>
            <CountButton
              $color={color}
              onClick={handleDecrement}
              disabled={habit.todayCount === 0}
            >
              -
            </CountButton>
            <span>{habit.todayCount} / {habit.targetPerDay}</span>
            <CountButton $color={color} onClick={handleIncrement}>
              +
            </CountButton>
          </CountDisplay>
        ) : (
          <CheckButton
            $checked={habit.completedToday}
            $color={color}
            onClick={handleToggle}
          >
            <span className="material-symbols-outlined">
              {habit.completedToday ? 'check' : 'radio_button_unchecked'}
            </span>
          </CheckButton>
        )}
      </Stats>
    </Card>
  );
};
