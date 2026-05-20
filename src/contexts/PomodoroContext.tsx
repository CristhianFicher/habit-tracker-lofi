import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Phase = 'focus' | 'shortBreak' | 'longBreak';

type PomodoroContextType = {
  secondsLeft: number;
  isRunning: boolean;
  currentPhase: Phase;
  cycleCount: number;
  focusTime: number;
  shortBreak: number;
  longBreak: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  nextPhase: () => void;
  setCustomTimes: (focus: number, shortBreak: number, longBreak: number) => void;
};

const PomodoroContext = createContext<PomodoroContextType>({} as PomodoroContextType);

export function usePomodoro() {
  return useContext(PomodoroContext);
}

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>('focus');
  const [cycleCount, setCycleCount] = useState(0);

  const [focusTime, setFocusTime] = useState(25 * 60);
  const [shortBreak, setShortBreak] = useState(5 * 60);
  const [longBreak, setLongBreak] = useState(15 * 60);

  useEffect(() => {
    const loadTimes = async () => {
      const focus = await AsyncStorage.getItem('focusTime');
      const short = await AsyncStorage.getItem('shortBreak');
      const long = await AsyncStorage.getItem('longBreak');

      const f = focus ? parseInt(focus, 10) : 25 * 60;
      const s = short ? parseInt(short, 10) : 5 * 60;
      const l = long ? parseInt(long, 10) : 15 * 60;

      setFocusTime(f);
      setShortBreak(s);
      setLongBreak(l);
      setSecondsLeft(f);
    };

    loadTimes();
  }, []);

  const switchToNextPhase = () => {
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

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          switchToNextPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, currentPhase, cycleCount, focusTime, shortBreak, longBreak]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setCycleCount(0);
    setCurrentPhase('focus');
    setSecondsLeft(focusTime);
  };

  const nextPhase = () => {
    setIsRunning(false);
    switchToNextPhase();
  };

  const setCustomTimes = async (focus: number, short: number, long: number) => {
    await AsyncStorage.setItem('focusTime', focus.toString());
    await AsyncStorage.setItem('shortBreak', short.toString());
    await AsyncStorage.setItem('longBreak', long.toString());
    setFocusTime(focus);
    setShortBreak(short);
    setLongBreak(long);
    setIsRunning(false);
    setCurrentPhase('focus');
    setCycleCount(0);
    setSecondsLeft(focus);
  };

  return (
    <PomodoroContext.Provider
      value={{
        secondsLeft,
        isRunning,
        currentPhase,
        cycleCount,
        focusTime,
        shortBreak,
        longBreak,
        start,
        pause,
        reset,
        nextPhase,
        setCustomTimes,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}
