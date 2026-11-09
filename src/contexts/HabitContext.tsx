import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Habit = {
  id: number;
  title: string;
  done: boolean;
  isFavorite: boolean;
  createdAt: string;
  endDate?: string;
};

type HabitContextType = {
  habits: Habit[];
  favoriteHabit: Habit | undefined;
  addHabit: (title: string) => void;
  updateHabitTitle: (id: number, title: string) => void;
  toggleHabit: (id: number) => void;
  toggleFavorite: (id: number) => void;
  deleteHabit: (id: number) => void;
};

const HabitContext = createContext<HabitContextType>({
  habits: [],
  favoriteHabit: undefined,
  addHabit: () => {},
  updateHabitTitle: () => {},
  toggleHabit: () => {},
  toggleFavorite: () => {},
  deleteHabit: () => {},
});

export function useHabitContext() {
  return useContext(HabitContext);
}

const STORAGE_KEY = '@habits'; // mesma chave que o TasksScreen já usava — dados antigos continuam aparecendo
const getTodayInputDate = () => new Date().toISOString().split('T')[0];

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Habit[];
          setHabits(parsed.map(h => ({ ...h, createdAt: h.createdAt || getTodayInputDate() })));
        }
      } catch (error) {
        console.error('Erro ao carregar hábitos:', error);
      } finally {
        hasLoaded.current = true;
      }
    };
    load();
  }, []);

  useEffect(() => {
    // Evita gravar [] no AsyncStorage antes do load inicial terminar.
    if (!hasLoaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits)).catch(error =>
      console.error('Erro ao salvar hábitos:', error),
    );
  }, [habits]);

  const addHabit = (title: string) => {
    if (!title.trim()) return;
    setHabits(prev => [
      {
        id: Date.now(),
        title: title.trim(),
        done: false,
        isFavorite: false,
        createdAt: getTodayInputDate(),
      },
      ...prev,
    ]);
  };

  const updateHabitTitle = (id: number, title: string) => {
    if (!title.trim()) return;
    setHabits(prev => prev.map(h => (h.id === id ? { ...h, title: title.trim() } : h)));
  };

  // Ao marcar como concluída, grava a data de hoje como data de término.
  // Ao desmarcar, remove a data de término (volta a ser pendente).
  const toggleHabit = (id: number) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== id) return h;
        const willBeDone = !h.done;
        return { ...h, done: willBeDone, endDate: willBeDone ? getTodayInputDate() : undefined };
      }),
    );
  };

  const toggleFavorite = (id: number) => {
    setHabits(prev => prev.map(h => (h.id === id ? { ...h, isFavorite: !h.isFavorite } : h)));
  };

  const deleteHabit = (id: number) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const favoriteHabit = habits.find(h => h.isFavorite);

  return (
    <HabitContext.Provider
      value={{ habits, favoriteHabit, addHabit, updateHabitTitle, toggleHabit, toggleFavorite, deleteHabit }}
    >
      {children}
    </HabitContext.Provider>
  );
}
