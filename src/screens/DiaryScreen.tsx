import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PixelBackground from '../components/PixelBackground';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import PomodoroBadge from '../components/PomodoroBadge';

interface DiaryEntry {
  date: string;
  text: string;
  mood: string;
}

export default function DiaryScreen() {
  const [text, setText] = useState('');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [mood, setMood] = useState('😊');
  const navigation = useNavigation();

  useEffect(() => {
    loadEntries();
  }, []);

  const saveEntry = async () => {
    if (!text.trim()) return;
    const newEntry: DiaryEntry = {
      date: new Date().toLocaleDateString(),
      text,
      mood
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    await AsyncStorage.setItem('diary', JSON.stringify(updated));
    setText('');
    setMood('😊');
  };

  const loadEntries = async () => {
    const data = await AsyncStorage.getItem('diary');
    if (data) setEntries(JSON.parse(data));
  };

  const deleteEntry = async (date: string) => {
    const updated = entries.filter(entry => entry.date !== date);
    setEntries(updated);
    await AsyncStorage.setItem('diary', JSON.stringify(updated));
  };

  return (
    <PixelBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Diário de Progresso</Text>
        </View>

        <View style={styles.container}>
          <Text style={styles.label}>Como está se sentindo hoje?</Text>
          <View style={styles.moodRow}>
            {['😊', '😐', '😢', '😠', '😴'].map(item => (
              <TouchableOpacity key={item} onPress={() => setMood(item)}>
                <Text style={[styles.mood, mood === item && styles.moodSelected]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Digite sua anotação..."
            placeholderTextColor="#ccc"
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={saveEntry}>
            <Text style={styles.buttonText}>Salvar Anotação</Text>
          </TouchableOpacity>

          <FlatList
            data={entries}
            keyExtractor={item => item.date + item.text}
            renderItem={({ item }) => (
              <View style={styles.entry}>
                <Text style={styles.entryDate}>{item.date} - {item.mood}</Text>
                <Text style={styles.entryText}>{item.text}</Text>
                <TouchableOpacity onPress={() => deleteEntry(item.date)} style={styles.deleteBtn}>
                  <Trash2 color="red" size={18} />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </View>
      </KeyboardAvoidingView>
      <PomodoroBadge/>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  container: {
    flex: 1,
    paddingTop: 120,
    paddingHorizontal: 20
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10
  },
  moodRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12
  },
  mood: {
    fontSize: 24,
    opacity: 0.5
  },
  moodSelected: {
    opacity: 1
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12
  },
  button: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold'
  },
  entry: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    position: 'relative'
  },
  entryDate: {
    color: '#FFD700',
    marginBottom: 4,
    fontSize: 14
  },
  entryText: {
    color: 'white',
    fontSize: 15
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8
  }
});
