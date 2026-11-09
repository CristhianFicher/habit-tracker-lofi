import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SectionList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import PixelBackground from '../components/PixelBackground';
import { BarChart3, BookOpen, CalendarDays, ChevronLeft, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import PomodoroBadge from '../components/PomodoroBadge';
import { useDiary, DiaryEntry } from '../contexts/DiaryContext';

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Feliz', accent: '#4ADE80' },
  { emoji: '😐', label: 'Neutro', accent: '#94A3B8' },
  { emoji: '😢', label: 'Triste', accent: '#60A5FA' },
  { emoji: '😠', label: 'Bravo', accent: '#F87171' },
  { emoji: '😴', label: 'Cansado', accent: '#C084FC' },
];

const WEEKDAY_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

type PeriodKey = '7d' | '30d' | 'month' | 'all';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: 'month', label: 'Este mês' },
  { key: 'all', label: 'Tudo' },
];

const getMoodAccent = (mood: string) => MOOD_OPTIONS.find(m => m.emoji === mood)?.accent || '#94A3B8';

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const todayKey = () => new Date().toDateString();

const formatSectionTitle = (date: Date) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return 'Hoje';
  if (isSameDay(date, yesterday)) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const isWithinPeriod = (date: Date, period: PeriodKey) => {
  const now = new Date();
  if (period === 'all') return true;
  if (period === 'month') {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }
  const days = period === '7d' ? 7 : 30;
  const cutoff = new Date(now);
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return date.getTime() >= cutoff.getTime();
};

type Section = { key: string; title: string; data: DiaryEntry[] };

export default function DiaryScreen() {
  const { entries, addEntry, deleteEntry } = useDiary();
  const [text, setText] = useState('');
  const [mood, setMood] = useState(MOOD_OPTIONS[0].emoji);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [summaryPeriod, setSummaryPeriod] = useState<PeriodKey>('7d');
  const navigation = useNavigation();

  const toggleDateFilter = () => {
    setShowSummary(false);
    setShowDateFilter(v => !v);
  };

  const toggleSummary = () => {
    setShowDateFilter(false);
    setShowSummary(v => !v);
  };

  // Dias disponíveis no filtro: hoje + qualquer dia que já tenha anotação,
  // do mais recente pro mais antigo.
  const dateOptions = useMemo(() => {
    const keys = new Set<string>();
    keys.add(todayKey());
    entries.forEach(entry => keys.add(new Date(entry.id).toDateString()));
    return Array.from(keys)
      .map(key => new Date(key))
      .sort((a, b) => b.getTime() - a.getTime());
  }, [entries]);

  // Humor que mais se repetiu num dia específico — usado pro pontinho
  // colorido na faixa de datas, pra "ver o humor do dia x" num relance.
  const dominantMoodForDay = (dateKey: string) => {
    const counts: Record<string, number> = {};
    entries.forEach(entry => {
      if (new Date(entry.id).toDateString() === dateKey) {
        counts[entry.mood] = (counts[entry.mood] || 0) + 1;
      }
    });
    let top: string | null = null;
    let topCount = 0;
    Object.entries(counts).forEach(([m, count]) => {
      if (count > topCount) {
        top = m;
        topCount = count;
      }
    });
    return top;
  };

  // Resumo de humor: conta quantas anotações de cada humor caem dentro do
  // período selecionado (7 dias / 30 dias / mês atual / tudo).
  const moodStats = useMemo(() => {
    const counts: Record<string, number> = {};
    MOOD_OPTIONS.forEach(option => {
      counts[option.emoji] = 0;
    });
    let total = 0;
    entries.forEach(entry => {
      if (isWithinPeriod(new Date(entry.id), summaryPeriod)) {
        counts[entry.mood] = (counts[entry.mood] || 0) + 1;
        total += 1;
      }
    });
    return { counts, total };
  }, [entries, summaryPeriod]);

  const dominantMood = useMemo(() => {
    let top: (typeof MOOD_OPTIONS)[number] | null = null;
    let topCount = 0;
    MOOD_OPTIONS.forEach(option => {
      const count = moodStats.counts[option.emoji] || 0;
      if (count > topCount) {
        top = option;
        topCount = count;
      }
    });
    return top;
  }, [moodStats]);

  // entries chega ordenado do mais novo pro mais antigo (addEntry dá prepend).
  const sections = useMemo<Section[]>(() => {
    if (selectedDateKey) {
      const filtered = entries.filter(entry => new Date(entry.id).toDateString() === selectedDateKey);
      return [{ key: selectedDateKey, title: formatSectionTitle(new Date(selectedDateKey)), data: filtered }];
    }

    const groups: Section[] = [];
    entries.forEach(entry => {
      const entryDate = new Date(entry.id);
      const key = entryDate.toDateString();
      let group = groups.find(g => g.key === key);
      if (!group) {
        group = { key, title: formatSectionTitle(entryDate), data: [] };
        groups.push(group);
      }
      group.data.push(entry);
    });
    return groups;
  }, [entries, selectedDateKey]);

  // Escrever uma nova anotação sempre grava com o horário atual — então o
  // composer só faz sentido quando não há filtro ou o filtro é "hoje".
  const showComposer = !selectedDateKey || selectedDateKey === todayKey();

  const handleSave = () => {
    if (!text.trim()) return;
    addEntry(text, mood);
    setText('');
    setMood(MOOD_OPTIONS[0].emoji);
  };

  const confirmDelete = (id: number) => {
    Alert.alert('Excluir anotação', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteEntry(id) },
    ]);
  };

  return (
    <PixelBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ChevronLeft size={22} color="#F8FAFC" />
          </TouchableOpacity>
          <View style={styles.titlePill}>
            <BookOpen size={14} color="#B8C2FF" />
            <Text style={styles.headerText}>Diário</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={toggleDateFilter}
              style={[styles.iconBtn, showDateFilter && styles.iconBtnActive]}
            >
              <CalendarDays size={18} color={showDateFilter ? '#FACC15' : '#F8FAFC'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleSummary} style={[styles.iconBtn, showSummary && styles.iconBtnActive]}>
              <BarChart3 size={18} color={showSummary ? '#FACC15' : '#F8FAFC'} />
            </TouchableOpacity>
          </View>
        </View>

        {showDateFilter && (
          <View style={styles.dateStripWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStrip}>
              <TouchableOpacity
                onPress={() => setSelectedDateKey(null)}
                style={[styles.dateChipAll, selectedDateKey === null && styles.dateChipActive]}
              >
                <Text style={[styles.dateChipAllText, selectedDateKey === null && styles.dateChipTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>

              {dateOptions.map(date => {
                const key = date.toDateString();
                const active = selectedDateKey === key;
                const dominant = dominantMoodForDay(key);
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSelectedDateKey(active ? null : key)}
                    style={[styles.dateChip, active && styles.dateChipActive]}
                  >
                    <Text style={[styles.dateChipWeekday, active && styles.dateChipTextActive]}>
                      {WEEKDAY_SHORT[date.getDay()]}
                    </Text>
                    <Text style={[styles.dateChipDay, active && styles.dateChipTextActive]}>{date.getDate()}</Text>
                    <View
                      style={[
                        styles.dateChipDot,
                        { backgroundColor: dominant ? getMoodAccent(dominant) : 'transparent' },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {showSummary && (
          <View style={styles.summaryPanel}>
            <View style={styles.periodRow}>
              {PERIODS.map(period => {
                const active = summaryPeriod === period.key;
                return (
                  <TouchableOpacity
                    key={period.key}
                    onPress={() => setSummaryPeriod(period.key)}
                    style={[styles.periodChip, active && styles.periodChipActive]}
                  >
                    <Text style={[styles.periodChipText, active && styles.periodChipTextActive]}>{period.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {moodStats.total > 0 ? (
              <>
                <View style={styles.moodStatsList}>
                  {MOOD_OPTIONS.map(option => {
                    const count = moodStats.counts[option.emoji] || 0;
                    const pct = moodStats.total > 0 ? count / moodStats.total : 0;
                    return (
                      <View key={option.emoji} style={styles.moodStatRow}>
                        <Text style={styles.moodStatEmoji}>{option.emoji}</Text>
                        <Text style={styles.moodStatLabel}>{option.label}</Text>
                        <View style={styles.moodStatBarTrack}>
                          <View
                            style={[
                              styles.moodStatBarFill,
                              { width: `${count > 0 ? Math.max(pct * 100, 6) : 0}%`, backgroundColor: option.accent },
                            ]}
                          />
                        </View>
                        <Text style={styles.moodStatCount}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
                <Text style={styles.summaryFooter}>
                  {moodStats.total} {moodStats.total === 1 ? 'registro' : 'registros'}
                  {dominantMood ? ` · Predominante: ${dominantMood.emoji} ${dominantMood.label}` : ''}
                </Text>
              </>
            ) : (
              <Text style={styles.summaryEmpty}>Nenhuma anotação nesse período.</Text>
            )}
          </View>
        )}

        <SectionList
          sections={sections}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.content}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            showComposer ? (
              <View style={styles.editorCard}>
                <Text style={styles.kicker}>Check-in diário</Text>
                <Text style={styles.title}>Como está seu progresso hoje?</Text>
                <Text style={styles.subtitle}>Registre humor, aprendizados e pequenos avanços para revisar depois.</Text>

                <View style={styles.moodRow}>
                  {MOOD_OPTIONS.map(option => {
                    const selected = mood === option.emoji;
                    return (
                      <TouchableOpacity
                        key={option.emoji}
                        onPress={() => setMood(option.emoji)}
                        style={styles.moodOption}
                        activeOpacity={0.75}
                      >
                        <View
                          style={[
                            styles.moodButton,
                            selected && { backgroundColor: `${option.accent}29`, borderColor: option.accent },
                          ]}
                        >
                          <Text style={styles.mood}>{option.emoji}</Text>
                        </View>
                        <Text style={[styles.moodLabel, selected && { color: option.accent }]}>{option.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Digite sua anotação..."
                  placeholderTextColor="rgba(203,213,225,0.58)"
                  value={text}
                  onChangeText={setText}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.button, !text.trim() && styles.buttonDisabled]}
                  onPress={handleSave}
                  activeOpacity={0.84}
                  disabled={!text.trim()}
                >
                  <Text style={styles.buttonText}>Salvar anotação</Text>
                </TouchableOpacity>

                {entries.length > 0 && (
                  <Text style={styles.entryCount}>
                    {entries.length} {entries.length === 1 ? 'anotação registrada' : 'anotações registradas'}
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.historyBanner}>
                <View>
                  <Text style={styles.historyBannerKicker}>Consultando</Text>
                  <Text style={styles.historyBannerTitle}>
                    {selectedDateKey ? formatSectionTitle(new Date(selectedDateKey)) : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedDateKey(null)} activeOpacity={0.75}>
                  <Text style={styles.historyBannerAction}>Ver todos</Text>
                </TouchableOpacity>
              </View>
            )
          }
          renderSectionHeader={({ section }) =>
            selectedDateKey ? null : (
              <View style={styles.sectionHeader}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.sectionLine} />
              </View>
            )
          }
          renderItem={({ item }) => (
            <View style={[styles.entry, { borderLeftColor: getMoodAccent(item.mood) }]}>
              <View style={[styles.moodBadge, { backgroundColor: `${getMoodAccent(item.mood)}22` }]}>
                <Text style={styles.moodBadgeEmoji}>{item.mood}</Text>
              </View>

              <View style={styles.entryBody}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTime}>{formatTime(item.id)}</Text>
                  <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
                    <Trash2 color="#F87171" size={16} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.entryText}>{item.text}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <BookOpen size={28} color="rgba(226,232,240,0.34)" />
              <Text style={styles.emptyText}>
                {selectedDateKey ? 'Nenhuma anotação nesse dia.' : 'Nenhuma anotação salva ainda.'}
              </Text>
              <Text style={styles.emptySubtext}>
                {selectedDateKey ? 'Escolha outro dia no filtro acima.' : 'Escreva o que aconteceu hoje e toque em salvar.'}
              </Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
      <PomodoroBadge />
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    width: '100%',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  iconBtnActive: {
    backgroundColor: 'rgba(250,204,21,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.34)',
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
  headerText: { color: '#E9ECFF', fontSize: 14, letterSpacing: 1.1, textTransform: 'uppercase' },

  dateStripWrapper: {
    marginTop: 14,
    paddingLeft: 20,
  },
  dateStrip: {
    paddingRight: 20,
    gap: 8,
  },
  dateChipAll: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    height: 58,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  dateChipAllText: {
    color: 'rgba(226,232,240,0.68)',
    fontWeight: '700',
    fontSize: 12,
  },
  dateChip: {
    width: 46,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
    gap: 3,
  },
  dateChipActive: {
    backgroundColor: 'rgba(250,204,21,0.16)',
    borderColor: '#FACC15',
  },
  dateChipWeekday: {
    color: 'rgba(226,232,240,0.56)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateChipDay: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  dateChipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dateChipTextActive: {
    color: '#FACC15',
  },

  summaryPanel: {
    marginTop: 14,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(30,41,59,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  periodChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.14)',
  },
  periodChipActive: {
    backgroundColor: 'rgba(250,204,21,0.16)',
    borderColor: '#FACC15',
  },
  periodChipText: {
    color: 'rgba(226,232,240,0.62)',
    fontSize: 11,
    fontWeight: '700',
  },
  periodChipTextActive: {
    color: '#FACC15',
  },
  moodStatsList: {
    gap: 9,
  },
  moodStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodStatEmoji: {
    fontSize: 16,
  },
  moodStatLabel: {
    color: 'rgba(226,232,240,0.68)',
    fontSize: 11,
    fontWeight: '700',
    width: 54,
  },
  moodStatBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  moodStatBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  moodStatCount: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
    width: 18,
    textAlign: 'right',
  },
  summaryFooter: {
    color: 'rgba(226,232,240,0.52)',
    fontSize: 11,
    marginTop: 12,
    textAlign: 'center',
  },
  summaryEmpty: {
    color: 'rgba(226,232,240,0.52)',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 6,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 110,
  },
  editorCard: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    borderRadius: 26,
    padding: 20,
    backgroundColor: 'rgba(15,23,42,0.72)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 22,
    elevation: 8,
    marginBottom: 22,
  },
  kicker: {
    color: '#FACC15',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 6,
  },
  subtitle: {
    color: 'rgba(226,232,240,0.68)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 14,
  },
  moodOption: {
    alignItems: 'center',
    gap: 6,
  },
  moodButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.14)',
  },
  mood: { fontSize: 21 },
  moodLabel: {
    color: 'rgba(203,213,225,0.56)',
    fontSize: 10,
    fontWeight: '700',
  },
  input: {
    minHeight: 100,
    backgroundColor: 'rgba(30,41,59,0.78)',
    color: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    fontSize: 15,
    lineHeight: 21,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  button: {
    backgroundColor: '#FACC15',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#111827',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  entryCount: {
    color: 'rgba(226,232,240,0.52)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },

  historyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: 'rgba(30,41,59,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    marginBottom: 18,
  },
  historyBannerKicker: {
    color: 'rgba(226,232,240,0.52)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  historyBannerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  historyBannerAction: {
    color: '#FACC15',
    fontSize: 13,
    fontWeight: '800',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148,163,184,0.16)',
  },
  sectionTitle: {
    color: '#FACC15',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  entry: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15,23,42,0.62)',
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
    borderLeftWidth: 3,
  },
  moodBadge: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moodBadgeEmoji: { fontSize: 18 },
  entryBody: { flex: 1 },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  entryTime: {
    color: 'rgba(226,232,240,0.52)',
    fontWeight: '700',
    fontSize: 11,
  },
  entryText: {
    color: '#F8FAFC',
    fontSize: 14.5,
    lineHeight: 20,
  },
  deleteBtn: {
    padding: 2,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 36,
    gap: 8,
  },
  emptyText: {
    color: 'rgba(226,232,240,0.72)',
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtext: {
    color: 'rgba(226,232,240,0.46)',
    fontSize: 13,
    textAlign: 'center',
  },
});
