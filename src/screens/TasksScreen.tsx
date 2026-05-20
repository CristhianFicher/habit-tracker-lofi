import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { ChevronLeft, Plus, Search } from 'lucide-react-native';
import HabitCard from '../components/HabitCard';
import Dialog from 'react-native-dialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PixelBackground from '../components/PixelBackground';

type Habit = {
  id: number;
  title: string;
  done: boolean;
  isFavorite: boolean;
};

type FilterType = 'all' | 'pending' | 'done' | 'favorite';

const FILTERS: Array<{ key: FilterType; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'done', label: 'Feitas' },
  { key: 'favorite', label: 'Favoritas' },
];

export default function TasksScreen({ navigation }: { navigation: any }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const loadHabits = async () => {
      try {
        const saved = await AsyncStorage.getItem('@habits');
        if (saved) setHabits(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar hábitos:', error);
      }
    };
    loadHabits();
  }, []);

  useEffect(() => {
    const saveHabits = async () => {
      try {
        await AsyncStorage.setItem('@habits', JSON.stringify(habits));
      } catch (error) {
        console.error('Erro ao salvar hábitos:', error);
      }
    };
    saveHabits();
  }, [habits]);

  const filteredHabits = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return habits
      .filter(habit => {
        if (filter === 'pending') return !habit.done;
        if (filter === 'done') return habit.done;
        if (filter === 'favorite') return habit.isFavorite;
        return true;
      })
      .filter(habit => habit.title.toLowerCase().includes(normalizedSearch));
  }, [habits, search, filter]);

  const completedCount = habits.filter(h => h.done).length;

  const toggleHabit = (id: number) => {
    setHabits(prev => prev.map(h => (h.id === id ? { ...h, done: !h.done } : h)));
  };

  const toggleFavorite = (id: number) => {
    setHabits(prev => prev.map(h => (h.id === id ? { ...h, isFavorite: !h.isFavorite } : h)));
  };

  const deleteHabit = (id: number) => {
    Alert.alert('Excluir tarefa', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => setHabits(prev => prev.filter(h => h.id !== id)),
      },
    ]);
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;

    setHabits(prev => [{ id: Date.now(), title: newHabit.trim(), done: false, isFavorite: false }, ...prev]);
    setNewHabit('');
    setDialogVisible(false);
  };

  return (
    <PixelBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Daily Tasks</Text>
        <TouchableOpacity onPress={() => setDialogVisible(true)} style={styles.iconBtn}>
          <Plus size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.panel}>
        <Text style={styles.statsMain}>{completedCount}/{habits.length} concluídas</Text>
        <Text style={styles.statsSub}>Você está construindo consistência.</Text>

        <View style={styles.searchBox}>
          <Search size={16} color="rgba(228,234,255,0.7)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tarefa..."
            placeholderTextColor="rgba(220,228,255,0.58)"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filtersRow}>
          {FILTERS.map(item => (
            <TouchableOpacity
              key={item.key}
              style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredHabits}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <HabitCard
            title={item.title}
            done={item.done}
            isFavorite={item.isFavorite}
            onToggle={() => toggleHabit(item.id)}
            onFavorite={() => toggleFavorite(item.id)}
            onDelete={() => deleteHabit(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma tarefa para esse filtro.</Text>}
      />

      <Dialog.Container visible={dialogVisible} contentStyle={styles.dialogContainer}>
        <Dialog.Title style={styles.dialogTitle}>Nova tarefa</Dialog.Title>
        <Dialog.Input
          placeholder="Ex: Meditar 10 minutos"
          placeholderTextColor="#999"
          onChangeText={setNewHabit}
          value={newHabit}
          style={styles.dialogInput}
        />
        <Dialog.Button label="Cancelar" onPress={() => setDialogVisible(false)} color="#FF5252" />
        <Dialog.Button label="Adicionar" onPress={addHabit} color="#6D79FF" />
      </Dialog.Container>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 14,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: { color: '#F5F7FF', fontSize: 18, fontWeight: '600', letterSpacing: 0.8 },
  panel: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(8,12,28,0.68)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(194,210,255,0.14)',
    marginBottom: 12,
  },
  statsMain: { color: '#EFF3FF', fontSize: 17, fontWeight: '700' },
  statsSub: { color: 'rgba(224,231,255,0.72)', marginTop: 4, marginBottom: 10 },
  searchBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: { color: '#fff', flex: 1, paddingHorizontal: 8, paddingVertical: 10 },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  filterChip: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filterChipActive: { backgroundColor: 'rgba(104,117,255,0.45)' },
  filterText: { color: 'rgba(225,232,255,0.75)', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  emptyText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 30, fontSize: 16 },
  dialogContainer: { backgroundColor: '#1A1E2C' },
  dialogTitle: { color: '#FFF' },
  dialogInput: { color: '#FFF', borderBottomColor: '#444', borderBottomWidth: 1 },
});
