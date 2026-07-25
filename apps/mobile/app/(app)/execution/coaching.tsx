import { useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useReadinessScore, useResistance, useMomentum } from '@/hooks/useExecution';

interface CoachingRecommendation {
  category: 'resistance' | 'readiness' | 'momentum' | 'optimal';
  title: string;
  icon: string;
  summary: string;
  suggestions: { label: string; detail: string }[];
  metric: string;
}

function ScoreBadge({ score, label, theme }: { score: number; label: string; theme: any }) {
  const color =
    score >= 70 ? theme.colors.success : score >= 40 ? theme.colors.warning : theme.colors.danger;
  return (
    <View style={[styles.scoreBadge, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
      <Text style={[styles.scoreBadgeLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.scoreBadgeValue, { color }]}>{score}</Text>
    </View>
  );
}

function RecommendationCard({ rec, theme }: { rec: CoachingRecommendation; theme: any }) {
  const [expanded, setExpanded] = useState(false);
  const borderColor =
    rec.category === 'resistance'
      ? theme.colors.error
      : rec.category === 'readiness'
      ? theme.colors.warning
      : rec.category === 'momentum'
      ? theme.colors.primary
      : theme.colors.success;

  return (
    <View style={[styles.recCard, { backgroundColor: theme.colors.surfaceElevated, borderColor }]}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <View style={styles.recHeader}>
          <Text style={styles.recIcon}>{rec.icon}</Text>
          <View style={styles.recTitleSection}>
            <Text style={[styles.recTitle, { color: theme.colors.text }]}>{rec.title}</Text>
            <Text style={[styles.recMetric, { color: theme.colors.textMuted }]}>{rec.metric}</Text>
          </View>
          <Text style={[styles.expandIcon, { color: theme.colors.textMuted }]}>{expanded ? '▲' : '▼'}</Text>
        </View>
        <Text style={[styles.recSummary, { color: theme.colors.textMuted }]}>{rec.summary}</Text>
      </Pressable>
      {expanded && (
        <View style={[styles.suggestionsSection, { borderTopColor: theme.colors.border }]}>
          {rec.suggestions.map((s, i) => (
            <View key={i} style={[styles.suggestionItem, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.suggestionLabel, { color: theme.colors.text }]}>{s.label}</Text>
              <Text style={[styles.suggestionDetail, { color: theme.colors.textMuted }]}>{s.detail}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function CoachingScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: readiness, isLoading: loadingReadiness, refetch: refetchReadiness } = useReadinessScore();
  const { data: resistance, isLoading: loadingResistance, refetch: refetchResistance } = useResistance();
  const { data: momentum, isLoading: loadingMomentum, refetch: refetchMomentum } = useMomentum();

  const isLoading = loadingReadiness || loadingResistance || loadingMomentum;

  const handleRefresh = () => {
    refetchReadiness();
    refetchResistance();
    refetchMomentum();
  };

  const readinessScore = readiness?.score ?? 50;
  const resistanceScore = resistance?.score ?? 50;
  const currentStreak = momentum?.currentStreak ?? 0;
  const trend = momentum?.trend ?? 'stable';

  const recommendations = useMemo<CoachingRecommendation[]>(() => {
    const recs: CoachingRecommendation[] = [];

    if (resistanceScore > 60) {
      const patterns: string[] = [];
      if (readinessScore < 40) patterns.push('low energy state');
      if (trend === 'declining') patterns.push('declining momentum');
      if (currentStreak < 3) patterns.push('short streak');
      const patternStr = patterns.length > 0 ? `Patterns: ${patterns.join(', ')}.` : '';

      recs.push({
        category: 'resistance',
        title: 'High Resistance Detected',
        icon: '🔴',
        summary: `Your resistance level is ${resistanceScore}/100. ${patternStr} This suggests friction is blocking your progress.`,
        metric: `Resistance: ${resistanceScore}/100`,
        suggestions: [
          {
            label: 'Break this task into smaller steps',
            detail: `With resistance at ${resistanceScore}, your brain is perceiving the task as too large. Split it into 3 tiny sub-steps and commit to just the first one.`,
          },
          {
            label: 'Try a shorter focus session',
            detail: `Your readiness is ${readinessScore}/100. A 15-minute session reduces the commitment barrier while still building momentum.`,
          },
          {
            label: 'Switch to an easier task first',
            detail: 'Complete one quick win to build momentum before returning to this challenging task.',
          },
          {
            label: 'Take a 5-minute break',
            detail: 'Step away, move your body, then return with fresh eyes. Resistance often drops after a brief reset.',
          },
        ],
      });
    }

    if (readinessScore < 40) {
      const factors: string[] = [];
      if (currentStreak < 3) factors.push('short streak');
      if (trend === 'declining') factors.push('declining momentum');
      if (resistanceScore > 50) factors.push('elevated resistance');
      const factorStr = factors.length > 0 ? `Likely causes: ${factors.join(', ')}.` : '';

      recs.push({
        category: 'readiness',
        title: 'Low Readiness',
        icon: '🟡',
        summary: `Your readiness is ${readinessScore}/100. ${factorStr} This means your capacity for focused work is limited right now.`,
        metric: `Readiness: ${readinessScore}/100`,
        suggestions: [
          {
            label: 'Start with a quick win',
            detail: 'Pick a 2-5 minute task you can complete immediately. Completing something small rebuilds your sense of capability.',
          },
          {
            label: 'Consider rescheduling deep work',
            detail: `With readiness at ${readinessScore}, now may not be the best time for cognitively demanding tasks. Move them to your peak energy window.`,
          },
        ],
      });
    }

    if (trend === 'declining') {
      recs.push({
        category: 'momentum',
        title: 'Momentum Declining',
        icon: '📉',
        summary: `Your momentum trend is declining. Current streak: ${currentStreak} day${currentStreak !== 1 ? 's' : ''}. Declining momentum often precedes procrastination.`,
        metric: `Streak: ${currentStreak} days`,
        suggestions: [
          {
            label: 'Complete one small task right now',
            detail: 'Any completed task, no matter how small, interrupts the declining pattern and starts rebuilding momentum.',
          },
        ],
      });
    }

    if (recs.length === 0) {
      recs.push({
        category: 'optimal',
        title: "You're in the zone",
        icon: '🟢',
        summary: `Readiness: ${readinessScore}/100, Resistance: ${resistanceScore}/100, Streak: ${currentStreak} days. Your execution metrics are solid — this is the time to tackle your hardest task.`,
        metric: 'All systems go',
        suggestions: [
          {
            label: 'Tackle your hardest task now',
            detail: `With readiness at ${readinessScore} and resistance at ${resistanceScore}, your cognitive resources are at their peak. Use this window for high-value work.`,
          },
          {
            label: 'Extend your focus session',
            detail: 'Consider a 45-60 minute deep work session while your metrics are optimal.',
          },
        ],
      });
    }

    return recs;
  }, [readinessScore, resistanceScore, currentStreak, trend]);

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 500,
    useNativeDriver: true,
  }).start();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backArrow, { color: theme.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Execution Coach</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Analyzing your execution...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.metricsRow}>
              <ScoreBadge score={readiness?.score ?? 0} label="READINESS" theme={theme} />
              <ScoreBadge score={resistance?.score ?? 0} label="RESISTANCE" theme={theme} />
              <ScoreBadge score={currentStreak} label="STREAK" theme={theme} />
            </View>

            {recommendations.map((rec, i) => (
              <RecommendationCard key={`${rec.category}-${i}`} rec={rec} theme={theme} />
            ))}

            <Pressable
              style={[styles.refreshButton, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              onPress={handleRefresh}
            >
              <Text style={[styles.refreshButtonText, { color: theme.colors.primary }]}>↻ Refresh Analysis</Text>
            </Pressable>
          </Animated.View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '300',
    marginTop: -4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  scoreBadge: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  scoreBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 6,
  },
  scoreBadgeValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  recCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    marginBottom: 12,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recIcon: {
    fontSize: 24,
  },
  recTitleSection: {
    flex: 1,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  recMetric: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 12,
  },
  recSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  suggestionsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  suggestionItem: {
    padding: 12,
    borderRadius: 10,
  },
  suggestionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionDetail: {
    fontSize: 13,
    lineHeight: 18,
  },
  refreshButton: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
