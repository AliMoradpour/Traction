import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { type TractionTheme, useTractionTheme } from '@/theme';

export default function WelcomeScreen() {
  const theme = useTractionTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.hero, { opacity: fadeAnim }]}>
        <View style={styles.logoWrap}>
          <Image
            source={require('@/assets/logos/logo-mark.png')}
            style={styles.logo}
            accessibilityLabel="Traction"
          />
        </View>
        <Text style={styles.title}>One step at a time.</Text>
        <Text style={styles.subtitle}>Traction helps you start the work that matters, without the overwhelm.</Text>
      </Animated.View>

      <View style={styles.actions}>
        <Button variant="primary" size="lg" onPress={() => router.push('/(auth)/register')}>
          Get started
        </Button>
        <Button variant="ghost" size="lg" onPress={() => router.push('/(auth)/login')}>
          I already have an account
        </Button>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: TractionTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 24,
      paddingBottom: 16,
    },
    hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    logoWrap: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
    },
    logo: { width: 62, height: 62 },
    title: { ...theme.typography.displayLg, color: theme.colors.text, textAlign: 'center' },
    subtitle: {
      ...theme.typography.bodyLg,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginTop: 12,
      paddingHorizontal: 12,
    },
    actions: { gap: 8 },
  });
}
