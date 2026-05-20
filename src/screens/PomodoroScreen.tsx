import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PixelBackground from '../components/PixelBackground';
import { ChevronLeft, RefreshCcw, Pause, Play, SkipForward } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { usePomodoro } from '../contexts/PomodoroContext';

const PRESETS = [
  { label: 'Padrão', focus: 25, short: 5, long: 15 },
  { label: 'Profundo', focus: 50, short: 10, long: 20 },
  { label: 'Rápido', focus: 15, short: 3, long: 10 },
];

export default function PomodoroScreen() {
  const navigation = useNavigation();
  const {
    secondsLeft,
    isRunning,
    start,
    pause,
    reset,
    nextPhase,
    currentPhase,
    cycleCount,
    focusTime,
    shortBreak,
    longBreak,
    setCustomTimes,
  } = usePomodoro();

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const phaseLabel =
    currentPhase === 'focus' ? 'Foco' : currentPhase === 'shortBreak' ? 'Pausa curta' : 'Pausa longa';

  return (
    <PixelBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Pomodoro</Text>
        <TouchableOpacity onPress={reset}>
          <RefreshCcw size={22} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseText}>{phaseLabel}</Text>
          <Text style={styles.cycleText}>Ciclo {cycleCount + 1}/4</Text>
        </View>

        <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>

        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={nextPhase} style={styles.secondaryButton}>
            <SkipForward size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={isRunning ? pause : start} style={styles.mainButton}>
            {isRunning ? <Pause size={24} color="white" /> : <Play size={24} color="white" />}
          </TouchableOpacity>
          <TouchableOpacity onPress={reset} style={styles.secondaryButton}>
            <RefreshCcw size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.presetWrap}>
          <Text style={styles.sectionTitle}>Presets</Text>
          <View style={styles.presetRow}>
            {PRESETS.map(preset => (
              <TouchableOpacity
                key={preset.label}
                style={styles.presetButton}
                onPress={() => setCustomTimes(preset.focus * 60, preset.short * 60, preset.long * 60)}
              >
                <Text style={styles.presetText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.currentConfigText}>
            Atual: {Math.floor(focusTime / 60)} / {Math.floor(shortBreak / 60)} / {Math.floor(longBreak / 60)} min
          </Text>
        </View>
      </View>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    width: '100%',
  },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  phaseBadge: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  phaseText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cycleText: { color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  timerText: { fontSize: 72, fontWeight: 'bold', color: 'white', letterSpacing: 3 },
  controlsRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  mainButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76,175,80,0.8)',
  },
  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  presetWrap: { width: '100%', marginTop: 10 },
  sectionTitle: { color: '#fff', fontWeight: '700', marginBottom: 8 },
  presetRow: { flexDirection: 'row', gap: 10 },
  presetButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  presetText: { color: '#fff', fontWeight: '600' },
  currentConfigText: { color: 'rgba(255,255,255,0.8)', marginTop: 10, textAlign: 'center' },
});
