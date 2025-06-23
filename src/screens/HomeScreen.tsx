import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import PixelBackground from '../components/PixelBackground';
import { CheckSquare, Timer, Music2, Power, Mail, Scissors, BookOpen, BadgeQuestionMarkIcon,} from 'lucide-react-native';
import { useHabitContext } from '../contexts/HabitContext';
import { usePomodoro } from '../contexts/PomodoroContext';
import PomodoroBadge from '../components/PomodoroBadge';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const { habits, favoriteId } = useHabitContext();
  const favoriteHabit = habits.find(h => h.id === favoriteId);
  const { secondsLeft, isRunning } = usePomodoro();

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <PixelBackground>
      <View style={styles.topIcons}>
        <Power size={20} color="white" style={styles.topIcon} />
        <Mail size={20} color="white" style={styles.topIcon} />
        <Scissors size={20} color="white" style={styles.topIcon} />
      </View>

      {favoriteHabit && (
        <View style={styles.favContainer}>
          <Text style={styles.favLabel}>⭐ Favorito do dia:</Text>
          <Text style={styles.favTitle}>📌 {favoriteHabit.title}</Text>
        </View>
      )}
      {isRunning && (
        <View style={styles.pomoBadge}>
          <Text style={styles.pomoText}>{formatTime(secondsLeft)}</Text>
        </View>
      )}

      <View style={styles.menu}>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Tasks')}>
          <CheckSquare color="white" size={30} style={styles.icon} />
          <Text style={styles.label}>Tasks Diárias</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Pomodoro')}>
          <Timer color="white" size={30} style={styles.icon} />
          <Text style={styles.label}>Pomodoro</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Music')}>
          <Music2 color="white" size={30} style={styles.icon} />
          <Text style={styles.label}>Música Lo-fi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Diary')}>
          <BookOpen color="white" size={30} style={styles.icon} />
          <Text style={styles.label}>Diário</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Settings')}>
          <BadgeQuestionMarkIcon color="white" size={30} style={styles.icon} />
          <Text style={styles.label}>Configurações</Text>
        </TouchableOpacity>

      </View>

      {favoriteHabit && (
        <View style={styles.favoriteBox}>
          <Text style={styles.favoriteLabel}>⭐ Favorito do dia</Text>
          <Text style={styles.favoriteTitle}>{favoriteHabit.title}</Text>
        </View>
      )}
      <PomodoroBadge />
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  topIcons: {
    position: 'absolute',
    top: 50,
    left: 25,
    flexDirection: 'row',
    gap: 18
  },
  topIcon: { opacity: 0.6 },
  menu: {
    alignSelf: 'flex-start',
    marginLeft: 30,
    marginTop: 160,
    gap: 20
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { opacity: 0.7 },
  label: { color: 'white', fontSize: 18, opacity: 0.8 },
  favContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  favLabel: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  favTitle: {
    color: 'white',
    fontSize: 16,
  },
  favoriteBox: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  favoriteLabel: { color: '#ffd700', fontSize: 14 },
  favoriteTitle: { color: 'white', fontSize: 18, marginTop: 4 },
  pomoBadge: {
    position: 'absolute',
    top: 100,
    right: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  pomoText: { color: 'white', fontSize: 25, fontWeight: 'bold' }
});
