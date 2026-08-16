import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import PixelBackground from '../components/PixelBackground';
import { CheckSquare, Timer, Music2, BookOpen, BadgeQuestionMarkIcon, ArrowUpRight, Sparkles } from 'lucide-react-native';
import { useHabitContext } from '../contexts/HabitContext';
import { usePomodoro } from '../contexts/PomodoroContext';
import PomodoroBadge from '../components/PomodoroBadge';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

type MenuItem = {
  title: string;
  description: string;
  route: keyof RootStackParamList;
  icon: React.ElementType;
};

const menuItems: MenuItem[] = [
  {
    title: 'Tasks Diárias',
    description: 'Organize seus hábitos e prioridades',
    route: 'Tasks',
    icon: CheckSquare,
  },
  {
    title: 'Pomodoro',
    description: 'Sessões de foco com pausas leves',
    route: 'Pomodoro',
    icon: Timer,
  },
  {
    title: 'Música Lo-fi',
    description: 'Ambientes sonoros para estudar',
    route: 'Music',
    icon: Music2,
  },
  {
    title: 'Diário',
    description: 'Registre pensamentos e progresso',
    route: 'Diary',
    icon: BookOpen,
  },
  {
    title: 'Configurações',
    description: 'Ajuste sua experiência no app',
    route: 'Settings',
    icon: BadgeQuestionMarkIcon,
  },
];

export default function HomeScreen({ navigation }: Props) {
  const { habits, favoriteId } = useHabitContext();
  const favoriteHabit = habits.find(habit => habit.id === favoriteId);
  const { secondsLeft, isRunning } = usePomodoro();

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60).toString().padStart(2, '0');
    const seconds = (sec % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <PixelBackground>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.eyebrowRow}>
            <Sparkles size={15} color="#FACC15" />
            <Text style={styles.eyebrow}>Habit Tracker Lo-fi</Text>
          </View>

          <Text style={styles.title}>Seu espaço de foco diário</Text>
          <Text style={styles.subtitle}>
            Planeje tarefas, acompanhe o Pomodoro e mantenha o ritmo com uma interface mais calma e profissional.
          </Text>

          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <Text style={styles.statusValue}>{habits.length}</Text>
              <Text style={styles.statusLabel}>hábitos</Text>
            </View>

            <View style={styles.statusCard}>
              <Text style={styles.statusValue}>{isRunning ? formatTime(secondsLeft) : '25:00'}</Text>
              <Text style={styles.statusLabel}>{isRunning ? 'em foco' : 'pomodoro'}</Text>
            </View>
          </View>
        </View>

        {favoriteHabit && (
          <TouchableOpacity style={styles.favoriteCard} onPress={() => navigation.navigate('Tasks')} activeOpacity={0.82}>
            <View>
              <Text style={styles.favoriteLabel}>Favorito do dia</Text>
              <Text style={styles.favoriteTitle}>{favoriteHabit.title}</Text>
            </View>
            <ArrowUpRight size={18} color="#F8FAFC" />
          </TouchableOpacity>
        )}

        <View style={styles.menu}>
          {menuItems.map(item => {
            const Icon = item.icon;

            return (
              <TouchableOpacity
                key={item.route}
                style={styles.menuCard}
                onPress={() => navigation.navigate(item.route)}
                activeOpacity={0.82}
              >
                <View style={styles.iconContainer}>
                  <Icon color="#DDE7FF" size={24} strokeWidth={1.9} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <ArrowUpRight size={18} color="rgba(226,232,240,0.72)" />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <PomodoroBadge />
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 54,
    paddingBottom: 30,
  },
  heroCard: {
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
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  eyebrow: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: 'rgba(226,232,240,0.76)',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  statusCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(30,41,59,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  statusLabel: {
    color: 'rgba(203,213,225,0.72)',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 22,
    padding: 18,
    marginTop: 16,
    backgroundColor: 'rgba(250,204,21,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.26)',
  },
  favoriteLabel: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  favoriteTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 5,
  },
  menu: {
    gap: 12,
    marginTop: 18,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    padding: 14,
    backgroundColor: 'rgba(15,23,42,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59,130,246,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.16)',
  },
  menuContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  menuTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  menuDescription: {
    color: 'rgba(203,213,225,0.66)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
});
