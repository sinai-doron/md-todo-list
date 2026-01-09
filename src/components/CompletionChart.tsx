import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h4`
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 4px;
  background: #f0f0f0;
  border-radius: 6px;
  padding: 2px;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#6200ee' : '#666'};
  font-weight: ${props => props.$active ? '600' : '400'};
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    color: #6200ee;
  }
`;

const ChartContainer = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
`;

const BarsContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
  margin-bottom: 12px;
`;

const BarWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

const Bar = styled.div<{ $height: number; $isToday: boolean }>`
  width: 100%;
  max-width: 24px;
  height: ${props => Math.max(props.$height, 4)}%;
  background: ${props => props.$isToday ? '#6200ee' : '#a78bfa'};
  border-radius: 4px 4px 0 0;
  transition: all 0.3s;
  margin-top: auto;
  position: relative;

  &:hover {
    background: #6200ee;
    transform: scaleY(1.02);
  }
`;

const BarTooltip = styled.div`
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;

  ${Bar}:hover & {
    opacity: 1;
  }
`;

const LabelsContainer = styled.div`
  display: flex;
  gap: 4px;
`;

const Label = styled.div<{ $isToday: boolean }>`
  flex: 1;
  text-align: center;
  font-size: 10px;
  color: ${props => props.$isToday ? '#6200ee' : '#999'};
  font-weight: ${props => props.$isToday ? '600' : '400'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

interface CompletionChartProps {
  getChartData: (days: number) => { date: string; count: number }[];
}

export const CompletionChart: React.FC<CompletionChartProps> = ({ getChartData }) => {
  const [days, setDays] = useState<7 | 30>(7);
  const data = getChartData(days);
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const today = new Date().toISOString().split('T')[0];

  const formatLabel = (dateStr: string, index: number, total: number): string => {
    const date = new Date(dateStr + 'T00:00:00');
    if (days === 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
    } else {
      // For 30 days, show every 5th label
      if (index % 5 === 0 || index === total - 1) {
        return date.getDate().toString();
      }
      return '';
    }
  };

  const hasData = data.some(d => d.count > 0);

  return (
    <Container>
      <Header>
        <Title>Completion Trend</Title>
        <ToggleGroup>
          <ToggleButton $active={days === 7} onClick={() => setDays(7)}>
            7 days
          </ToggleButton>
          <ToggleButton $active={days === 30} onClick={() => setDays(30)}>
            30 days
          </ToggleButton>
        </ToggleGroup>
      </Header>

      <ChartContainer>
        {hasData ? (
          <>
            <BarsContainer>
              {data.map((d) => (
                <BarWrapper key={d.date}>
                  <Bar
                    $height={(d.count / maxCount) * 100}
                    $isToday={d.date === today}
                  >
                    <BarTooltip>{d.count} tasks</BarTooltip>
                  </Bar>
                </BarWrapper>
              ))}
            </BarsContainer>
            <LabelsContainer>
              {data.map((d, i) => (
                <Label key={d.date} $isToday={d.date === today}>
                  {formatLabel(d.date, i, data.length)}
                </Label>
              ))}
            </LabelsContainer>
          </>
        ) : (
          <EmptyState>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#ccc', marginBottom: 8, display: 'block' }}>
              bar_chart
            </span>
            No completions yet. Complete some tasks to see your trend!
          </EmptyState>
        )}
      </ChartContainer>
    </Container>
  );
};
