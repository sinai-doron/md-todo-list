import React from 'react';
import styled from 'styled-components';
import type { HabitWithStats } from '../types/Habit';
import { HabitCard } from './HabitCard';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CompletionBadge = styled.span<{ $allComplete: boolean }>`
  background: ${props => props.$allComplete ? '#dcfce7' : '#f5f5f5'};
  color: ${props => props.$allComplete ? '#16a34a' : '#666'};
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;

  .material-symbols-outlined {
    font-size: 48px;
    color: #ccc;
    margin-bottom: 12px;
  }
`;

const EmptyTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const EmptyDescription = styled.div`
  font-size: 14px;
  color: #666;
`;

interface HabitListProps {
  habits: HabitWithStats[];
  title?: string;
  showCompletionCount?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onToggle: (habitId: string) => void;
  onIncrement?: (habitId: string) => void;
  onDecrement?: (habitId: string) => void;
  onHabitClick?: (habit: HabitWithStats) => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  title,
  showCompletionCount = true,
  emptyMessage = 'No habits yet',
  emptyDescription = 'Create a habit to start tracking',
  onToggle,
  onIncrement,
  onDecrement,
  onHabitClick,
}) => {
  const completedCount = habits.filter(h => h.completedToday).length;
  const totalCount = habits.length;
  const allComplete = completedCount === totalCount && totalCount > 0;

  if (habits.length === 0) {
    return (
      <Container>
        {title && (
          <Header>
            <Title>{title}</Title>
          </Header>
        )}
        <EmptyState>
          <span className="material-symbols-outlined">self_improvement</span>
          <EmptyTitle>{emptyMessage}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      {(title || showCompletionCount) && (
        <Header>
          {title && <Title>{title}</Title>}
          {showCompletionCount && (
            <CompletionBadge $allComplete={allComplete}>
              {completedCount} / {totalCount} completed
            </CompletionBadge>
          )}
        </Header>
      )}
      {habits.map(habit => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onToggle={onToggle}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          onClick={onHabitClick}
        />
      ))}
    </Container>
  );
};
