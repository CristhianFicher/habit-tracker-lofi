import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, Circle, Star, Trash2 } from 'lucide-react-native';

type Props = {
  title: string;
  done: boolean;
  onToggle: () => void;
  isFavorite: boolean;
  onFavorite: () => void;
  onDelete: () => void;
};

export default function HabitCard({
  title,
  done,
  onToggle,
  isFavorite,
  onFavorite,
  onDelete,
}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onToggle}>
        {done ? (
          <CheckCircle color="#4CAF50" size={24} />
        ) : (
          <Circle color="#FFFFFF" size={24} />
        )}
      </TouchableOpacity>

      <Text style={[styles.title, done && styles.doneText]}>
        {title || 'Nova tarefa'}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onFavorite} style={styles.iconButton}>
          <Star
            size={20}
            color={isFavorite ? '#FFD700' : '#FFFFFF'}
            fill={isFavorite ? '#FFD700' : 'transparent'}
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
          <Trash2 size={20} color="#FF5252" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    zIndex: 2,
    includeFontPadding: false,
    marginHorizontal: 12,
  },
  doneText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
});