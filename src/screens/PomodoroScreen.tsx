import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import PixelBackground from '../components/PixelBackground';
import { ChevronLeft, RefreshCcw, Pause, Play, SkipForward, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { usePomodoro } from '../contexts/PomodoroContext';

const PRESETS = [
  { label: 'Focus', focus: 25, short: 5, long: 15 },
  { label: 'Deep', focus: 50, short: 10, long: 20 },
  { label: 'Quick', focus: 15, short: 3, long: 10 },
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

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const phaseLabel =
    currentPhase === 'focus' ? 'Foco' : currentPhase === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa';

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.12] });

  const progress = useMemo(() => {
    const total =
      currentPhase === 'focus' ? focusTime : currentPhase === 'shortBreak' ? shortBreak : longBreak;
    return Math.max(0, Math.min(1, 1 - secondsLeft / total));
  }, [currentPhase, focusTime, shortBreak, longBreak, secondsLeft]);

  return (
    <PixelBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={22} color="white" />
        </TouchableOpacity>
        <View style={styles.titlePill}>
          <Sparkles size={14} color="#B8C2FF" />
          <Text style={styles.title}>Focus Session</Text>
        </View>
        <TouchableOpacity onPress={reset} style={styles.iconBtn}>
          <RefreshCcw size={18} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.timerShell}>
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
          <View style={styles.timerCard}>
            <Text style={styles.phaseText}>{phaseLabel}</Text>
            <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
            <Text style={styles.cycleText}>Ciclo {cycleCount + 1}/4 · {Math.round(progress * 100)}%</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={nextPhase} style={styles.secondaryButton}>
            <SkipForward size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={isRunning ? pause : start} style={styles.mainButton}>
            {isRunning ? <Pause size={24} color="white" /> : <Play size={24} color="white" />}
          </TouchableOpacity>
          <TouchableOpacity onPress={reset} style={styles.secondaryButton}>
            <RefreshCcw size={18} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.presetWrap}>
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
      </View>
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
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, gap: 28 },
  timerShell: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute',
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: 'rgba(111,124,255,0.4)',
  },
  timerCard: {
    width: 260,
    height: 260,
    borderRadius: 130,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,12,28,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(190,205,255,0.18)',
  },
  phaseText: { color: 'rgba(225,233,255,0.85)', fontSize: 16, marginBottom: 6 },
  cycleText: { color: 'rgba(208,216,242,0.75)', marginTop: 8, fontSize: 13 },
  timerText: { fontSize: 58, fontWeight: '700', color: 'white', letterSpacing: 2 },
  controlsRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  mainButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#626BFF',
  },
  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  presetWrap: { width: '100%', flexDirection: 'row', gap: 10 },
  presetButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  presetText: { color: '#E7EBFF', fontWeight: '600', letterSpacing: 0.3 },
});
