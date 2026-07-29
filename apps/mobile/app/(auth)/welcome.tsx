import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';

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
          <View style={[styles.brandMark, { backgroundColor: theme.colors.primary }]}>
            <View style={styles.logoShape}>
              <View style={styles.logoInner} />
            </View>
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            Execute with intent.
          </Text>

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

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={[styles.featureIcon, { color: theme.colors.accent }]}>🎯</Text>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>Focus Mode</Text>
            <Text style={[styles.featureDescription, { color: theme.colors.textMuted }]}>
              Intelligent distraction filtering powered by your biological rhythm.
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={[styles.featureIcon, { color: theme.colors.accent }]}>📊</Text>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>Deep Metrics</Text>
            <Text style={[styles.featureDescription, { color: theme.colors.textMuted }]}>
              Beyond productivity. Track flow state, energy, and velocity.
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={[styles.featureIcon, { color: theme.colors.accent }]}>✨</Text>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>AI Priority</Text>
            <Text style={[styles.featureDescription, { color: theme.colors.textMuted }]}>
              Dynamic re-prioritization of your stack based on intent.
            </Text>
          </View>
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
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoShape: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  logoInner: {
    position: 'absolute',
    bottom: -1,
    left: -1,
    width: '60%',
    height: '60%',
    backgroundColor: '#3B82F6',
    borderTopRightRadius: 4,
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
    marginBottom: 48,
  },
  features: {
    gap: 24,
  },
  feature: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
});
