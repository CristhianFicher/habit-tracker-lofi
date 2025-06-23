import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePomodoro } from '../contexts/PomodoroContext';

export default function PomodoroBadge() {
  const { isRunning, secondsLeft } = usePomodoro();

  if (!isRunning) return null;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={styles.pomoBadge}>
      <Text style={styles.pomoText}>{formatTime(secondsLeft)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pomoBadge: {
    position: 'absolute',
    top: 100,
    right: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 999,
  },
  pomoText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
  }
});
