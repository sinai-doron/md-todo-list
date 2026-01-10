import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { SEO } from '../components/SEO';
import { HabitList } from '../components/HabitList';
import { HabitHeatmap } from '../components/HabitHeatmap';
import { HabitForm } from '../components/HabitForm';
import { useHabits } from '../hooks/useHabits';
import type { Habit, HabitWithStats } from '../types/Habit';
import { trackHabitsOpened, trackHabitCreated, trackHabitCompleted } from '../utils/analytics';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;

  .material-symbols-outlined {
    color: #f59e0b;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #6200ee;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #7c3aed;
  }

  .material-symbols-outlined {
    font-size: 20px;
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Section = styled.section`
  margin-bottom: 24px;
`;

const TabBar = styled.div`
  display: flex;
  gap: 4px;
  background: #f0f0f0;
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#333' : '#666'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    color: #333;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;

  .material-symbols-outlined {
    font-size: 64px;
    color: #ccc;
    margin-bottom: 16px;
  }
`;

const EmptyTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
`;

const EmptyDescription = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #666;
`;

type TabType = 'today' | 'all' | 'archived';

export const HabitsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithStats | null>(null);

  const {
    todaysHabits,
    activeHabits,
    archivedHabits,
    completions,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    incrementHabitCompletion,
    decrementHabitCompletion,
  } = useHabits();

  // Track page view on mount
  useEffect(() => {
    trackHabitsOpened();
  }, []);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Handle Escape key to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isFormOpen) {
        handleBack();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleBack, isFormOpen]);

  const handleCreateHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    createHabit(habitData);
    trackHabitCreated(habitData.frequency);
    setIsFormOpen(false);
  };

  const handleEditHabit = (habit: HabitWithStats) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  const handleUpdateHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, habitData);
      setEditingHabit(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteHabit = (id: string) => {
    deleteHabit(id);
    setEditingHabit(null);
    setIsFormOpen(false);
  };

  const handleToggleCompletion = (habitId: string) => {
    toggleHabitCompletion(habitId);
    trackHabitCompleted();
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHabit(null);
  };

  const getDisplayHabits = (): HabitWithStats[] => {
    switch (activeTab) {
      case 'today':
        return todaysHabits;
      case 'all':
        return activeHabits;
      case 'archived':
        return archivedHabits;
      default:
        return todaysHabits;
    }
  };

  const displayHabits = getDisplayHabits();

  return (
    <PageContainer>
      <SEO
        title="Habits - MD Tasks"
        description="Track your daily habits with a GitHub-style activity heatmap. Build streaks, stay consistent, and achieve your goals."
        canonical="/habits"
        keywords="habit tracker, daily habits, streak, activity heatmap, productivity"
      />

      <Header>
        <HeaderLeft>
          <BackButton onClick={handleBack} title="Back to Todo List (Esc)">
            <span className="material-symbols-outlined">arrow_back</span>
          </BackButton>
          <Title>
            <span className="material-symbols-outlined">local_fire_department</span>
            Habits
          </Title>
        </HeaderLeft>

        <HeaderRight>
          <AddButton onClick={() => setIsFormOpen(true)}>
            <span className="material-symbols-outlined">add</span>
            New Habit
          </AddButton>
        </HeaderRight>
      </Header>

      <Content>
        {activeHabits.length > 0 && (
          <Section>
            <HabitHeatmap completions={completions} />
          </Section>
        )}

        <TabBar>
          <Tab $active={activeTab === 'today'} onClick={() => setActiveTab('today')}>
            Today ({todaysHabits.length})
          </Tab>
          <Tab $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
            All Habits ({activeHabits.length})
          </Tab>
          <Tab $active={activeTab === 'archived'} onClick={() => setActiveTab('archived')}>
            Archived ({archivedHabits.length})
          </Tab>
        </TabBar>

        {activeHabits.length === 0 ? (
          <EmptyState>
            <span className="material-symbols-outlined">self_improvement</span>
            <EmptyTitle>Start building habits</EmptyTitle>
            <EmptyDescription>
              Create your first habit to start tracking your progress with a beautiful activity heatmap.
            </EmptyDescription>
            <AddButton onClick={() => setIsFormOpen(true)}>
              <span className="material-symbols-outlined">add</span>
              Create First Habit
            </AddButton>
          </EmptyState>
        ) : (
          <Section>
            <HabitList
              habits={displayHabits}
              title={
                activeTab === 'today' ? "Today's Habits" :
                activeTab === 'all' ? 'All Habits' :
                'Archived Habits'
              }
              showCompletionCount={activeTab !== 'archived'}
              emptyMessage={
                activeTab === 'today' ? 'No habits due today' :
                activeTab === 'archived' ? 'No archived habits' :
                'No habits yet'
              }
              emptyDescription={
                activeTab === 'today' ? 'All your habits are on different schedules' :
                activeTab === 'archived' ? 'Archived habits will appear here' :
                'Create a habit to get started'
              }
              onToggle={handleToggleCompletion}
              onIncrement={incrementHabitCompletion}
              onDecrement={decrementHabitCompletion}
              onHabitClick={handleEditHabit}
            />
          </Section>
        )}
      </Content>

      <HabitForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={editingHabit ? handleUpdateHabit : handleCreateHabit}
        onDelete={editingHabit ? handleDeleteHabit : undefined}
        habit={editingHabit || undefined}
      />
    </PageContainer>
  );
};
