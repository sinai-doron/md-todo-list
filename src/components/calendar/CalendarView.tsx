import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import type { Task } from '../../types/Task';
import type { TodoList as TodoListType } from '../../types/TodoList';
import type { CalendarViewMode, ListSourceMode, CalendarTask } from '../../types/Calendar';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { TaskDetailModal } from './TaskDetailModal';
import {
  flattenTasks,
  getAllTasksFromLists,
  groupTasksByDate,
  generateMonthDays,
  generateWeekDays,
  getStartOfWeek,
  addMonths,
  addWeeks,
  addDaysToDate,
  formatDateString,
} from '../../utils/calendarUtils';

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const CalendarContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

interface CalendarViewProps {
  tasks: Task[];
  allLists?: { [listId: string]: TodoListType };
  currentListId?: string;
  currentListName?: string;
  onViewChange: (view: CalendarViewMode) => void;
  viewMode: CalendarViewMode;
  onNavigateToTask?: (task: CalendarTask) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  allLists,
  currentListId,
  currentListName,
  onViewChange,
  viewMode,
  onNavigateToTask,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [listSource, setListSource] = useState<ListSourceMode>('current');
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get tasks based on list source
  const calendarTasks = useMemo(() => {
    if (listSource === 'all' && allLists) {
      return getAllTasksFromLists(allLists);
    }
    return flattenTasks(tasks, currentListId, currentListName);
  }, [tasks, allLists, listSource, currentListId, currentListName]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    return groupTasksByDate(calendarTasks);
  }, [calendarTasks]);

  // Generate calendar data based on view mode
  const monthDays = useMemo(() => {
    return generateMonthDays(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      tasksByDate,
      selectedDate || undefined
    );
  }, [currentDate, tasksByDate, selectedDate]);

  const weekDays = useMemo(() => {
    const weekStart = getStartOfWeek(currentDate);
    return generateWeekDays(weekStart, tasksByDate, selectedDate || undefined);
  }, [currentDate, tasksByDate, selectedDate]);

  const dayTasks = useMemo(() => {
    const dateString = formatDateString(currentDate);
    return tasksByDate.get(dateString) || [];
  }, [currentDate, tasksByDate]);

  // Navigation handlers
  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date());
      setSelectedDate(null);
      return;
    }

    const delta = direction === 'next' ? 1 : -1;

    switch (viewMode) {
      case 'month':
        setCurrentDate(prev => addMonths(prev, delta));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, delta));
        break;
      case 'day':
        setCurrentDate(prev => addDaysToDate(prev, delta));
        break;
    }
  };

  // Day click handler (for month/week views)
  const handleDayClick = (date: Date, tasks: CalendarTask[]) => {
    setSelectedDate(date);
    if (viewMode === 'month' && tasks.length > 0) {
      // Switch to day view when clicking a day with tasks
      setCurrentDate(date);
      onViewChange('day');
    } else if (viewMode === 'month') {
      // Just select the day
      setCurrentDate(date);
    }
  };

  // Task click handler
  const handleTaskClick = (task: CalendarTask) => {
    setSelectedTask(task);
  };

  // Handle navigation to task in list view
  const handleNavigateToTask = (task: CalendarTask) => {
    setSelectedTask(null);
    if (onNavigateToTask) {
      onNavigateToTask(task);
    }
  };

  return (
    <CalendarContainer>
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        listSource={listSource}
        onNavigate={handleNavigate}
        onViewChange={onViewChange}
        onListSourceChange={setListSource}
      />

      <CalendarContent>
        {viewMode === 'month' && (
          <MonthView
            days={monthDays}
            onDayClick={handleDayClick}
          />
        )}

        {viewMode === 'week' && (
          <WeekView
            days={weekDays}
            onDayClick={handleDayClick}
            onTaskClick={handleTaskClick}
            showListName={listSource === 'all'}
          />
        )}

        {viewMode === 'day' && (
          <DayView
            date={currentDate}
            tasks={dayTasks}
            onTaskClick={handleTaskClick}
            showListName={listSource === 'all'}
          />
        )}
      </CalendarContent>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onNavigateToTask={onNavigateToTask ? handleNavigateToTask : undefined}
        />
      )}
    </CalendarContainer>
  );
};
