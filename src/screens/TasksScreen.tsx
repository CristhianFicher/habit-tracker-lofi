import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { ChevronLeft, Plus, Search, ListFilter } from 'lucide-react-native';
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

    setHabits(prev => [
      { id: Date.now(), title: newHabit.trim(), done: false, isFavorite: false },
      ...prev,
    ]);
    setNewHabit('');
    setDialogVisible(false);
  };

  return (
    <PixelBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Tarefas</Text>
        <TouchableOpacity onPress={() => setDialogVisible(true)}>
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsMain}>{completedCount}/{habits.length} concluídas</Text>
        <Text style={styles.statsSub}>Mantenha o ritmo hoje 🚀</Text>
      </View>

      <View style={styles.searchBox}>
        <Search size={18} color="rgba(255,255,255,0.7)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tarefa..."
          placeholderTextColor="rgba(255,255,255,0.65)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filtersRow}>
        {(['all', 'pending', 'done', 'favorite'] as FilterType[]).map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.filterChip, filter === item && styles.filterChipActive]}
            onPress={() => setFilter(item)}
          >
            <ListFilter size={14} color="#fff" />
            <Text style={styles.filterText}>
              {item === 'all' ? 'Todas' : item === 'pending' ? 'Pendentes' : item === 'done' ? 'Concluídas' : 'Favoritas'}
            </Text>
          </TouchableOpacity>
        ))}
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
        <Dialog.Button label="Adicionar" onPress={addHabit} color="#4CAF50" />
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
    paddingTop: 50,
    paddingBottom: 14,
  },
  title: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  statsCard: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.28)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  statsMain: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  statsSub: { color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  searchBox: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: { color: '#fff', flex: 1, paddingHorizontal: 8, paddingVertical: 10 },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, margin: 16, marginTop: 10 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  filterChipActive: { backgroundColor: 'rgba(76,175,80,0.5)' },
  filterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  emptyText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 30, fontSize: 16 },
  dialogContainer: { backgroundColor: '#252525' },
  dialogTitle: { color: '#FFF' },
  dialogInput: { color: '#FFF', borderBottomColor: '#444', borderBottomWidth: 1 },
});
