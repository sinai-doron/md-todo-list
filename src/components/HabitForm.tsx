import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { Habit } from '../types/Habit';
import { HABIT_ICONS, HABIT_COLORS } from '../types/Habit';

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
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

const Content = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const Section = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }

  &::placeholder {
    color: #999;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }

  &::placeholder {
    color: #999;
  }
`;

const FrequencyButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const FrequencyButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px;
  border: 2px solid ${props => props.$active ? '#6200ee' : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => props.$active ? 'rgba(98, 0, 238, 0.08)' : 'white'};
  color: ${props => props.$active ? '#6200ee' : '#666'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
  }
`;

const DaysGrid = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const DayButton = styled.button<{ $active: boolean }>`
  width: 40px;
  height: 40px;
  border: 2px solid ${props => props.$active ? '#6200ee' : '#e0e0e0'};
  border-radius: 50%;
  background: ${props => props.$active ? '#6200ee' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
`;

const IconButton = styled.button<{ $active: boolean; $color: string }>`
  width: 48px;
  height: 48px;
  border: 2px solid ${props => props.$active ? props.$color : '#e0e0e0'};
  border-radius: 12px;
  background: ${props => props.$active ? `${props.$color}20` : 'white'};
  color: ${props => props.$active ? props.$color : '#666'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$color};
  }

  .material-symbols-outlined {
    font-size: 24px;
  }
`;

const ColorGrid = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ColorButton = styled.button<{ $color: string; $active: boolean }>`
  width: 36px;
  height: 36px;
  border: 3px solid ${props => props.$active ? '#333' : 'transparent'};
  border-radius: 50%;
  background: ${props => props.$color};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    transform: scale(1.1);
  }

  ${props => props.$active && `
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
    }
  `}
`;

const TargetInput = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NumberInput = styled.input`
  width: 80px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #fafafa;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: ${props => (props.$primary || props.$danger) ? 'none' : '1px solid #ddd'};
  background: ${props => {
    if (props.$primary) return '#6200ee';
    if (props.$danger) return '#ef4444';
    return 'white';
  }};
  color: ${props => (props.$primary || props.$danger) ? 'white' : '#333'};

  &:hover {
    background: ${props => {
      if (props.$primary) return '#7c3aed';
      if (props.$danger) return '#dc2626';
      return '#f5f5f5';
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  habit?: Habit; // For editing
}

export const HabitForm: React.FC<HabitFormProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  habit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [icon, setIcon] = useState('check_circle');
  const [color, setColor] = useState<string>(HABIT_COLORS[0]);
  const [targetPerDay, setTargetPerDay] = useState<number | undefined>(undefined);
  const [isCountable, setIsCountable] = useState(false);

  // Initialize form when habit prop changes
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description || '');
      setFrequency(habit.frequency);
      setDaysOfWeek(habit.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
      setIcon(habit.icon || 'check_circle');
      setColor(habit.color || HABIT_COLORS[0]);
      setTargetPerDay(habit.targetPerDay);
      setIsCountable(!!habit.targetPerDay && habit.targetPerDay > 1);
    } else {
      // Reset form
      setName('');
      setDescription('');
      setFrequency('daily');
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
      setIcon('check_circle');
      setColor(HABIT_COLORS[0]);
      setTargetPerDay(undefined);
      setIsCountable(false);
    }
  }, [habit, isOpen]);

  const toggleDay = (day: number) => {
    setDaysOfWeek(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      frequency,
      daysOfWeek: frequency === 'weekly' ? daysOfWeek : undefined,
      icon,
      color,
      targetPerDay: isCountable ? (targetPerDay || 2) : undefined,
    });

    onClose();
  };

  const handleDelete = () => {
    if (habit && onDelete) {
      if (confirm('Are you sure you want to delete this habit? All history will be lost.')) {
        onDelete(habit.id);
        onClose();
      }
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <Title>{habit ? 'Edit Habit' : 'New Habit'}</Title>
          <CloseButton onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </CloseButton>
        </Header>

        <Content>
          <Section>
            <Label>Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Exercise, Read, Meditate"
              autoFocus
            />
          </Section>

          <Section>
            <Label>Description (optional)</Label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this habit..."
            />
          </Section>

          <Section>
            <Label>Frequency</Label>
            <FrequencyButtons>
              <FrequencyButton
                $active={frequency === 'daily'}
                onClick={() => setFrequency('daily')}
              >
                Daily
              </FrequencyButton>
              <FrequencyButton
                $active={frequency === 'weekly'}
                onClick={() => setFrequency('weekly')}
              >
                Specific Days
              </FrequencyButton>
            </FrequencyButtons>
            {frequency === 'weekly' && (
              <DaysGrid>
                {DAY_NAMES.map((dayName, index) => (
                  <DayButton
                    key={index}
                    $active={daysOfWeek.includes(index)}
                    onClick={() => toggleDay(index)}
                  >
                    {dayName}
                  </DayButton>
                ))}
              </DaysGrid>
            )}
          </Section>

          <Section>
            <Label>Icon</Label>
            <IconGrid>
              {HABIT_ICONS.map(({ name: iconName }) => (
                <IconButton
                  key={iconName}
                  $active={icon === iconName}
                  $color={color}
                  onClick={() => setIcon(iconName)}
                >
                  <span className="material-symbols-outlined">{iconName}</span>
                </IconButton>
              ))}
            </IconGrid>
          </Section>

          <Section>
            <Label>Color</Label>
            <ColorGrid>
              {HABIT_COLORS.map((c) => (
                <ColorButton
                  key={c}
                  $color={c}
                  $active={color === c}
                  onClick={() => setColor(c)}
                />
              ))}
            </ColorGrid>
          </Section>

          <Section>
            <Label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isCountable}
                  onChange={(e) => setIsCountable(e.target.checked)}
                />
                Track multiple completions per day
              </label>
            </Label>
            {isCountable && (
              <TargetInput>
                <span>Target:</span>
                <NumberInput
                  type="number"
                  min="2"
                  max="99"
                  value={targetPerDay || 2}
                  onChange={(e) => setTargetPerDay(parseInt(e.target.value) || 2)}
                />
                <span>per day</span>
              </TargetInput>
            )}
          </Section>
        </Content>

        <Footer>
          {habit && onDelete && (
            <Button $danger onClick={handleDelete}>
              Delete
            </Button>
          )}
          <div style={{ flex: 1 }} />
          <Button onClick={onClose}>Cancel</Button>
          <Button $primary onClick={handleSave} disabled={!name.trim()}>
            {habit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};
