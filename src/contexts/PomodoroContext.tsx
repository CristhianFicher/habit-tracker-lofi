
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PomodoroContextType = {
  secondsLeft: number;
  isRunning: boolean;
  currentPhase: 'focus' | 'shortBreak' | 'longBreak';
  start: () => void;
  pause: () => void;
  reset: () => void;
  setCustomTimes: (focus: number, shortBreak: number, longBreak: number) => void;
};

const PomodoroContext = createContext<PomodoroContextType>({} as PomodoroContextType);

export function usePomodoro() {
  return useContext(PomodoroContext);
}

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [cycleCount, setCycleCount] = useState(0);

  const [focusTime, setFocusTime] = useState(25 * 60);
  const [shortBreak, setShortBreak] = useState(5 * 60);
  const [longBreak, setLongBreak] = useState(15 * 60);

  useEffect(() => {
    const loadTimes = async () => {
      const focus = await AsyncStorage.getItem('focusTime');
      const short = await AsyncStorage.getItem('shortBreak');
      const long = await AsyncStorage.getItem('longBreak');

      const f = focus ? parseInt(focus) : 25 * 60;
      const s = short ? parseInt(short) : 5 * 60;
      const l = long ? parseInt(long) : 15 * 60;

      setFocusTime(f);
      setShortBreak(s);
      setLongBreak(l);
      setSecondsLeft(f);
    };

    loadTimes();
  }, []);

  useEffect(() => {
    if (isRunning) {
      const id = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(id);
            handlePhaseSwitch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else if (intervalId) {
      clearInterval(intervalId);
    }
  }, [isRunning]);

  const handlePhaseSwitch = () => {
    setIsRunning(false);
    setTimeout(() => {
      setIsRunning(true);
    }, 1000);

    if (currentPhase === 'focus') {
      const newCycle = cycleCount + 1;
      setCycleCount(newCycle);
      if (newCycle % 4 === 0) {
        setCurrentPhase('longBreak');
        setSecondsLeft(longBreak);
      } else {
        setCurrentPhase('shortBreak');
        setSecondsLeft(shortBreak);
      }
    } else {
      setCurrentPhase('focus');
      setSecondsLeft(focusTime);
    }
  };

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setCycleCount(0);
    setCurrentPhase('focus');
    setSecondsLeft(focusTime);
    setIsRunning(false);
  };

  const setCustomTimes = async (focus: number, short: number, long: number) => {
    await AsyncStorage.setItem('focusTime', focus.toString());
    await AsyncStorage.setItem('shortBreak', short.toString());
    await AsyncStorage.setItem('longBreak', long.toString());
    setFocusTime(focus);
    setShortBreak(short);
    setLongBreak(long);
    setCurrentPhase('focus');
    setSecondsLeft(focus);
  };

  return (
    <PomodoroContext.Provider
      value={{ secondsLeft, isRunning, start, pause, reset, setCustomTimes, currentPhase }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}
