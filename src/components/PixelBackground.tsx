import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type Props = {
  children: React.ReactNode;
};

function AmbientOrb({
  size,
  color,
  top,
  left,
  duration,
  driftX,
}: {
  size: number;
  color: string;
  top: `${number}%`;
  left: `${number}%`;
  duration: number;
  driftX: number;
}) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [drift, duration]);

  const translateY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 10],
  });

  const translateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-driftX, driftX],
  });

  const opacity = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0.14, 0.24],
  });

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top,
          left,
          opacity,
          transform: [{ translateX }, { translateY }],
        },
      ]}
    />
  );
}

export default function PixelBackground({ children }: Props) {
  const orbs = useMemo<
    Array<{ size: number; color: string; top: `${number}%`; left: `${number}%`; duration: number; driftX: number }>
  >(
    () => [
      { size: 180, color: 'rgba(105,117,255,0.42)', top: '10%', left: '-14%', duration: 7000, driftX: 8 },
      { size: 140, color: 'rgba(46,182,255,0.34)', top: '24%', left: '72%', duration: 7600, driftX: 10 },
      { size: 220, color: 'rgba(129,140,248,0.26)', top: '68%', left: '-20%', duration: 8400, driftX: 6 },
      { size: 130, color: 'rgba(34,211,238,0.24)', top: '80%', left: '70%', duration: 8800, driftX: 7 },
    ],
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.base} />
      <View style={styles.vignette} />
      {orbs.map((orb, index) => (
        <AmbientOrb key={index} {...orb} />
      ))}
      <View style={styles.overlay}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090F1F',
    overflow: 'hidden',
  },
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A1228',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(1,5,20,0.28)',
  },
  orb: {
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    paddingTop: 18,
    backgroundColor: 'rgba(2,8,22,0.18)',
  },
});
