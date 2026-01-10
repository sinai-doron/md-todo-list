import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { RecurrenceRule, RecurrenceFrequency } from '../types/Task';
import { getRecurrenceDescription } from '../utils/recurrence';

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
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
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
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;

  .material-symbols-outlined {
    font-size: 22px;
    color: #6200ee;
  }
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
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
`;

const FrequencyButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const FrequencyButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px 12px;
  border: 2px solid ${props => props.$active ? '#6200ee' : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => props.$active ? 'rgba(98, 0, 238, 0.08)' : 'white'};
  color: ${props => props.$active ? '#6200ee' : '#666'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #6200ee;
    background: rgba(98, 0, 238, 0.04);
  }
`;

const IntervalRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IntervalInput = styled.input`
  width: 60px;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
`;

const IntervalLabel = styled.span`
  font-size: 14px;
  color: #666;
`;

const DaysGrid = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
    background: ${props => props.$active ? '#6200ee' : 'rgba(98, 0, 238, 0.04)'};
  }
`;

const DayOfMonthSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const EndDateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const EndDateSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  flex: 1;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const EndDateInput = styled.input`
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  flex: 1;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const Preview = styled.div`
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;

  .material-symbols-outlined {
    font-size: 18px;
    color: #6200ee;
  }
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  background: #fafafa;
`;

const FooterLeft = styled.div``;

const FooterRight = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 10px 20px;
  border-radius: 6px;
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
`;

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface RecurrencePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recurrence: RecurrenceRule | undefined) => void;
  currentRecurrence?: RecurrenceRule;
}

export const RecurrencePicker: React.FC<RecurrencePickerProps> = ({
  isOpen,
  onClose,
  onSave,
  currentRecurrence,
}) => {
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('daily');
  const [interval, setInterval] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [endOption, setEndOption] = useState<'never' | 'date'>('never');
  const [endDate, setEndDate] = useState('');

  // Initialize from current recurrence
  useEffect(() => {
    if (currentRecurrence) {
      setFrequency(currentRecurrence.frequency);
      setInterval(currentRecurrence.interval);
      setDaysOfWeek(currentRecurrence.daysOfWeek || []);
      setDayOfMonth(currentRecurrence.dayOfMonth || new Date().getDate());
      if (currentRecurrence.endDate) {
        setEndOption('date');
        setEndDate(currentRecurrence.endDate);
      } else {
        setEndOption('never');
        setEndDate('');
      }
    } else {
      // Default to daily
      setFrequency('daily');
      setInterval(1);
      setDaysOfWeek([new Date().getDay()]);
      setDayOfMonth(new Date().getDate());
      setEndOption('never');
      setEndDate('');
    }
  }, [currentRecurrence, isOpen]);

  const toggleDay = (day: number) => {
    setDaysOfWeek(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const getFrequencyLabel = (): string => {
    switch (frequency) {
      case 'daily': return interval === 1 ? 'day' : 'days';
      case 'weekly': return interval === 1 ? 'week' : 'weeks';
      case 'monthly': return interval === 1 ? 'month' : 'months';
      case 'custom': return interval === 1 ? 'day' : 'days';
      default: return 'day';
    }
  };

  const buildRecurrence = (): RecurrenceRule => {
    const recurrence: RecurrenceRule = {
      frequency,
      interval,
    };

    if (frequency === 'weekly' && daysOfWeek.length > 0) {
      recurrence.daysOfWeek = daysOfWeek;
    }

    if (frequency === 'monthly') {
      recurrence.dayOfMonth = dayOfMonth;
    }

    if (endOption === 'date' && endDate) {
      recurrence.endDate = endDate;
    }

    return recurrence;
  };

  const handleSave = () => {
    onSave(buildRecurrence());
    onClose();
  };

  const handleClear = () => {
    onSave(undefined);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const previewRecurrence = buildRecurrence();
  const previewText = getRecurrenceDescription(previewRecurrence);

  return (
    <Overlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <Title>
            <span className="material-symbols-outlined">event_repeat</span>
            Repeat
          </Title>
          <CloseButton onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </CloseButton>
        </Header>

        <Content>
          <Section>
            <SectionLabel>Frequency</SectionLabel>
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
                Weekly
              </FrequencyButton>
              <FrequencyButton
                $active={frequency === 'monthly'}
                onClick={() => setFrequency('monthly')}
              >
                Monthly
              </FrequencyButton>
            </FrequencyButtons>
          </Section>

          <Section>
            <SectionLabel>Repeat Every</SectionLabel>
            <IntervalRow>
              <IntervalInput
                type="number"
                min="1"
                max="99"
                value={interval}
                onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <IntervalLabel>{getFrequencyLabel()}</IntervalLabel>
            </IntervalRow>
          </Section>

          {frequency === 'weekly' && (
            <Section>
              <SectionLabel>On Days</SectionLabel>
              <DaysGrid>
                {DAY_NAMES.map((name, index) => (
                  <DayButton
                    key={index}
                    $active={daysOfWeek.includes(index)}
                    onClick={() => toggleDay(index)}
                  >
                    {name}
                  </DayButton>
                ))}
              </DaysGrid>
            </Section>
          )}

          {frequency === 'monthly' && (
            <Section>
              <SectionLabel>On Day of Month</SectionLabel>
              <DayOfMonthSelect
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    {day}{getOrdinalSuffix(day)}
                  </option>
                ))}
              </DayOfMonthSelect>
            </Section>
          )}

          <Section>
            <SectionLabel>Ends</SectionLabel>
            <EndDateRow>
              <EndDateSelect
                value={endOption}
                onChange={(e) => setEndOption(e.target.value as 'never' | 'date')}
              >
                <option value="never">Never</option>
                <option value="date">On Date</option>
              </EndDateSelect>
              {endOption === 'date' && (
                <EndDateInput
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              )}
            </EndDateRow>
          </Section>

          <Section>
            <Preview>
              <span className="material-symbols-outlined">repeat</span>
              {previewText}
            </Preview>
          </Section>
        </Content>

        <Footer>
          <FooterLeft>
            {currentRecurrence && (
              <Button $danger onClick={handleClear}>
                Remove Repeat
              </Button>
            )}
          </FooterLeft>
          <FooterRight>
            <Button onClick={onClose}>Cancel</Button>
            <Button $primary onClick={handleSave}>
              Save
            </Button>
          </FooterRight>
        </Footer>
      </Modal>
    </Overlay>
  );
};

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};
