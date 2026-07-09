import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
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
    <View style={[styles.container, { backgroundColor: '#0F172A' }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoMark}>
          <View style={styles.logoShape}>
            <View style={styles.logoInner} />
          </View>
        </View>
        <Text style={styles.brandName}>Traction</Text>
      </Animated.View>

      <View style={styles.indicator}>
        <View style={styles.indicatorDot} />
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
    width: 48,
    height: 48,
  },
  logoShape: {
    width: '100%',
    height: '100%',
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoInner: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: '60%',
    height: '60%',
    backgroundColor: '#3B82F6',
    borderTopRightRadius: 8,
  },
  brandName: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
