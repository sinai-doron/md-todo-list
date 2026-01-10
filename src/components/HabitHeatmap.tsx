import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import type { HabitCompletion } from '../types/Habit';
import { generateHeatmapData, getHeatmapIntensity, formatDateForTooltip } from '../utils/habitStats';

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
`;

const LegendLabel = styled.span`
  margin: 0 4px;
`;

const LegendCell = styled.div<{ $intensity: number }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${props => getIntensityColor(props.$intensity)};
`;

const GridWrapper = styled.div`
  overflow-x: auto;
  padding-bottom: 8px;
`;

const Grid = styled.div`
  display: flex;
  gap: 3px;
`;

const WeekColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const DayLabels = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-right: 4px;
  font-size: 10px;
  color: #666;
`;

const DayLabel = styled.div`
  height: 12px;
  display: flex;
  align-items: center;
`;

const Cell = styled.div<{ $intensity: number }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${props => getIntensityColor(props.$intensity)};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    transform: scale(1.3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

const Tooltip = styled.div<{ $x: number; $y: number; $visible: boolean }>`
  position: fixed;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  transform: translate(-50%, -100%);
  background: #333;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transition: opacity 0.15s;
  z-index: 1000;
  margin-top: -8px;

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

const MonthLabel = styled.div<{ $offset: number }>`
  position: absolute;
  left: ${props => props.$offset * 15 + 20}px;
`;

const MonthLabelsContainer = styled.div`
  position: relative;
  height: 16px;
  margin-bottom: 4px;
`;

const Summary = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

// Color scale from gray to green
const getIntensityColor = (intensity: number): string => {
  switch (intensity) {
    case 0: return '#ebedf0';
    case 1: return '#9be9a8';
    case 2: return '#40c463';
    case 3: return '#30a14e';
    case 4: return '#216e39';
    default: return '#ebedf0';
  }
};

interface HabitHeatmapProps {
  completions: HabitCompletion[];
  days?: number;
  showSummary?: boolean;
}

export const HabitHeatmap: React.FC<HabitHeatmapProps> = ({
  completions,
  days = 365,
  showSummary = true,
}) => {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  const heatmapData = useMemo(() => generateHeatmapData(completions, days), [completions, days]);

  // Group by weeks
  const weeks = useMemo(() => {
    const weekMap = new Map<number, typeof heatmapData>();
    heatmapData.forEach(cell => {
      const existing = weekMap.get(cell.weekIndex) || [];
      existing.push(cell);
      weekMap.set(cell.weekIndex, existing);
    });
    return Array.from(weekMap.values());
  }, [heatmapData]);

  // Get month labels with their positions
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = '';

    heatmapData.forEach(cell => {
      if (cell.dayOfWeek === 0) { // First day of week (Sunday)
        const date = new Date(cell.date + 'T00:00:00');
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        if (month !== lastMonth) {
          labels.push({ month, weekIndex: cell.weekIndex });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [heatmapData]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalCompletions = completions.reduce((sum, c) => sum + c.count, 0);
    const daysWithCompletions = new Set(completions.filter(c => c.count > 0).map(c => c.date)).size;

    // Find longest streak
    let longestStreak = 0;
    let currentStreak = 0;
    const sortedDates = [...new Set(heatmapData.map(d => d.date))].sort();
    const completedDates = new Set(completions.filter(c => c.count > 0).map(c => c.date));

    sortedDates.forEach(date => {
      if (completedDates.has(date)) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return { totalCompletions, daysWithCompletions, longestStreak };
  }, [completions, heatmapData]);

  const handleMouseEnter = (cell: typeof heatmapData[0], e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dateStr = formatDateForTooltip(cell.date);
    const content = cell.count === 0
      ? `No completions on ${dateStr}`
      : `${cell.count} completion${cell.count > 1 ? 's' : ''} on ${dateStr}`;

    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <Container>
      <Header>
        <Title>Activity</Title>
        <Legend>
          <LegendLabel>Less</LegendLabel>
          {[0, 1, 2, 3, 4].map(intensity => (
            <LegendCell key={intensity} $intensity={intensity} />
          ))}
          <LegendLabel>More</LegendLabel>
        </Legend>
      </Header>

      <MonthLabelsContainer>
        {monthLabels.map(({ month, weekIndex }) => (
          <MonthLabel key={`${month}-${weekIndex}`} $offset={weekIndex}>
            {month}
          </MonthLabel>
        ))}
      </MonthLabelsContainer>

      <GridWrapper>
        <div style={{ display: 'flex' }}>
          <DayLabels>
            <DayLabel></DayLabel>
            <DayLabel>Mon</DayLabel>
            <DayLabel></DayLabel>
            <DayLabel>Wed</DayLabel>
            <DayLabel></DayLabel>
            <DayLabel>Fri</DayLabel>
            <DayLabel></DayLabel>
          </DayLabels>
          <Grid>
            {weeks.map((week, weekIndex) => (
              <WeekColumn key={weekIndex}>
                {week.map(cell => (
                  <Cell
                    key={cell.date}
                    $intensity={getHeatmapIntensity(cell.count)}
                    onMouseEnter={(e) => handleMouseEnter(cell, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}
              </WeekColumn>
            ))}
          </Grid>
        </div>
      </GridWrapper>

      <Tooltip
        $visible={tooltip.visible}
        $x={tooltip.x}
        $y={tooltip.y}
      >
        {tooltip.content}
      </Tooltip>

      {showSummary && (
        <Summary>
          <SummaryItem>
            <SummaryValue>{stats.totalCompletions}</SummaryValue>
            <SummaryLabel>Total completions</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>{stats.daysWithCompletions}</SummaryValue>
            <SummaryLabel>Days active</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>{stats.longestStreak}</SummaryValue>
            <SummaryLabel>Longest streak</SummaryLabel>
          </SummaryItem>
        </Summary>
      )}
    </Container>
  );
};
