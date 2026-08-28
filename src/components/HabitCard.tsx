import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarDays, CheckCircle, Circle, Pencil, Star, Trash2 } from 'lucide-react-native';

type Props = {
  title: string;
  done: boolean;
  createdAt?: string;
  endDate?: string;
  onToggle: () => void;
  isFavorite: boolean;
  onFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const formatDisplayDate = (date?: string) => {
  if (!date) return 'Sem prazo';

  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
};

export default function HabitCard({
  title,
  done,
  createdAt,
  endDate,
  onToggle,
  isFavorite,
  onFavorite,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
        {done ? (
          <CheckCircle color="#4ADE80" size={24} />
        ) : (
          <Circle color="#DDE7FF" size={24} />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, done && styles.doneText]}>
          {title || 'Nova tarefa'}
        </Text>

        <View style={styles.dateRow}>
          <View style={styles.dateChip}>
            <CalendarDays size={12} color="rgba(226,232,240,0.72)" />
            <Text style={styles.dateText}>Cadastro: {formatDisplayDate(createdAt)}</Text>
          </View>
          <View style={[styles.dateChip, endDate ? styles.deadlineChip : styles.openDeadlineChip]}>
            <Text style={[styles.dateText, endDate && styles.deadlineText]}>
              Término: {formatDisplayDate(endDate)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onFavorite} style={styles.iconButton}>
          <Star
            size={19}
            color={isFavorite ? '#FACC15' : '#DDE7FF'}
            fill={isFavorite ? '#FACC15' : 'transparent'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
          <Pencil size={18} color="#93C5FD" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
          <Trash2 size={19} color="#F87171" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15,23,42,0.62)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
  },
  toggleButton: {
    paddingTop: 2,
  },
  content: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    color: '#EEF2FF',
    fontSize: 16,
    fontWeight: '700',
    includeFontPadding: false,
  },
  doneText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  deadlineChip: {
    backgroundColor: 'rgba(250,204,21,0.14)',
  },
  openDeadlineChip: {
    backgroundColor: 'rgba(148,163,184,0.10)',
  },
  dateText: {
    color: 'rgba(226,232,240,0.72)',
    fontSize: 11,
    fontWeight: '700',
  },
  deadlineText: {
    color: '#FACC15',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    padding: 4,
  },
});
