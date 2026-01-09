import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { usePomodoroTimer, type TimerType } from '../hooks/usePomodoroTimer';
import { PomodoroSettings } from './PomodoroSettings';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin: 32px 0;
`;

const TimerContainer = styled.div<{ $isRunning: boolean }>`
  position: relative;
  width: 200px;
  height: 200px;
  ${props => props.$isRunning && css`
    animation: ${pulse} 2s ease-in-out infinite;
  `}
`;

const ProgressRing = styled.svg`
  transform: rotate(-90deg);
  width: 200px;
  height: 200px;
`;

const ProgressBackground = styled.circle`
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 8;
`;

const ProgressForeground = styled.circle<{ $progress: number; $color: string }>`
  fill: none;
  stroke: ${props => props.$color};
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: ${Math.PI * 180};
  stroke-dashoffset: ${props => Math.PI * 180 * (1 - props.$progress)};
  transition: stroke-dashoffset 0.5s ease;
  filter: drop-shadow(0 0 8px ${props => props.$color}40);
`;

const TimeDisplay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

const Time = styled.div`
  font-size: 48px;
  font-weight: 300;
  color: white;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
`;

const TimerLabel = styled.div<{ $color: string }>`
  font-size: 14px;
  color: ${props => props.$color};
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 4px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ControlButton = styled.button<{ $primary?: boolean; $color?: string }>`
  width: ${props => props.$primary ? '64px' : '48px'};
  height: ${props => props.$primary ? '64px' : '48px'};
  border-radius: 50%;
  border: none;
  background: ${props => props.$primary ? (props.$color || '#6200ee') : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
    background: ${props => props.$primary ? (props.$color || '#7c3aed') : 'rgba(255, 255, 255, 0.2)'};
  }

  &:active {
    transform: scale(0.95);
  }

  .material-symbols-outlined {
    font-size: ${props => props.$primary ? '32px' : '24px'};
  }
`;

const SettingsButton = styled.button`
  position: absolute;
  top: 0;
  right: -40px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const SessionIndicator = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SessionDot = styled.div<{ $filled: boolean; $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.$filled ? props.$color : 'transparent'};
  border: 2px solid ${props => props.$color};
  transition: all 0.3s;
`;

const SessionLabel = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 8px;
`;

const getTimerColor = (timerType: TimerType): string => {
  switch (timerType) {
    case 'work':
      return '#6200ee';
    case 'shortBreak':
      return '#22c55e';
    case 'longBreak':
      return '#2563eb';
  }
};

const getTimerLabel = (timerType: TimerType): string => {
  switch (timerType) {
    case 'work':
      return 'Work';
    case 'shortBreak':
      return 'Short Break';
    case 'longBreak':
      return 'Long Break';
  }
};

export const PomodoroTimer: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const {
    state,
    start,
    pause,
    reset,
    skip,
    updateSettings,
    formattedTime,
    progress,
  } = usePomodoroTimer();

  const color = getTimerColor(state.timerType);
  const label = getTimerLabel(state.timerType);

  // Generate session dots
  const sessionDots = Array.from({ length: state.settings.sessionsBeforeLongBreak }, (_, i) => (
    <SessionDot
      key={i}
      $filled={i < (state.sessionsCompleted % state.settings.sessionsBeforeLongBreak)}
      $color={color}
    />
  ));

  return (
    <Container>
      <TimerContainer $isRunning={state.isRunning}>
        <ProgressRing viewBox="0 0 200 200">
          <ProgressBackground cx="100" cy="100" r="90" />
          <ProgressForeground
            cx="100"
            cy="100"
            r="90"
            $progress={progress}
            $color={color}
          />
        </ProgressRing>
        <TimeDisplay>
          <Time>{formattedTime}</Time>
          <TimerLabel $color={color}>{label}</TimerLabel>
        </TimeDisplay>
        <SettingsButton onClick={() => setShowSettings(true)}>
          <span className="material-symbols-outlined">settings</span>
        </SettingsButton>
      </TimerContainer>

      <Controls>
        <ControlButton onClick={reset} title="Reset">
          <span className="material-symbols-outlined">restart_alt</span>
        </ControlButton>
        <ControlButton
          $primary
          $color={color}
          onClick={state.isRunning ? pause : start}
          title={state.isRunning ? 'Pause' : 'Start'}
        >
          <span className="material-symbols-outlined">
            {state.isRunning ? 'pause' : 'play_arrow'}
          </span>
        </ControlButton>
        <ControlButton onClick={skip} title="Skip">
          <span className="material-symbols-outlined">skip_next</span>
        </ControlButton>
      </Controls>

      <SessionIndicator>
        {sessionDots}
        <SessionLabel>
          Session {(state.sessionsCompleted % state.settings.sessionsBeforeLongBreak) + 1} of {state.settings.sessionsBeforeLongBreak}
        </SessionLabel>
      </SessionIndicator>

      {showSettings && (
        <PomodoroSettings
          settings={state.settings}
          onUpdate={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </Container>
  );
};
