import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { usePomodoro } from '../contexts/PomodoroContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PixelBackground from '../components/PixelBackground';
import { useNavigation } from '@react-navigation/native';
import PomodoroBadge from '../components/PomodoroBadge';
import { ChevronLeft, Settings, TimerReset } from 'lucide-react-native';

export default function SettingsScreen() {
  const { setCustomTimes } = usePomodoro();
  const navigation = useNavigation();

  const [focus, setFocus] = useState('25');
  const [short, setShort] = useState('5');
  const [long, setLong] = useState('15');

  useEffect(() => {
    const load = async () => {
      const f = await AsyncStorage.getItem('focusTime');
      const s = await AsyncStorage.getItem('shortBreak');
      const l = await AsyncStorage.getItem('longBreak');
      if (f) setFocus((parseInt(f) / 60).toString());
      if (s) setShort((parseInt(s) / 60).toString());
      if (l) setLong((parseInt(l) / 60).toString());
    };
    load();
  }, []);

  const handleSave = async () => {
    const f = parseInt(focus) * 60;
    const s = parseInt(short) * 60;
    const l = parseInt(long) * 60;

    if (isNaN(f) || isNaN(s) || isNaN(l)) {
      Alert.alert('Erro', 'Digite apenas números válidos.');
      return;
    }

    await setCustomTimes(f, s, l);
    Alert.alert('Sucesso', 'Tempos atualizados!');
    navigation.goBack();
  };

  return (
    <PixelBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.titlePill}>
          <Settings size={14} color="#B8C2FF" />
          <Text style={styles.headerText}>Configurações</Text>
        </View>
        <View style={styles.iconBtnPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.iconHero}>
            <TimerReset size={34} color="#DDE7FF" />
          </View>
          <Text style={styles.kicker}>Pomodoro</Text>
          <Text style={styles.title}>Ajuste seus ciclos de foco</Text>
          <Text style={styles.subtitle}>Defina os tempos em minutos para deixar a rotina no seu ritmo.</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tempo de foco</Text>
            <TextInput style={styles.input} value={focus} onChangeText={setFocus} keyboardType="numeric" />
            <Text style={styles.helper}>Minutos dedicados a uma sessão principal.</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pausa curta</Text>
            <TextInput style={styles.input} value={short} onChangeText={setShort} keyboardType="numeric" />
            <Text style={styles.helper}>Intervalo rápido entre ciclos de foco.</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Pausa longa</Text>
            <TextInput style={styles.input} value={long} onChangeText={setLong} keyboardType="numeric" />
            <Text style={styles.helper}>Descanso maior após uma sequência completa.</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSave} activeOpacity={0.84}>
            <Text style={styles.buttonText}>Salvar configurações</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <PomodoroBadge />
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 34,
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    borderRadius: 30,
    padding: 24,
    backgroundColor: 'rgba(15,23,42,0.72)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 8,
  },
  iconHero: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59,130,246,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.16)',
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
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 8,
  },
  subtitle: {
    color: 'rgba(226,232,240,0.76)',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 22,
  },
  formGroup: { marginBottom: 16 },
  label: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(30,41,59,0.78)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  helper: {
    color: 'rgba(203,213,225,0.62)',
    fontSize: 12,
    marginTop: 6,
  },
  button: {
    backgroundColor: '#FACC15',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#111827',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
