import React, { createContext, useContext, useState, ReactNode } from 'react';

type Habit = {
  id: number;
  title: string;
  done: boolean;
  isFavorite: boolean;
};

type HabitContextType = {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  favoriteId: number | null;
  setFavoriteId: React.Dispatch<React.SetStateAction<number | null>>;
};

const HabitContext = createContext<HabitContextType>({
  habits: [],
  setHabits: () => {},
  favoriteId: null,
  setFavoriteId: () => {}
});

export function useHabitContext() {
  return useContext(HabitContext);
}

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);

  return (
    <HabitContext.Provider
      value={{
        habits,
        setHabits,
        favoriteId, 
        setFavoriteId
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}