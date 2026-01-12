import React from 'react';
import styled from 'styled-components';
import type { CalendarViewMode, ListSourceMode } from '../../types/Calendar';
import {
  getMonthYearString,
  getWeekRangeString,
  getDayString,
} from '../../utils/calendarUtils';

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const NavigationGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;

  &:hover {
    background: #f5f5f5;
    border-color: #6200ee;
    color: #6200ee;
  }

  .material-symbols-outlined {
    font-size: 20px;
  }
`;

const TodayButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;

  &:hover {
    background: #f5f5f5;
    border-color: #6200ee;
    color: #6200ee;
  }
`;

const DateDisplay = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  min-width: 200px;
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 8px;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#6200ee' : '#666'};
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    color: #6200ee;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }

  @media (max-width: 600px) {
    padding: 8px;

    span:not(.material-symbols-outlined) {
      display: none;
    }
  }
`;

const ListSourceToggle = styled.div`
  display: flex;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 8px;
`;

const ListSourceButton = styled.button<{ $active: boolean }>`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#6200ee' : '#666'};
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    color: #6200ee;
  }

  @media (max-width: 600px) {
    padding: 8px 10px;
    font-size: 12px;
  }
`;

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  listSource: ListSourceMode;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onViewChange: (view: CalendarViewMode) => void;
  onListSourceChange: (source: ListSourceMode) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  listSource,
  onNavigate,
  onViewChange,
  onListSourceChange,
}) => {
  const getDateDisplayString = () => {
    switch (viewMode) {
      case 'month':
        return getMonthYearString(currentDate);
      case 'week':
        return getWeekRangeString(currentDate);
      case 'day':
        return getDayString(currentDate);
      default:
        return getMonthYearString(currentDate);
    }
  };

  return (
    <HeaderContainer>
      <TopRow>
        <NavigationGroup>
          <NavButton onClick={() => onNavigate('prev')} title="Previous">
            <span className="material-symbols-outlined">chevron_left</span>
          </NavButton>
          <NavButton onClick={() => onNavigate('next')} title="Next">
            <span className="material-symbols-outlined">chevron_right</span>
          </NavButton>
          <TodayButton onClick={() => onNavigate('today')}>
            Today
          </TodayButton>
          <DateDisplay>{getDateDisplayString()}</DateDisplay>
        </NavigationGroup>

        <ControlsGroup>
          <ViewToggle>
            <ViewButton
              $active={viewMode === 'list'}
              onClick={() => onViewChange('list')}
              title="List View"
            >
              <span className="material-symbols-outlined">format_list_bulleted</span>
              <span>List</span>
            </ViewButton>
            <ViewButton
              $active={viewMode === 'month'}
              onClick={() => onViewChange('month')}
              title="Month View"
            >
              <span className="material-symbols-outlined">calendar_view_month</span>
              <span>Month</span>
            </ViewButton>
            <ViewButton
              $active={viewMode === 'week'}
              onClick={() => onViewChange('week')}
              title="Week View"
            >
              <span className="material-symbols-outlined">calendar_view_week</span>
              <span>Week</span>
            </ViewButton>
            <ViewButton
              $active={viewMode === 'day'}
              onClick={() => onViewChange('day')}
              title="Day View"
            >
              <span className="material-symbols-outlined">calendar_today</span>
              <span>Day</span>
            </ViewButton>
          </ViewToggle>

          {viewMode !== 'list' && (
            <ListSourceToggle>
              <ListSourceButton
                $active={listSource === 'current'}
                onClick={() => onListSourceChange('current')}
              >
                Current List
              </ListSourceButton>
              <ListSourceButton
                $active={listSource === 'all'}
                onClick={() => onListSourceChange('all')}
              >
                All Lists
              </ListSourceButton>
            </ListSourceToggle>
          )}
        </ControlsGroup>
      </TopRow>
    </HeaderContainer>
  );
};
