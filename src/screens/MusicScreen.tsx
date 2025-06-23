import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMusic } from '../contexts/MusicContext';
import PixelBackground from '../components/PixelBackground';
import { ChevronLeft, Play, Pause, SkipForward, SkipBack } from 'lucide-react-native';
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Música Lofi</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.trackTitle}>{getTrackName()}</Text>

        
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={progress}
          onValueChange={setProgress}
          onSlidingComplete={seekTo}
          minimumTrackTintColor="#FFD700"
          maximumTrackTintColor="#888"
          thumbTintColor="transparent" 
        />

        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(progress)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={previousTrack}>
            <SkipBack size={40} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlay} style={{ marginHorizontal: 30 }}>
            {isPlaying ? (
              <Pause size={48} color="white" />
            ) : (
              <Play size={48} color="white" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={nextTrack}>
            <SkipForward size={40} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.trackInfo}>Faixa {currentTrack + 1} de 3</Text>
        <Equalizer isPlaying={isPlaying} />
      </View>
      <PomodoroBadge />
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  trackTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  time: {
    color: 'white',
    fontSize: 12,
    opacity: 0.7,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  trackInfo: {
    fontSize: 14,
    color: 'white',
    opacity: 0.7,
    marginTop: 6,
  },
});
