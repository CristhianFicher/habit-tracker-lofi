import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DiaryEntry = {
  id: number;
  date: string;
  text: string;
  mood: string;
};

type DiaryContextType = {
  entries: DiaryEntry[];
  addEntry: (text: string, mood: string) => void;
  deleteEntry: (id: number) => void;
};

const DiaryContext = createContext<DiaryContextType>({
  entries: [],
  addEntry: () => {},
  deleteEntry: () => {},
});

export function useDiary() {
  return useContext(DiaryContext);
}

const STORAGE_KEY = 'diary'; // mesma chave que a DiaryScreen já usava — dados antigos continuam aparecendo

export function DiaryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data) as DiaryEntry[];
          // Compatibilidade com anotações antigas salvas sem id.
          setEntries(parsed.map((entry, index) => ({ ...entry, id: entry.id ?? Date.now() + index })));
        }
      } catch (error) {
        console.error('Erro ao carregar diário:', error);
      } finally {
        hasLoaded.current = true;
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch(error =>
      console.error('Erro ao salvar diário:', error),
    );
  }, [entries]);

  const addEntry = (text: string, mood: string) => {
    if (!text.trim()) return;
    const newEntry: DiaryEntry = {
      id: Date.now(),
      text: text.trim(),
      mood,
      date: new Date().toLocaleDateString('pt-BR'),
    };
    setEntries(prev => [newEntry, ...prev]);
  };

  const deleteEntry = (id: number) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  return (
    <DiaryContext.Provider value={{ entries, addEntry, deleteEntry }}>
      {children}
    </DiaryContext.Provider>
  );
}
