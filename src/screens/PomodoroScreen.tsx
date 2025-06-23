import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PixelBackground from '../components/PixelBackground';
import { ChevronLeft, RefreshCcw, Pause, Play } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { usePomodoro } from '../contexts/PomodoroContext';
import PomodoroBadge from '../components/PomodoroBadge';

export default function PomodoroScreen() {
  const navigation = useNavigation();
  const { secondsLeft, isRunning, start, pause, reset } = usePomodoro();

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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

      <View style={styles.timerBox}>
        <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
        <TouchableOpacity
          onPress={isRunning ? pause : start}
          style={styles.button}
        >
          {isRunning ? (
            <Pause size={24} color="white" />
          ) : (
            <Play size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>

      
      <PomodoroBadge />
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
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 50,
  },
  pomoBadge: {
    position: 'absolute',
    top: 100,
    right: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pomoText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
  },
});
