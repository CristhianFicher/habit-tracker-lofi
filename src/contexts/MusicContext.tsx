import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

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

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
    });

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadAndPlay = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
      return;
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      playlist[currentTrack],
      { shouldPlay: true, isLooping: false }
    );

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        nextTrack();
      }
    });

    global.sound = newSound;
    setSound(newSound);
    setIsPlaying(true);
  };

  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const nextTrack = async () => {
    if (sound) {
      await sound.unloadAsync();
    }

    const nextIndex = (currentTrack + 1) % playlist.length;
    setCurrentTrack(nextIndex);

    const { sound: newSound } = await Audio.Sound.createAsync(
      playlist[nextIndex],
      { shouldPlay: true, isLooping: false }
    );

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        nextTrack();
      }
    });

    global.sound = newSound;
    setSound(newSound);
    setIsPlaying(true);
  };

  const previousTrack = async () => {
    if (sound) {
      await sound.unloadAsync();
    }

    const prevIndex = (currentTrack - 1 + playlist.length) % playlist.length;
    setCurrentTrack(prevIndex);

    const { sound: newSound } = await Audio.Sound.createAsync(
      playlist[prevIndex],
      { shouldPlay: true, isLooping: false }
    );

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        nextTrack();
      }
    });

    global.sound = newSound;
    setSound(newSound);
    setIsPlaying(true);
  };

  return (
    <MusicContext.Provider
      value={{ isPlaying, loadAndPlay, pause, nextTrack, previousTrack, currentTrack }}
    >
      {children}
    </MusicContext.Provider>
  );
}
