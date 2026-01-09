import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const StatCard = styled.div`
  flex: 1;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
    box-shadow: 0 2px 8px rgba(98, 0, 238, 0.1);
  }
`;

const IconWrapper = styled.div`
  color: #6200ee;
  margin-bottom: 8px;

  .material-symbols-outlined {
    font-size: 32px;
  }
`;

const Value = styled.div`
  font-size: 36px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
`;

const Label = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

interface QuickStatsProps {
  todayCount: number;
  weekCount: number;
  streak: number;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  todayCount,
  weekCount,
  streak,
}) => {
  return (
    <Container>
      <StatCard>
        <IconWrapper>
          <span className="material-symbols-outlined">check_circle</span>
        </IconWrapper>
        <Value>{todayCount}</Value>
        <Label>Completed Today</Label>
      </StatCard>

      <StatCard>
        <IconWrapper>
          <span className="material-symbols-outlined">trending_up</span>
        </IconWrapper>
        <Value>{weekCount}</Value>
        <Label>This Week</Label>
      </StatCard>

      <StatCard>
        <IconWrapper>
          <span className="material-symbols-outlined">local_fire_department</span>
        </IconWrapper>
        <Value>{streak}</Value>
        <Label>{streak === 1 ? 'Day Streak' : 'Days Streak'}</Label>
      </StatCard>
    </Container>
  );
};
