import React from 'react';
import styled from 'styled-components';
import type { Task } from '../types/Task';
import type { TodoList } from '../types/TodoList';

const Container = styled.div`
  margin-bottom: 16px;
`;

const Title = styled.h4`
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

const ListsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListItem = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ListName = styled.div`
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
`;

const Percentage = styled.div`
  font-size: 14px;
  color: #6200ee;
  font-weight: 600;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg, #6200ee 0%, #a78bfa 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const TaskCount = styled.div`
  font-size: 11px;
  color: #999;
  margin-top: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
`;

interface ListCompletionRatesProps {
  lists: { [listId: string]: TodoList };
}

// Helper to count tasks recursively
const countTasks = (tasks: Task[]): { total: number; completed: number } => {
  let total = 0;
  let completed = 0;

  const countRecursive = (taskList: Task[]) => {
    for (const task of taskList) {
      if (!task.isHeader) {
        total++;
        if (task.completed) {
          completed++;
        }
      }
      if (task.children) {
        countRecursive(task.children);
      }
    }
  };

  countRecursive(tasks);
  return { total, completed };
};

export const ListCompletionRates: React.FC<ListCompletionRatesProps> = ({ lists }) => {
  const listEntries = Object.values(lists);

  if (listEntries.length === 0) {
    return (
      <Container>
        <Title>Per-List Completion Rates</Title>
        <EmptyState>No lists yet</EmptyState>
      </Container>
    );
  }

  // Sort lists by completion percentage (descending)
  const sortedLists = [...listEntries].sort((a, b) => {
    const aStats = countTasks(a.tasks);
    const bStats = countTasks(b.tasks);
    const aPercent = aStats.total > 0 ? aStats.completed / aStats.total : 0;
    const bPercent = bStats.total > 0 ? bStats.completed / bStats.total : 0;
    return bPercent - aPercent;
  });

  return (
    <Container>
      <Title>Per-List Completion Rates</Title>
      <ListsContainer>
        {sortedLists.map(list => {
          const { total, completed } = countTasks(list.tasks);
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <ListItem key={list.id}>
              <ListHeader>
                <ListName>{list.name}</ListName>
                <Percentage>{percentage}%</Percentage>
              </ListHeader>
              <ProgressBarContainer>
                <ProgressBarFill $percentage={percentage} />
              </ProgressBarContainer>
              <TaskCount>
                {completed} of {total} tasks completed
              </TaskCount>
            </ListItem>
          );
        })}
      </ListsContainer>
    </Container>
  );
};
