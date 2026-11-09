import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMusic } from '../contexts/MusicContext';
import PixelBackground from '../components/PixelBackground';
import { ChevronLeft, Play, Pause, SkipForward, SkipBack, Disc3 } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import PomodoroBadge from '../components/PomodoroBadge';

const TRACK_NAMES = ['Brisa da Manhã', 'Café e Código', 'Pixel Dreams'];
const TRACK_COUNT = TRACK_NAMES.length;

const ROTATION_DURATION_MS = 5200; // uma volta completa do vinil

// Geometria do "palco" da vitrola — tudo posicionado a partir daqui,
// então o braço sempre encontra o disco não importa a largura da tela.
const DISK_SIZE = 168;
const PLATTER_SIZE = DISK_SIZE + 16;
const STAGE_WIDTH = DISK_SIZE + 84;
const STAGE_HEIGHT = DISK_SIZE + 28;
const ARM_LENGTH = 104;
const PIVOT_TOP = 8;
const PIVOT_RIGHT = 14;

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

  const rotation = useRef(new Animated.Value(0)).current;
  const spinLoop = useRef<Animated.CompositeAnimation | null>(null);
  const armAngle = useRef(new Animated.Value(0)).current;

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

  // Braço da vitrola: descansa fora do disco quando pausado,
  // desce e encosta na borda do vinil quando toca.
  useEffect(() => {
    Animated.timing(armAngle, {
      toValue: isPlaying ? 1 : 0,
      duration: 480,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isPlaying, armAngle]);

  // Disco: gira continuamente enquanto toca, mantendo o ângulo ao pausar.
  useEffect(() => {
    if (isPlaying) {
      spinLoop.current = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: ROTATION_DURATION_MS,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      spinLoop.current.start();
    } else {
      spinLoop.current?.stop();
    }
    return () => spinLoop.current?.stop();
  }, [isPlaying, rotation]);

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

  const getTrackName = () => TRACK_NAMES[currentTrack] || 'Faixa Desconhecida';

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const diskRotation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 0 = braço descansando à direita, fora do disco.
  // 1 = braço girado para a esquerda, agulha encostada na borda do vinil.
  const armRotation = armAngle.interpolate({
    inputRange: [0, 1],
    outputRange: ['12deg', '-34deg'],
  });

  return (
    <PixelBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} activeOpacity={0.7}>
          <ChevronLeft size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.titlePill}>
          <Disc3 size={14} color="#B8C2FF" />
          <Text style={styles.headerText}>Música Lo-fi</Text>
        </View>
        <View style={styles.iconBtnPlaceholder} />
      </View>

      <View style={styles.container}>
        <View style={styles.playerCard}>
          {/* Vitrola */}
          <View style={styles.turntable}>
            <View style={styles.turntableSheen} pointerEvents="none" />

            <View style={styles.stage}>
              {/* Prato metálico embaixo do vinil — gradiente de verdade,
                  não mais uma cor sólida, pra parecer metal escovado */}
              <LinearGradient
                colors={['#565D68', '#2C3138', '#14161A']}
                start={{ x: 0.15, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.platter}
              >
                <View style={styles.platterRim} />
              </LinearGradient>

              <TouchableOpacity activeOpacity={0.86} onPress={togglePlay} style={styles.diskTouchArea}>
                <Animated.View style={[styles.disk, { transform: [{ rotate: diskRotation }] }]}>
                  <View style={[styles.groove, styles.grooveDark, { width: DISK_SIZE - 20, height: DISK_SIZE - 20 }]} />
                  <View style={[styles.groove, styles.grooveLight, { width: DISK_SIZE - 34, height: DISK_SIZE - 34 }]} />
                  <View style={[styles.groove, styles.grooveDark, { width: DISK_SIZE - 48, height: DISK_SIZE - 48 }]} />
                  <View style={[styles.groove, styles.grooveLight, { width: DISK_SIZE - 62, height: DISK_SIZE - 62 }]} />
                  <LinearGradient
                    colors={['#FDE68A', '#FACC15', '#B8860B']}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.85, y: 1 }}
                    style={styles.diskLabel}
                  >
                    <Text style={styles.diskLabelText}>{String(currentTrack + 1).padStart(2, '0')}</Text>
                  </LinearGradient>
                  <View style={styles.diskSpindle} />
                </Animated.View>

                {/* Brilho fixo (não gira com o disco), simula reflexo de luz vindo de cima */}
                <LinearGradient
                  pointerEvents="none"
                  colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']}
                  start={{ x: 0.15, y: 0 }}
                  end={{ x: 0.7, y: 0.9 }}
                  style={styles.diskShine}
                />
              </TouchableOpacity>

              {/* Braço + agulha, ancorados no pino de verdade */}
              <View style={styles.tonearmMount}>
                <Animated.View style={[styles.tonearmPivot, { transform: [{ rotate: armRotation }] }]}>
                  <View style={styles.tonearmShadowLayer} />
                  <LinearGradient
                    colors={['#F1F3F6', '#B7BEC9', '#8B93A0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tonearm}
                  />
                  <LinearGradient
                    colors={['#B0B7C2', '#7C8492', '#5B6270']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headshell}
                  />
                  <View style={styles.stylus} />
                </Animated.View>
                <LinearGradient
                  colors={['#6B5236', '#3A2D1F']}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.9, y: 1 }}
                  style={styles.tonearmMountCap}
                />
              </View>
            </View>
          </View>

          <Text style={styles.kicker}>{isPlaying ? 'Tocando agora' : 'Em pausa'}</Text>
          <Text style={styles.trackTitle}>{getTrackName()}</Text>
          <Text style={styles.trackInfo}>
            Faixa {currentTrack + 1} de {TRACK_COUNT} · Lo-fi focus mix
          </Text>

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
            <TouchableOpacity onPress={previousTrack} style={styles.secondaryControl} activeOpacity={0.75}>
              <SkipBack size={26} color="#F8FAFC" />
            </TouchableOpacity>

            <TouchableOpacity onPress={togglePlay} style={styles.primaryControl} activeOpacity={0.85}>
              {isPlaying ? <Pause size={32} color="#111827" /> : <Play size={32} color="#111827" style={styles.playIcon} />}
            </TouchableOpacity>

            <TouchableOpacity onPress={nextTrack} style={styles.secondaryControl} activeOpacity={0.75}>
              <SkipForward size={26} color="#F8FAFC" />
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
    paddingTop: 28,
    paddingBottom: 26,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.72)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 8,
  },

  // --- Vitrola ---
  turntable: {
    width: '100%',
    minHeight: STAGE_HEIGHT + 30,
    borderRadius: 26,
    backgroundColor: '#241B14',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    overflow: 'hidden',
  },
  turntableSheen: {
    position: 'absolute',
    top: -40,
    left: -30,
    width: '70%',
    height: 90,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    transform: [{ rotate: '-8deg' }],
  },
  stage: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
  },

  platter: {
    position: 'absolute',
    left: 0,
    top: (STAGE_HEIGHT - PLATTER_SIZE) / 2,
    width: PLATTER_SIZE,
    height: PLATTER_SIZE,
    borderRadius: PLATTER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  platterRim: {
    width: PLATTER_SIZE - 6,
    height: PLATTER_SIZE - 6,
    borderRadius: (PLATTER_SIZE - 6) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },

  diskTouchArea: {
    position: 'absolute',
    left: (PLATTER_SIZE - DISK_SIZE) / 2,
    top: (STAGE_HEIGHT - DISK_SIZE) / 2,
    width: DISK_SIZE,
    height: DISK_SIZE,
    borderRadius: DISK_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disk: {
    width: DISK_SIZE,
    height: DISK_SIZE,
    borderRadius: DISK_SIZE / 2,
    backgroundColor: '#15171B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#050608',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  diskShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DISK_SIZE,
    height: DISK_SIZE,
    borderRadius: DISK_SIZE / 2,
  },
  groove: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  grooveDark: {
    borderColor: 'rgba(0,0,0,0.55)',
  },
  grooveLight: {
    borderColor: 'rgba(255,255,255,0.07)',
  },
  diskLabel: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#8A6508',
  },
  diskLabelText: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 15,
  },
  diskSpindle: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#6B7280',
  },

  tonearmMount: {
    position: 'absolute',
    top: PIVOT_TOP,
    right: PIVOT_RIGHT,
    width: 0,
    height: 0,
  },
  tonearmMountCap: {
    position: 'absolute',
    top: -9,
    left: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  // Ponto (0,0) = pivô real. O braço nasce aqui e desce, então a
  // rotação acontece em torno do pino — não do meio da barra.
  tonearmPivot: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 6,
    height: ARM_LENGTH,
  },
  tonearmShadowLayer: {
    position: 'absolute',
    top: 2,
    left: -1,
    width: 8,
    height: ARM_LENGTH - 14,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  tonearm: {
    position: 'absolute',
    top: 0,
    left: -2,
    width: 6,
    height: ARM_LENGTH - 14,
    borderRadius: 3,
  },
  headshell: {
    position: 'absolute',
    top: ARM_LENGTH - 18,
    left: -6,
    width: 12,
    height: 16,
    borderRadius: 4,
  },
  stylus: {
    position: 'absolute',
    top: ARM_LENGTH - 4,
    left: -1.5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FACC15',
  },

  kicker: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  trackTitle: {
    fontSize: 25,
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
    marginBottom: 20,
    textAlign: 'center',
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
    backgroundColor: '#FACC15',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  playIcon: {
    marginLeft: 3,
  },
  secondaryControl: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
});
