import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { usePomodoro } from '../contexts/PomodoroContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PixelBackground from '../components/PixelBackground';
import { useNavigation } from '@react-navigation/native';
import PomodoroBadge from '../components/PomodoroBadge';
import { ChevronLeft, Settings, TimerReset } from 'lucide-react-native';

const DEFAULTS = { focus: '25', short: '5', long: '15' };

export default function SettingsScreen() {
  const { setCustomTimes, isRunning } = usePomodoro();
  const navigation = useNavigation();

  const [focus, setFocus] = useState(DEFAULTS.focus);
  const [short, setShort] = useState(DEFAULTS.short);
  const [long, setLong] = useState(DEFAULTS.long);

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

  const parsedFocus = parseInt(focus, 10);
  const parsedShort = parseInt(short, 10);
  const parsedLong = parseInt(long, 10);

  // Antes só checava isNaN — "0" ou "-5" passavam e travavam o timer.
  const isValid =
    Number.isInteger(parsedFocus) &&
    parsedFocus > 0 &&
    Number.isInteger(parsedShort) &&
    parsedShort > 0 &&
    Number.isInteger(parsedLong) &&
    parsedLong > 0;

  const applyTimes = async () => {
    await setCustomTimes(parsedFocus * 60, parsedShort * 60, parsedLong * 60);
    Alert.alert('Sucesso', 'Tempos atualizados!');
    navigation.goBack();
  };

  const handleSave = () => {
    if (!isValid) {
      Alert.alert('Erro', 'Digite apenas números inteiros maiores que zero.');
      return;
    }

    // setCustomTimes reinicia o ciclo do zero — se tem um pomodoro rodando,
    // o usuário merece saber antes de perder o progresso da sessão atual.
    if (isRunning) {
      Alert.alert('Pomodoro em andamento', 'Salvar agora vai reiniciar o ciclo atual do zero. Deseja continuar?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salvar mesmo assim', style: 'destructive', onPress: applyTimes },
      ]);
      return;
    }

    applyTimes();
  };

  const handleReset = () => {
    setFocus(DEFAULTS.focus);
    setShort(DEFAULTS.short);
    setLong(DEFAULTS.long);
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

          {isRunning && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>Há um ciclo em andamento. Salvar vai reiniciá-lo.</Text>
            </View>
          )}

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

          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleSave}
            activeOpacity={0.84}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>Salvar configurações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleReset} activeOpacity={0.7}>
            <Text style={styles.secondaryButtonText}>Restaurar padrão (25 / 5 / 15)</Text>
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
  warningBanner: {
    backgroundColor: 'rgba(250,204,21,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.30)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  warningText: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '700',
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
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#111827',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  secondaryButtonText: {
    color: 'rgba(226,232,240,0.72)',
    fontSize: 13,
    fontWeight: '700',
  },
});
