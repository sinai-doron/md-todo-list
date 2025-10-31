import React, { useState } from 'react';
import styled from 'styled-components';
import type { TodoList } from '../types/TodoList';
import type { Task } from '../types/Task';

const SidebarContainer = styled.aside<{ $isCollapsed: boolean }>`
  width: ${props => props.$isCollapsed ? '60px' : '280px'};
  background: white;
  border-radius: 8px;
  padding: ${props => props.$isCollapsed ? '16px 8px' : '20px'};
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;

  @media (max-width: 768px) {
    position: fixed;
    left: ${props => props.$isCollapsed ? '-280px' : '0'};
    top: 0;
    bottom: 0;
    width: 280px;
    z-index: 1000;
    border-radius: 0;
    box-shadow: ${props => props.$isCollapsed ? 'none' : '2px 0 8px rgba(0,0,0,0.1)'};
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
`;

const SidebarTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CollapseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #666;
  font-size: 20px;
  line-height: 1;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }
`;

const CreateButton = styled.button`
  width: 100%;
  background: #4a90e2;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 16px;
  white-space: nowrap;

  &:hover {
    background: #357abd;
  }
`;

const ListsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
`;

const ListItem = styled.div<{ $isActive: boolean }>`
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  background: ${props => props.$isActive ? '#e3f2fd' : 'transparent'};
  border: 1px solid ${props => props.$isActive ? '#2196f3' : 'transparent'};
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: ${props => props.$isActive ? '#e3f2fd' : '#f5f5f5'};
  }
`;

const ListName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ListStats = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatsText = styled.span`
  white-space: nowrap;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 2px 6px;
  font-size: 16px;
  line-height: 1;
  transition: color 0.2s;

  &:hover {
    color: #e53e3e;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
`;

const MobileOverlay = styled.div<{ $show: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: ${props => props.$show ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

interface SidebarProps {
  lists: { [listId: string]: TodoList };
  currentListId: string | null;
  onCreateList: () => void;
  onSwitchList: (listId: string) => void;
  onDeleteList: (listId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  lists,
  currentListId,
  onCreateList,
  onSwitchList,
  onDeleteList,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const countTasks = (tasks: Task[]): { total: number; completed: number } => {
    let total = 0;
    let completed = 0;

    const count = (taskList: Task[]) => {
      taskList.forEach((task) => {
        if (!task.isHeader) {
          total++;
          if (task.completed) completed++;
        }
        if (task.children) count(task.children);
      });
    };

    count(tasks);
    return { total, completed };
  };

  const handleDelete = (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    const list = lists[listId];
    if (window.confirm(`Are you sure you want to delete "${list.name}"?`)) {
      onDeleteList(listId);
    }
  };

  const sortedLists = Object.values(lists).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  return (
    <>
      <MobileOverlay $show={!isCollapsed} onClick={() => setIsCollapsed(true)} />
      <SidebarContainer $isCollapsed={isCollapsed}>
        {!isCollapsed && (
          <>
            <SidebarHeader>
              <SidebarTitle>My Lists</SidebarTitle>
              <CollapseButton onClick={() => setIsCollapsed(true)}>
                ←
              </CollapseButton>
            </SidebarHeader>
            <CreateButton onClick={onCreateList}>
              + New List
            </CreateButton>
            <ListsContainer>
              {sortedLists.length === 0 ? (
                <EmptyState>No lists yet. Create your first list!</EmptyState>
              ) : (
                sortedLists.map((list) => {
                  const { total, completed } = countTasks(list.tasks);
                  return (
                    <ListItem
                      key={list.id}
                      $isActive={list.id === currentListId}
                      onClick={() => onSwitchList(list.id)}
                    >
                      <ListName>{list.name}</ListName>
                      <ListStats>
                        <StatsText>
                          {completed}/{total} tasks
                        </StatsText>
                        <DeleteButton
                          onClick={(e) => handleDelete(e, list.id)}
                          title="Delete list"
                        >
                          ×
                        </DeleteButton>
                      </ListStats>
                    </ListItem>
                  );
                })
              )}
            </ListsContainer>
          </>
        )}
        {isCollapsed && (
          <CollapseButton onClick={() => setIsCollapsed(false)}>
            →
          </CollapseButton>
        )}
      </SidebarContainer>
    </>
  );
};

