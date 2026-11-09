import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

interface MusicContextType {
  isPlaying: boolean;
  currentTrack: number;
  loadAndPlay: () => Promise<void>;
  pause: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType>({
  isPlaying: false,
  currentTrack: 0,
  loadAndPlay: async () => {},
  pause: async () => {},
  nextTrack: async () => {},
  previousTrack: async () => {},
});

export function useMusic() {
  return useContext(MusicContext);
}

const playlist = [
  require('../assets/music/lofi1.mp3'),
  require('../assets/music/lofi2.mp3'),
  require('../assets/music/lofi3.mp3'),
];

const setGlobalSound = (newSound: Audio.Sound | null) => {
  (globalThis as typeof globalThis & { sound?: Audio.Sound | null }).sound = newSound;
};

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  // O bug do pause vinha daqui: o áudio era controlado via `useState(sound)`,
  // mas várias funções (pause, nextTrack, o cleanup do useEffect) liam esse
  // valor a partir de closures antigas que ainda apontavam para `null` ou
  // para uma faixa já trocada — então `pauseAsync()` às vezes era chamado
  // num objeto de som que não era mais o que estava tocando de fato.
  // Um ref sempre aponta pro som atual, não importa qual closure o lê.
  const soundRef = useRef<Audio.Sound | null>(null);
  const currentTrackRef = useRef(0);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
    });

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  // isPlaying passa a refletir o status real do áudio (status.isPlaying),
  // em vez de um boolean setado manualmente em cada função — assim a UI
  // nunca fica "fora de sincronia" com o que está de fato tocando.
  const attachStatusListener = (soundInstance: Audio.Sound) => {
    soundInstance.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        nextTrack();
      }
    });
  };

  const playTrackAt = async (index: number) => {
    if (soundRef.current) {
      soundRef.current.setOnPlaybackStatusUpdate(null);
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    const { sound: newSound } = await Audio.Sound.createAsync(playlist[index], {
      shouldPlay: true,
      isLooping: false,
    });

    attachStatusListener(newSound);
    soundRef.current = newSound;
    setGlobalSound(newSound);
    setCurrentTrack(index);
  };

  const loadAndPlay = async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      return;
    }
    await playTrackAt(currentTrackRef.current);
  };

  const pause = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
  };

  const nextTrack = async () => {
    const nextIndex = (currentTrackRef.current + 1) % playlist.length;
    await playTrackAt(nextIndex);
  };

  const previousTrack = async () => {
    const prevIndex = (currentTrackRef.current - 1 + playlist.length) % playlist.length;
    await playTrackAt(prevIndex);
  };

  return (
    <MusicContext.Provider
      value={{ isPlaying, loadAndPlay, pause, nextTrack, previousTrack, currentTrack }}
    >
      {children}
    </MusicContext.Provider>
  );
}
