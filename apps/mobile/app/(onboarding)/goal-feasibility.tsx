import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import Button from '@/components/ui/Button';

const TOTAL_STEPS = 6;

export default function OnboardingGoalFeasibilityScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleNext = () => {
    router.replace('/(app)/today');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.colors.accent, width: `${(5 / TOTAL_STEPS) * 100}%` },
              ]}
            />
          </View>
          <Text style={[styles.stepText, { color: theme.colors.textMuted }]}>
            5/{TOTAL_STEPS}
          </Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: theme.colors.successSurface }]}>
            <Text style={styles.successEmoji}>🎯</Text>
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>Great Choice!</Text>

          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            We've analyzed your goal and created a personalized roadmap to help you succeed.
          </Text>

          <View style={[styles.analysisCard, { backgroundColor: theme.colors.surfaceElevated }]}>
            <View style={styles.analysisRow}>
              <Text style={[styles.analysisLabel, { color: theme.colors.textMuted }]}>
                Feasibility
              </Text>
              <Text style={[styles.analysisValue, { color: theme.colors.success }]}>High</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.analysisRow}>
              <Text style={[styles.analysisLabel, { color: theme.colors.textMuted }]}>
                Estimated Timeline
              </Text>
              <Text style={[styles.analysisValue, { color: theme.colors.text }]}>8-12 weeks</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.analysisRow}>
              <Text style={[styles.analysisLabel, { color: theme.colors.textMuted }]}>
                Daily Commitment
              </Text>
              <Text style={[styles.analysisValue, { color: theme.colors.text }]}>30 min</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Button variant="primary" size="lg" onPress={handleNext} style={styles.startButton}>
          Start Your Journey
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '500',
    minWidth: 32,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  successContainer: {
    alignItems: 'center',
    gap: 24,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.02,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  analysisCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisLabel: {
    fontSize: 15,
  },
  analysisValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  startButton: {
    width: '100%',
  },
});
