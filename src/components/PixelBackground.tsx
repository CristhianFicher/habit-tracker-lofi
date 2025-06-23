import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { useMusic } from '../contexts/MusicContext';

const videos = [
  require('../assets/backgrounds/bg1.mp4'),
  require('../assets/backgrounds/bg2.mp4'),
  require('../assets/backgrounds/bg3.mp4'),
];

export default function PixelBackground({ children }: { children: React.ReactNode }) {
  const { currentTrack } = useMusic();

  return (
    <View style={styles.container}>
      <Video
        source={videos[currentTrack % videos.length]}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.overlay}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', 
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: 60,
  },
});
