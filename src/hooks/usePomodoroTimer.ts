import { useState, useEffect, useCallback, useRef } from 'react';
import {
  trackPomodoroStarted,
  trackPomodoroPaused,
  trackPomodoroCompleted,
  trackPomodoroSkipped,
  trackPomodoroSettingsChanged,
} from '../utils/analytics';

export interface PomodoroSettings {
  workDuration: number;       // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number;  // minutes
  sessionsBeforeLongBreak: number;
}

export type TimerType = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroState {
  timeRemaining: number;      // seconds
  isRunning: boolean;
  timerType: TimerType;
  sessionsCompleted: number;
  settings: PomodoroSettings;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

const STORAGE_KEY = 'pomodoro-settings';

const loadSettings = (): PomodoroSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load pomodoro settings:', e);
  }
  return DEFAULT_SETTINGS;
};

const saveSettings = (settings: PomodoroSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save pomodoro settings:', e);
  }
};

// Create notification sound using Web Audio API
const playNotificationSound = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Create a pleasant chime sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.error('Failed to play notification sound:', e);
  }
};

export interface UsePomodoroReturn {
  state: PomodoroState;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  formattedTime: string;
  progress: number; // 0-1 for progress ring
}

export const usePomodoroTimer = (): UsePomodoroReturn => {
  const [settings, setSettings] = useState<PomodoroSettings>(loadSettings);
  const [timeRemaining, setTimeRemaining] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerType, setTimerType] = useState<TimerType>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const totalTimeRef = useRef(settings.workDuration * 60);

  // Get duration for current timer type
  const getDuration = useCallback((type: TimerType, currentSettings: PomodoroSettings): number => {
    switch (type) {
      case 'work':
        return currentSettings.workDuration * 60;
      case 'shortBreak':
        return currentSettings.shortBreakDuration * 60;
      case 'longBreak':
        return currentSettings.longBreakDuration * 60;
    }
  }, []);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    playNotificationSound();
    trackPomodoroCompleted(timerType, sessionsCompleted + (timerType === 'work' ? 1 : 0));

    if (timerType === 'work') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);

      // Determine if it's time for a long break
      if (newSessionsCompleted % settings.sessionsBeforeLongBreak === 0) {
        setTimerType('longBreak');
        const duration = getDuration('longBreak', settings);
        setTimeRemaining(duration);
        totalTimeRef.current = duration;
      } else {
        setTimerType('shortBreak');
        const duration = getDuration('shortBreak', settings);
        setTimeRemaining(duration);
        totalTimeRef.current = duration;
      }
    } else {
      // Break complete, switch to work
      setTimerType('work');
      const duration = getDuration('work', settings);
      setTimeRemaining(duration);
      totalTimeRef.current = duration;
    }

    // Auto-start next timer
    setIsRunning(true);
  }, [timerType, sessionsCompleted, settings, getDuration]);

  // Timer tick effect
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Handle timer reaching zero
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      handleTimerComplete();
    }
  }, [timeRemaining, isRunning, handleTimerComplete]);

  const start = useCallback(() => {
    setIsRunning(true);
    trackPomodoroStarted(timerType);
  }, [timerType]);

  const pause = useCallback(() => {
    setIsRunning(false);
    trackPomodoroPaused();
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    const duration = getDuration(timerType, settings);
    setTimeRemaining(duration);
    totalTimeRef.current = duration;
  }, [timerType, settings, getDuration]);

  const skip = useCallback(() => {
    setIsRunning(false);
    trackPomodoroSkipped(timerType);

    if (timerType === 'work') {
      // Skip to break without counting as completed session
      const isLongBreak = (sessionsCompleted + 1) % settings.sessionsBeforeLongBreak === 0;
      const nextType = isLongBreak ? 'longBreak' : 'shortBreak';
      setTimerType(nextType);
      const duration = getDuration(nextType, settings);
      setTimeRemaining(duration);
      totalTimeRef.current = duration;
    } else {
      // Skip break, go to work
      setTimerType('work');
      const duration = getDuration('work', settings);
      setTimeRemaining(duration);
      totalTimeRef.current = duration;
    }
  }, [timerType, sessionsCompleted, settings, getDuration]);

  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    trackPomodoroSettingsChanged();
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);

      // Update time remaining if timer is not running
      if (!isRunning) {
        const duration = getDuration(timerType, updated);
        setTimeRemaining(duration);
        totalTimeRef.current = duration;
      }

      return updated;
    });
  }, [isRunning, timerType, getDuration]);

  // Format time as MM:SS
  const formattedTime = `${Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:${(timeRemaining % 60).toString().padStart(2, '0')}`;

  // Calculate progress (0-1)
  const progress = totalTimeRef.current > 0 ? timeRemaining / totalTimeRef.current : 1;

  return {
    state: {
      timeRemaining,
      isRunning,
      timerType,
      sessionsCompleted,
      settings,
    },
    start,
    pause,
    reset,
    skip,
    updateSettings,
    formattedTime,
    progress,
  };
};
