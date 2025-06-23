import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { ChevronLeft, Plus } from 'lucide-react-native';
import HabitCard from '../components/HabitCard';
import Dialog from 'react-native-dialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PixelBackground from '../components/PixelBackground';
import PomodoroBadge from '../components/PomodoroBadge';

type Habit = {
  id: number;
  title: string;
  done: boolean;
  isFavorite: boolean;
};

export default function TasksScreen({ navigation }: { navigation: any }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newHabit, setNewHabit] = useState('');

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

  const toggleHabit = (id: number) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, done: !h.done } : h));
  };

  const toggleFavorite = (id: number) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, isFavorite: !h.isFavorite } : h));
  };

  const deleteHabit = (id: number) => {
    Alert.alert(
      'Excluir tarefa',
      'Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => setHabits(prev => prev.filter(h => h.id !== id))
        }
      ]
    );
  };

  const addHabit = () => {
    if (newHabit.trim()) {
      setHabits(prev => [...prev, {
        id: Date.now(),
        title: newHabit,
        done: false,
        isFavorite: false
      }]);
      setNewHabit('');
      setDialogVisible(false);
    }
  };

  return (
    <PixelBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Lista de Tarefas</Text>
        <TouchableOpacity onPress={() => setDialogVisible(true)}>
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={habits}
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
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma tarefa cadastrada</Text>
        }
      />

      <Dialog.Container 
        visible={dialogVisible}
        contentStyle={styles.dialogContainer}
      >
        <Dialog.Title style={styles.dialogTitle}>Novo Hábito</Dialog.Title>
        <Dialog.Input
          placeholder="Ex: Meditar"
          placeholderTextColor="#999"
          onChangeText={setNewHabit}
          value={newHabit}
          style={styles.dialogInput}
        />
        <Dialog.Button 
          label="Cancelar" 
          onPress={() => setDialogVisible(false)} 
          color="#FF5252"
        />
        <Dialog.Button 
          label="Adicionar" 
          onPress={addHabit} 
          color="#4CAF50"
        />
      </Dialog.Container>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  dialogContainer: {
    backgroundColor: '#252525',
  },
  dialogTitle: {
    color: '#FFF',
  },
  dialogInput: {
    color: '#FFF',
    borderBottomColor: '#444',
    borderBottomWidth: 1,
  },
  pomoWrapper: {
    position: 'absolute',
    top: 100,
    right: 25,
    zIndex: 10,
  },
});
