import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface EqualizerProps {
  isPlaying: boolean;
}

export default function Equalizer({ isPlaying }: EqualizerProps) {
  const bars = Array.from({ length: 5 }, () => useRef(new Animated.Value(10)).current);

  useEffect(() => {
    let isMounted = true;

    const animateBars = () => {
      if (!isMounted || !isPlaying) return;

      const animations = bars.map((bar) =>
        Animated.sequence([
          Animated.timing(bar, {
            toValue: Math.random() * 40 + 10,
            duration: 250,
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: 10,
            duration: 250,
            useNativeDriver: false,
          }),
        ])
      );

      Animated.parallel(animations).start(() => animateBars());
    };

    if (isPlaying) animateBars();

    return () => {
      isMounted = false;
    };
  }, [isPlaying]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {bars.map((bar, index) => (
          <Animated.View key={index} style={[styles.bar, { height: bar }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 50, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-end',
  },
  bar: {
    width: 6,
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
});
