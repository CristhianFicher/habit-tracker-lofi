import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { CheckSquare, ChevronLeft, Plus, Search } from 'lucide-react-native';
import HabitCard from '../components/HabitCard';
import Dialog from 'react-native-dialog';
import PixelBackground from '../components/PixelBackground';
import { useHabitContext, Habit } from '../contexts/HabitContext';

type FilterType = 'all' | 'pending' | 'done' | 'favorite';

const getTodayInputDate = () => new Date().toISOString().split('T')[0];

const FILTERS: Array<{ key: FilterType; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'done', label: 'Feitas' },
  { key: 'favorite', label: 'Favoritas' },
];

export default function TasksScreen({ navigation }: { navigation: any }) {
  const { habits, addHabit, updateHabitTitle, toggleHabit, toggleFavorite, deleteHabit } = useHabitContext();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [newHabit, setNewHabit] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

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

  const confirmDelete = (id: number) => {
    Alert.alert('Excluir tarefa', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteHabit(id) },
    ]);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setEditingHabit(null);
    setNewHabit('');
  };

  const openCreateDialog = () => {
    setEditingHabit(null);
    setNewHabit('');
    setDialogVisible(true);
  };

  const openEditDialog = (habit: Habit) => {
    setEditingHabit(habit);
    setNewHabit(habit.title);
    setDialogVisible(true);
  };

  const saveHabit = () => {
    if (!newHabit.trim()) return;

    if (editingHabit) {
      updateHabitTitle(editingHabit.id, newHabit);
    } else {
      addHabit(newHabit);
    }
    closeDialog();
  };

  return (
    <PixelBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={20} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.titlePill}>
          <CheckSquare size={14} color="#B8C2FF" />
          <Text style={styles.title}>Tasks Diárias</Text>
        </View>
        <TouchableOpacity onPress={openCreateDialog} style={styles.iconBtn}>
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
            createdAt={item.createdAt}
            endDate={item.endDate}
            onEdit={() => openEditDialog(item)}
            onDelete={() => confirmDelete(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma tarefa para esse filtro.</Text>}
      />

      <Dialog.Container visible={dialogVisible} contentStyle={styles.dialogContainer}>
        <Dialog.Title style={styles.dialogTitle}>{editingHabit ? 'Editar tarefa' : 'Nova tarefa'}</Dialog.Title>
        <Dialog.Input
          label="Descrição"
          placeholder="Ex: Meditar 10 minutos"
          placeholderTextColor="#999"
          onChangeText={setNewHabit}
          value={newHabit}
          style={styles.dialogInput}
        />
        <Text style={styles.dialogHelp}>Data de cadastro: {editingHabit?.createdAt || getTodayInputDate()}</Text>
        {editingHabit?.endDate ? (
          <Text style={styles.dialogHelp}>Concluída em: {editingHabit.endDate}</Text>
        ) : null}
        <Dialog.Button label="Cancelar" onPress={closeDialog} color="#FF5252" />
        <Dialog.Button label={editingHabit ? 'Salvar' : 'Adicionar'} onPress={saveHabit} color="#6D79FF" />
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
  titlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  title: { color: '#E9ECFF', fontSize: 14, letterSpacing: 1.1, textTransform: 'uppercase' },
  panel: {
    marginHorizontal: 22,
    backgroundColor: 'rgba(15,23,42,0.72)',
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 8,
  },
  statsMain: { color: '#F8FAFC', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  statsSub: { color: 'rgba(226,232,240,0.76)', marginTop: 6, marginBottom: 14 },
  searchBox: {
    backgroundColor: 'rgba(30,41,59,0.78)',
    borderRadius: 18,
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
  filterChipActive: { backgroundColor: 'rgba(250,204,21,0.16)' },
  filterText: { color: 'rgba(225,232,255,0.75)', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#FACC15' },
  listContent: { paddingHorizontal: 22, paddingBottom: 28 },
  emptyText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 30, fontSize: 16 },
  dialogContainer: { backgroundColor: '#1A1E2C' },
  dialogTitle: { color: '#FFF' },
  dialogInput: { color: '#FFF', borderBottomColor: '#444', borderBottomWidth: 1 },
  dialogHelp: { color: 'rgba(255,255,255,0.62)', fontSize: 12, marginLeft: 24, marginBottom: 4 },
});
