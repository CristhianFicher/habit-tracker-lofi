
import React, { createContext, useContext, useState } from 'react';

interface DiaryEntry {
  id: number;
  text: string;
  date: string;
  mood: '😄' | '😐' | '😢';
}

interface DiaryContextType {
  entries: DiaryEntry[];
  addEntry: (text: string, mood: DiaryEntry['mood']) => void;
}

const DiaryContext = createContext<DiaryContextType>({} as DiaryContextType);

export function useDiary() {
  return useContext(DiaryContext);
}

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  const addEntry = (text: string, mood: DiaryEntry['mood']) => {
    const newEntry: DiaryEntry = {
      id: Date.now(),
      text,
      mood,
      date: new Date().toLocaleDateString('pt-BR'),
    };
    setEntries(prev => [newEntry, ...prev]);
  };

  return (
    <DiaryContext.Provider value={{ entries, addEntry }}>
      {children}
    </DiaryContext.Provider>
  );
}
