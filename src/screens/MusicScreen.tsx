import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMusic } from '../contexts/MusicContext';
import PixelBackground from '../components/PixelBackground';
import { ChevronLeft, Play, Pause, SkipForward, SkipBack, Music2, Radio } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import Equalizer from '../components/Equalizer';
import PomodoroBadge from '../components/PomodoroBadge';

export default function MusicScreen() {
  const navigation = useNavigation();
  const {
    isPlaying,
    loadAndPlay,
    pause,
    nextTrack,
    previousTrack,
    currentTrack,
  } = useMusic();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    const interval = setInterval(async () => {
      const g = global as any;
      if (g.sound) {
        const status = await g.sound.getStatusAsync();
        if (status.isLoaded) {
          setProgress(status.positionMillis || 0);
          setDuration(status.durationMillis || 1);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    isPlaying ? pause() : loadAndPlay();
  };

  const seekTo = async (millis: number) => {
    const g = global as any;
    if (g.sound) {
      try {
        await g.sound.setPositionAsync(millis);
        setProgress(millis);
      } catch (e) {
        console.warn('Erro ao pular para:', millis);
      }
    }
  };

  const getTrackName = () => {
    return ['Brisa da Manhã', 'Café e Código', 'Pixel Dreams'][currentTrack] || 'Faixa Desconhecida';
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <PixelBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.titlePill}>
          <Music2 size={14} color="#B8C2FF" />
          <Text style={styles.headerText}>Música Lo-fi</Text>
        </View>
        <View style={styles.iconBtnPlaceholder} />
      </View>

      <View style={styles.container}>
        <View style={styles.playerCard}>
          <View style={styles.albumArt}>
            <View style={styles.albumGlow} />
            <Radio size={52} color="#DDE7FF" strokeWidth={1.5} />
            <Equalizer isPlaying={isPlaying} />
          </View>

          <Text style={styles.kicker}>Tocando agora</Text>
          <Text style={styles.trackTitle}>{getTrackName()}</Text>
          <Text style={styles.trackInfo}>Faixa {currentTrack + 1} de 3 · Lo-fi focus mix</Text>

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={progress}
            onValueChange={setProgress}
            onSlidingComplete={seekTo}
            minimumTrackTintColor="#FACC15"
            maximumTrackTintColor="rgba(148,163,184,0.36)"
            thumbTintColor="#F8FAFC"
          />

          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatTime(progress)}</Text>
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={previousTrack} style={styles.secondaryControl}>
              <SkipBack size={28} color="#F8FAFC" />
            </TouchableOpacity>

            <TouchableOpacity onPress={togglePlay} style={styles.primaryControl}>
              {isPlaying ? <Pause size={34} color="#FFFFFF" /> : <Play size={34} color="#FFFFFF" />}
            </TouchableOpacity>

            <TouchableOpacity onPress={nextTrack} style={styles.secondaryControl}>
              <SkipForward size={28} color="#F8FAFC" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <PomodoroBadge />
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
  iconBtnPlaceholder: { width: 38, height: 38 },
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
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingBottom: 36,
  },
  playerCard: {
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.22)',
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.72)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 8,
  },
  albumArt: {
    width: 188,
    height: 188,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(59,130,246,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.16)',
    marginBottom: 24,
  },
  albumGlow: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(250,204,21,0.14)',
  },
  kicker: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  trackTitle: {
    fontSize: 26,
    color: '#F8FAFC',
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 8,
    textAlign: 'center',
  },
  trackInfo: {
    fontSize: 13,
    color: 'rgba(203,213,225,0.72)',
    marginTop: 6,
    marginBottom: 18,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  time: {
    color: 'rgba(226,232,240,0.72)',
    fontSize: 12,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  primaryControl: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#626BFF',
  },
  secondaryControl: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
});
