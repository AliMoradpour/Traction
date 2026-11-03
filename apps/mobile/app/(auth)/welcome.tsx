import { Link } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { useTractionTheme } from '@/theme';

export default function WelcomeScreen() {
  const theme = useTractionTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Image
            source={require('@/assets/logos/logo-mark.png')}
            style={styles.brandMark}
            accessibilityLabel="Traction"
          />

          <Text style={[styles.title, { color: theme.colors.text }]}>Execute with intent.</Text>

          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            The behavioral operating system for meaningful work.
          </Text>
        </Animated.View>

        <View style={styles.actions}>
          <Link href="/(auth)/register" asChild>
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </Link>

          <Link href="/(auth)/login" asChild>
            <Button variant="secondary" size="lg">
              Sign In
            </Button>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  brandMark: {
    width: 72,
    height: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.02,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  actions: {
    gap: 12,
  },
});
