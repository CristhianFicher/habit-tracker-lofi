import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PixelBackground from '../components/PixelBackground';
import { BookOpen, ChevronLeft, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import PomodoroBadge from '../components/PomodoroBadge';

interface DiaryEntry {
  date: string;
  text: string;
  mood: string;
}

const MOODS = ['😊', '😐', '😢', '😠', '😴'];

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
      mood,
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ChevronLeft size={22} color="#F8FAFC" />
          </TouchableOpacity>
          <View style={styles.titlePill}>
            <BookOpen size={14} color="#B8C2FF" />
            <Text style={styles.headerText}>Diário</Text>
          </View>
          <View style={styles.iconBtnPlaceholder} />
        </View>

        <FlatList
          data={entries}
          keyExtractor={item => item.date + item.text}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View style={styles.editorCard}>
              <Text style={styles.kicker}>Check-in diário</Text>
              <Text style={styles.title}>Como está seu progresso hoje?</Text>
              <Text style={styles.subtitle}>Registre humor, aprendizados e pequenos avanços para revisar depois.</Text>

              <View style={styles.moodRow}>
                {MOODS.map(item => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setMood(item)}
                    style={[styles.moodButton, mood === item && styles.moodButtonSelected]}
                  >
                    <Text style={styles.mood}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Digite sua anotação..."
                placeholderTextColor="rgba(203,213,225,0.58)"
                value={text}
                onChangeText={setText}
                multiline
              />
              <TouchableOpacity style={styles.button} onPress={saveEntry} activeOpacity={0.84}>
                <Text style={styles.buttonText}>Salvar anotação</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.entry}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{item.date}</Text>
                <Text style={styles.entryMood}>{item.mood}</Text>
              </View>
              <Text style={styles.entryText}>{item.text}</Text>
              <TouchableOpacity onPress={() => deleteEntry(item.date)} style={styles.deleteBtn}>
                <Trash2 color="#F87171" size={18} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma anotação salva ainda.</Text>}
        />
      </KeyboardAvoidingView>
      <PomodoroBadge />
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    width: '100%',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  iconBtnPlaceholder: { width: 38, height: 38 },
  titlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  headerText: { color: '#E9ECFF', fontSize: 14, letterSpacing: 1.1, textTransform: 'uppercase' },
  content: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 110,
  },
  editorCard: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    borderRadius: 30,
    padding: 22,
    backgroundColor: 'rgba(15,23,42,0.72)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 8,
    marginBottom: 18,
  },
  kicker: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 8,
  },
  subtitle: {
    color: 'rgba(226,232,240,0.76)',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 16,
  },
  moodButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.14)',
  },
  moodButtonSelected: {
    backgroundColor: 'rgba(250,204,21,0.16)',
    borderColor: 'rgba(250,204,21,0.36)',
  },
  mood: { fontSize: 23 },
  input: {
    minHeight: 118,
    backgroundColor: 'rgba(30,41,59,0.78)',
    color: '#F8FAFC',
    borderRadius: 20,
    padding: 14,
    fontSize: 15,
    lineHeight: 21,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  button: {
    backgroundColor: '#FACC15',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 14,
  },
  buttonText: {
    color: '#111827',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  entry: {
    backgroundColor: 'rgba(15,23,42,0.62)',
    padding: 16,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  entryDate: {
    color: '#FACC15',
    fontWeight: '800',
    fontSize: 13,
  },
  entryMood: { fontSize: 16 },
  entryText: {
    color: '#F8FAFC',
    fontSize: 15,
    lineHeight: 21,
    paddingRight: 30,
  },
  deleteBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4,
  },
  emptyText: {
    color: 'rgba(226,232,240,0.62)',
    textAlign: 'center',
    marginTop: 18,
    fontSize: 15,
  },
});
