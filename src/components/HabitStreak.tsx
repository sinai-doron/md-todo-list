import React from 'react';
import styled from 'styled-components';

const Container = styled.div<{ $size: 'small' | 'medium' | 'large' }>`
  display: flex;
  align-items: center;
  gap: ${props => props.$size === 'small' ? '4px' : '8px'};
`;

const FireIcon = styled.span<{ $active: boolean; $size: 'small' | 'medium' | 'large' }>`
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '16px';
      case 'medium': return '24px';
      case 'large': return '32px';
    }
  }};
  color: ${props => props.$active ? '#f59e0b' : '#ccc'};

  ${props => props.$active && `
    filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.5));
  `}
`;

const Count = styled.span<{ $active: boolean; $size: 'small' | 'medium' | 'large' }>`
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '13px';
      case 'medium': return '18px';
      case 'large': return '24px';
    }
  }};
  font-weight: 700;
  color: ${props => props.$active ? '#f59e0b' : '#999'};
`;

const Label = styled.span<{ $size: 'small' | 'medium' | 'large' }>`
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '16px';
    }
  }};
  color: #666;
`;

interface HabitStreakProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const HabitStreak: React.FC<HabitStreakProps> = ({
  streak,
  size = 'medium',
  showLabel = true,
}) => {
  const isActive = streak > 0;

  return (
    <Container $size={size}>
      <FireIcon $active={isActive} $size={size} className="material-symbols-outlined">
        local_fire_department
      </FireIcon>
      <Count $active={isActive} $size={size}>
        {streak}
      </Count>
      {showLabel && (
        <Label $size={size}>
          {streak === 1 ? 'day' : 'days'}
        </Label>
      )}
    </Container>
  );
};

// Animated streak badge for achievements
const AnimatedBadge = styled.div<{ $milestone: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${props => props.$milestone
    ? 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)'
    : '#fff3e0'
  };
  border-radius: 12px;
  position: relative;
  overflow: hidden;

  ${props => props.$milestone && `
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent 0%,
        rgba(255, 255, 255, 0.3) 50%,
        transparent 100%
      );
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%) rotate(45deg); }
      100% { transform: translateX(100%) rotate(45deg); }
    }
  `}
`;

const BadgeContent = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
`;

const BadgeTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
`;

const BadgeSubtitle = styled.div`
  font-size: 12px;
  color: #b45309;
`;

interface StreakBadgeProps {
  streak: number;
  habitName: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, habitName }) => {
  const isMilestone = [7, 14, 21, 30, 60, 90, 100, 365].includes(streak);

  const getMessage = () => {
    if (streak >= 365) return 'One year!';
    if (streak >= 100) return '100 days!';
    if (streak >= 90) return '90 days!';
    if (streak >= 60) return '60 days!';
    if (streak >= 30) return '30 days!';
    if (streak >= 21) return '3 weeks!';
    if (streak >= 14) return '2 weeks!';
    if (streak >= 7) return '1 week!';
    return `${streak} day streak`;
  };

  return (
    <AnimatedBadge $milestone={isMilestone}>
      <HabitStreak streak={streak} size="large" showLabel={false} />
      <BadgeContent>
        <BadgeTitle>{getMessage()}</BadgeTitle>
        <BadgeSubtitle>{habitName}</BadgeSubtitle>
      </BadgeContent>
    </AnimatedBadge>
  );
};
