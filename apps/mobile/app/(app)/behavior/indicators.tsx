import { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useBehaviorIndicators } from '@/hooks/useBehavior';

function ScoreColor(theme: any, score: number): string {
  if (score > 70) return theme.colors.success;
  if (score > 40) return theme.colors.warning;
  return theme.colors.danger;
}

const INDICATOR_INFO = [
  {
    key: 'consistencyScore' as const,
    label: 'Consistency Score',
    description: 'Percentage of days with recorded activity over the tracking period.',
  },
  {
    key: 'executionScore' as const,
    label: 'Execution Score',
    description: 'Percentage of scheduled tasks that were completed.',
  },
  {
    key: 'reliabilityScore' as const,
    label: 'Reliability Score',
    description: 'Percentage of completed tasks that were finished on time.',
  },
  {
    key: 'planningAccuracy' as const,
    label: 'Planning Accuracy',
    description: 'Percentage of scheduled tasks completed on or before the scheduled time.',
  },
  {
    key: 'momentumScore' as const,
    label: 'Momentum Score',
    description: 'Weighted recent completion rate reflecting your current trajectory.',
  },
  {
    key: 'recoveryScore' as const,
    label: 'Recovery Score',
    description: 'How well you bounce back from behind-schedule tasks.',
  },
];

function AnimatedProgressBar({ score, theme }: { score: number; theme: any }) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: score,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [score, animValue]);

  const width = animValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.progressBarBg, { backgroundColor: theme.colors.surfaceMuted }]}>
      <Animated.View
        style={[
          styles.progressBarFill,
          {
            width: width as any,
            backgroundColor: ScoreColor(theme, score),
          },
        ]}
      />
    </View>
  );
}

export default function IndicatorsScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { data: indicators, isLoading } = useBehaviorIndicators();

  const indicatorData = useMemo(() => {
    if (!indicators) return [];
    return INDICATOR_INFO.map((info) => ({
      ...info,
      score: indicators[info.key],
    }));
  }, [indicators]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backArrow, { color: theme.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>All Indicators</Text>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading indicators...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {indicatorData.map((item) => (
            <View
              key={item.key}
              style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardLabel, { color: theme.colors.text }]}>{item.label}</Text>
                <Text style={[styles.cardScore, { color: ScoreColor(theme, item.score) }]}>{item.score}</Text>
              </View>
              <AnimatedProgressBar score={item.score} theme={theme} />
              <Text style={[styles.cardDescription, { color: theme.colors.textMuted }]}>{item.description}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '300',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  cardScore: {
    fontSize: 28,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
