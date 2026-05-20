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
}: {
  size: number;
  color: string;
  top: `${number}%`;
  left: `${number}%`;
  duration: number;
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
    outputRange: [-10, 12],
  });

  const opacity = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.5],
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
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

export default function PixelBackground({ children }: Props) {
  const orbs = useMemo<Array<{ size: number; color: string; top: `${number}%`; left: `${number}%`; duration: number }>>(
    () => [
      { size: 220, color: 'rgba(88,101,242,0.45)', top: '8%', left: '-10%', duration: 6200 },
      { size: 180, color: 'rgba(0,200,255,0.24)', top: '24%', left: '70%', duration: 7000 },
      { size: 260, color: 'rgba(167,139,250,0.2)', top: '62%', left: '-18%', duration: 7600 },
      { size: 180, color: 'rgba(34,197,94,0.16)', top: '78%', left: '68%', duration: 8200 },
    ],
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.gradientBase} />
      {orbs.map((orb, index) => (
        <AmbientOrb key={index} {...orb} />
      ))}
      <View style={styles.grain} />
      <View style={styles.overlay}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
    overflow: 'hidden',
  },
  gradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  orb: {
    position: 'absolute',
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    paddingTop: 60,
  },
});
