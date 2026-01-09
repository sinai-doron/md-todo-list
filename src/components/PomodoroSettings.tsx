import React from 'react';
import styled from 'styled-components';
import type { PomodoroSettings as Settings } from '../hooks/usePomodoroTimer';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 320px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
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
  padding: 4px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }

  .material-symbols-outlined {
    font-size: 20px;
  }
`;

const SettingGroup = styled.div`
  margin-bottom: 20px;
`;

const SettingLabel = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
`;

const SettingValue = styled.span`
  font-weight: 600;
  color: #6200ee;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #6200ee;
    cursor: pointer;
    transition: transform 0.2s;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #6200ee;
    cursor: pointer;
    border: none;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 20px 0;
`;

const ResetButton = styled.button`
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

interface PomodoroSettingsProps {
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
  onClose: () => void;
}

export const PomodoroSettings: React.FC<PomodoroSettingsProps> = ({
  settings,
  onUpdate,
  onClose,
}) => {
  const handleReset = () => {
    onUpdate({
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
    });
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <span className="material-symbols-outlined">settings</span>
            Timer Settings
          </Title>
          <CloseButton onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </CloseButton>
        </Header>

        <SettingGroup>
          <SettingLabel>
            Work Duration
            <SettingValue>{settings.workDuration} min</SettingValue>
          </SettingLabel>
          <Slider
            type="range"
            min="5"
            max="60"
            value={settings.workDuration}
            onChange={(e) => onUpdate({ workDuration: Number(e.target.value) })}
          />
        </SettingGroup>

        <SettingGroup>
          <SettingLabel>
            Short Break
            <SettingValue>{settings.shortBreakDuration} min</SettingValue>
          </SettingLabel>
          <Slider
            type="range"
            min="1"
            max="15"
            value={settings.shortBreakDuration}
            onChange={(e) => onUpdate({ shortBreakDuration: Number(e.target.value) })}
          />
        </SettingGroup>

        <SettingGroup>
          <SettingLabel>
            Long Break
            <SettingValue>{settings.longBreakDuration} min</SettingValue>
          </SettingLabel>
          <Slider
            type="range"
            min="5"
            max="30"
            value={settings.longBreakDuration}
            onChange={(e) => onUpdate({ longBreakDuration: Number(e.target.value) })}
          />
        </SettingGroup>

        <SettingGroup>
          <SettingLabel>
            Sessions Before Long Break
            <SettingValue>{settings.sessionsBeforeLongBreak}</SettingValue>
          </SettingLabel>
          <Slider
            type="range"
            min="2"
            max="6"
            value={settings.sessionsBeforeLongBreak}
            onChange={(e) => onUpdate({ sessionsBeforeLongBreak: Number(e.target.value) })}
          />
        </SettingGroup>

        <Divider />

        <ResetButton onClick={handleReset}>
          Reset to Defaults
        </ResetButton>
      </Modal>
    </Overlay>
  );
};
