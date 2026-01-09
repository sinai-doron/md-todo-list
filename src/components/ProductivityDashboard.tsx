import React, { useEffect } from 'react';
import styled from 'styled-components';
import type { ProductivityStats } from '../types/Statistics';
import type { TodoList } from '../types/TodoList';
import { QuickStats } from './QuickStats';
import { CompletionChart } from './CompletionChart';
import { ListCompletionRates } from './ListCompletionRates';
import {
  getTodayCompletions,
  getWeekCompletions,
  getCompletionsForDays,
} from '../utils/statisticsStorage';
import { trackDashboardOpened } from '../utils/analytics';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;

  .material-symbols-outlined {
    font-size: 24px;
    color: #6200ee;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }

  .material-symbols-outlined {
    font-size: 24px;
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const StreakBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border: 1px solid #fed7aa;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const StreakIcon = styled.span`
  font-size: 28px;
  color: #ea580c;
`;

const StreakInfo = styled.div`
  flex: 1;
`;

const StreakLabel = styled.div`
  font-size: 12px;
  color: #9a3412;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StreakValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #c2410c;
`;

const LongestStreak = styled.div`
  text-align: right;
`;

const LongestLabel = styled.div`
  font-size: 11px;
  color: #9a3412;
`;

const LongestValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #ea580c;
`;

interface ProductivityDashboardProps {
  stats: ProductivityStats;
  lists: { [listId: string]: TodoList };
  onClose: () => void;
}

export const ProductivityDashboard: React.FC<ProductivityDashboardProps> = ({
  stats,
  lists,
  onClose,
}) => {
  useEffect(() => {
    trackDashboardOpened();
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const todayCount = getTodayCompletions(stats);
  const weekCount = getWeekCompletions(stats);
  const getChartData = (days: number) => getCompletionsForDays(stats, days);

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <span className="material-symbols-outlined">insights</span>
            Productivity Dashboard
          </Title>
          <CloseButton onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </CloseButton>
        </Header>

        <Content>
          {stats.currentStreak > 0 && (
            <StreakBadge>
              <StreakIcon className="material-symbols-outlined">local_fire_department</StreakIcon>
              <StreakInfo>
                <StreakLabel>Current Streak</StreakLabel>
                <StreakValue>
                  {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
                </StreakValue>
              </StreakInfo>
              {stats.longestStreak > stats.currentStreak && (
                <LongestStreak>
                  <LongestLabel>Longest</LongestLabel>
                  <LongestValue>{stats.longestStreak} days</LongestValue>
                </LongestStreak>
              )}
            </StreakBadge>
          )}

          <QuickStats
            todayCount={todayCount}
            weekCount={weekCount}
            streak={stats.currentStreak}
          />

          <CompletionChart getChartData={getChartData} />

          <ListCompletionRates lists={lists} />
        </Content>
      </Modal>
    </Overlay>
  );
};
