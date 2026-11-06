import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

import { useTractionTheme } from '@/theme';

export default function SplashScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/(auth)/welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image source={require('@/assets/logos/logo-mark.png')} style={styles.logoMark} />

        <Text style={[styles.brandName, { color: theme.colors.text }]}>Traction</Text>
      </Animated.View>

      <View style={styles.indicator}>
        <View style={[styles.indicatorDot, { backgroundColor: theme.colors.surfaceMuted }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 24,
  },
  logoMark: {
    width: 88,
    height: 88,
  },
  brandName: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.02,
  },
  indicator: {
    position: 'absolute',
    bottom: 48,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
