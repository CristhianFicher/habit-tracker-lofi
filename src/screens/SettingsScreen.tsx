
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { usePomodoro } from '../contexts/PomodoroContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PixelBackground from '../components/PixelBackground';
import { useNavigation } from '@react-navigation/native';
import PomodoroBadge from '../components/PomodoroBadge';

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
      <View style={styles.container}>
        <Text style={styles.title}>⏱️ Configurações do Pomodoro</Text>

        <Text style={styles.label}>Tempo de foco (min):</Text>
        <TextInput style={styles.input} value={focus} onChangeText={setFocus} keyboardType="numeric" />

        <Text style={styles.label}>Pausa curta (min):</Text>
        <TextInput style={styles.input} value={short} onChangeText={setShort} keyboardType="numeric" />

        <Text style={styles.label}>Pausa longa (min):</Text>
        <TextInput style={styles.input} value={long} onChangeText={setLong} keyboardType="numeric" />

        <Button title="Salvar" onPress={handleSave} color="#FFD700" />
      </View>
      <PomodoroBadge />
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    paddingHorizontal: 30,
    gap: 16
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20
  },
  label: {
    color: 'white',
    fontSize: 16
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    fontSize: 16
  }
});
