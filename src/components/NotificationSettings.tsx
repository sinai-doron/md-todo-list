import React from 'react';
import styled from 'styled-components';
import type { NotificationSettings as Settings } from '../types/NotificationSettings';
import { BEFORE_DUE_OPTIONS } from '../types/NotificationSettings';

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
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
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

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const ToggleRow = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: #333;
`;

const Toggle = styled.input.attrs({ type: 'checkbox' })`
  width: 44px;
  height: 24px;
  appearance: none;
  background: #e0e0e0;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;

  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: transform 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  &:checked {
    background: #6200ee;
  }

  &:checked::before {
    transform: translateX(20px);
  }
`;

const SettingGroup = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
`;

const SelectRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const SelectLabel = styled.span`
  font-size: 13px;
  color: #666;
`;

const Select = styled.select`
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const TimeInput = styled.input.attrs({ type: 'time' })`
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #6200ee;
  }
`;

const PermissionBanner = styled.div<{ $type: 'warning' | 'error' | 'success' }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  background: ${props => {
    switch (props.$type) {
      case 'warning': return '#fff7ed';
      case 'error': return '#fef2f2';
      case 'success': return '#f0fdf4';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$type) {
      case 'warning': return '#fed7aa';
      case 'error': return '#fecaca';
      case 'success': return '#bbf7d0';
    }
  }};

  .material-symbols-outlined {
    font-size: 20px;
    color: ${props => {
      switch (props.$type) {
        case 'warning': return '#ea580c';
        case 'error': return '#dc2626';
        case 'success': return '#16a34a';
      }
    }};
  }
`;

const PermissionText = styled.div`
  flex: 1;
`;

const PermissionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const PermissionDescription = styled.div`
  font-size: 12px;
  color: #666;
`;

const PermissionButton = styled.button`
  padding: 8px 16px;
  background: #6200ee;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;

  &:hover {
    background: #5000d0;
  }
`;

const TestButton = styled.button`
  width: 100%;
  padding: 10px;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .material-symbols-outlined {
    font-size: 18px;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 20px 0;
`;

const UnsupportedMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;

  .material-symbols-outlined {
    font-size: 48px;
    color: #ccc;
    display: block;
    margin-bottom: 12px;
  }
`;

interface NotificationSettingsProps {
  settings: Settings;
  isSupported: boolean;
  permissionStatus: NotificationPermission | 'unsupported';
  onUpdate: (updates: Partial<Settings>) => void;
  onRequestPermission: () => Promise<boolean>;
  onTest: () => boolean;
  onClose: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  isSupported,
  permissionStatus,
  onUpdate,
  onRequestPermission,
  onTest,
  onClose,
}) => {
  const [testStatus, setTestStatus] = React.useState<'idle' | 'success' | 'failed'>('idle');

  const handleRequestPermission = async () => {
    const granted = await onRequestPermission();
    if (granted) {
      onUpdate({ enabled: true });
    }
  };

  const handleTest = () => {
    const success = onTest();
    setTestStatus(success ? 'success' : 'failed');
    // Reset status after 3 seconds
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <span className="material-symbols-outlined">notifications</span>
            Notification Settings
          </Title>
          <CloseButton onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </CloseButton>
        </Header>

        {!isSupported ? (
          <UnsupportedMessage>
            <span className="material-symbols-outlined">notifications_off</span>
            Browser notifications are not supported in this browser.
          </UnsupportedMessage>
        ) : (
          <>
            {/* Permission Status */}
            {permissionStatus === 'default' && (
              <PermissionBanner $type="warning">
                <span className="material-symbols-outlined">info</span>
                <PermissionText>
                  <PermissionTitle>Permission Required</PermissionTitle>
                  <PermissionDescription>
                    Allow notifications to receive reminders about your tasks.
                  </PermissionDescription>
                  <PermissionButton onClick={handleRequestPermission}>
                    Enable Notifications
                  </PermissionButton>
                </PermissionText>
              </PermissionBanner>
            )}

            {permissionStatus === 'denied' && (
              <PermissionBanner $type="error">
                <span className="material-symbols-outlined">block</span>
                <PermissionText>
                  <PermissionTitle>Notifications Blocked</PermissionTitle>
                  <PermissionDescription>
                    You've blocked notifications. To enable them, click the lock icon in your browser's address bar and allow notifications.
                  </PermissionDescription>
                </PermissionText>
              </PermissionBanner>
            )}

            {permissionStatus === 'granted' && settings.enabled && (
              <PermissionBanner $type="success">
                <span className="material-symbols-outlined">check_circle</span>
                <PermissionText>
                  <PermissionTitle>Notifications Enabled</PermissionTitle>
                  <PermissionDescription>
                    You'll receive reminders about your due tasks.
                  </PermissionDescription>
                </PermissionText>
              </PermissionBanner>
            )}

            {/* Main Toggle */}
            <Section>
              <ToggleRow>
                <ToggleLabel>Enable Notifications</ToggleLabel>
                <Toggle
                  checked={settings.enabled}
                  onChange={(e) => onUpdate({ enabled: e.target.checked })}
                  disabled={permissionStatus !== 'granted'}
                />
              </ToggleRow>
            </Section>

            <Divider />

            {/* Daily Reminder */}
            <Section>
              <SectionTitle>Daily Reminder</SectionTitle>
              <SettingGroup>
                <ToggleRow>
                  <ToggleLabel>Remind me about due tasks</ToggleLabel>
                  <Toggle
                    checked={settings.dailyReminderEnabled}
                    onChange={(e) => onUpdate({ dailyReminderEnabled: e.target.checked })}
                    disabled={!settings.enabled}
                  />
                </ToggleRow>
                {settings.dailyReminderEnabled && (
                  <SelectRow>
                    <SelectLabel>Time</SelectLabel>
                    <TimeInput
                      value={settings.dailyReminderTime}
                      onChange={(e) => onUpdate({ dailyReminderTime: e.target.value })}
                      disabled={!settings.enabled}
                    />
                  </SelectRow>
                )}
              </SettingGroup>
            </Section>

            {/* Before Due Reminder */}
            <Section>
              <SectionTitle>Advance Reminder</SectionTitle>
              <SettingGroup>
                <ToggleRow>
                  <ToggleLabel>Remind before tasks are due</ToggleLabel>
                  <Toggle
                    checked={settings.beforeDueEnabled}
                    onChange={(e) => onUpdate({ beforeDueEnabled: e.target.checked })}
                    disabled={!settings.enabled}
                  />
                </ToggleRow>
                {settings.beforeDueEnabled && (
                  <SelectRow>
                    <SelectLabel>When</SelectLabel>
                    <Select
                      value={settings.beforeDueMinutes}
                      onChange={(e) => onUpdate({ beforeDueMinutes: Number(e.target.value) })}
                      disabled={!settings.enabled}
                    >
                      {BEFORE_DUE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </SelectRow>
                )}
              </SettingGroup>
            </Section>

            <Divider />

            {/* Test Button */}
            <TestButton
              onClick={handleTest}
              disabled={permissionStatus !== 'granted' || !settings.enabled}
              style={{
                borderColor: testStatus === 'success' ? '#16a34a' : testStatus === 'failed' ? '#dc2626' : undefined,
                color: testStatus === 'success' ? '#16a34a' : testStatus === 'failed' ? '#dc2626' : undefined,
              }}
            >
              <span className="material-symbols-outlined">
                {testStatus === 'success' ? 'check_circle' : testStatus === 'failed' ? 'error' : 'send'}
              </span>
              {testStatus === 'success' ? 'Notification Sent!' : testStatus === 'failed' ? 'Failed - Check Browser Settings' : 'Send Test Notification'}
            </TestButton>
          </>
        )}
      </Modal>
    </Overlay>
  );
};
