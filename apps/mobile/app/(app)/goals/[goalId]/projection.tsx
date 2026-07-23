import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useGoal, useGoalProjection } from '@/hooks/useGoals';
import { ProgressBar } from '@/components/ui/ProgressBar';

function daysBetween(a: string, b: string): number {
  const dA = new Date(a);
  const dB = new Date(b);
  dA.setHours(0, 0, 0, 0);
  dB.setHours(0, 0, 0, 0);
  return Math.round((dB.getTime() - dA.getTime()) / (1000 * 60 * 60 * 24));
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

interface ProjectionMetrics {
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
  expectedProgress: number;
  currentPace: number;
  requiredPace: number;
  projectedCompletionDate: string | null;
  projectedDaysFromNow: number | null;
  onTrack: boolean;
  weeklyPace: number;
  requiredWeeklyPace: number;
  paceIncreaseNeeded: number;
  daysAhead: number;
  hasTargetDate: boolean;
}

function computeMetrics(
  progress: number,
  startDate: string,
  targetDate?: string | null,
): ProjectionMetrics {
  const today = todayStr();
  const daysElapsed = Math.max(1, daysBetween(startDate, today));
  const hasTargetDate = !!targetDate;

  if (!hasTargetDate) {
    return {
      daysElapsed,
      daysRemaining: 0,
      totalDays: 0,
      expectedProgress: 0,
      currentPace: 0,
      requiredPace: 0,
      projectedCompletionDate: null,
      projectedDaysFromNow: null,
      onTrack: true,
      weeklyPace: 0,
      requiredWeeklyPace: 0,
      paceIncreaseNeeded: 0,
      daysAhead: 0,
      hasTargetDate: false,
    };
  }

  const daysRemaining = Math.max(0, daysBetween(today, targetDate!));
  const totalDays = Math.max(1, daysBetween(startDate, targetDate!));
  const expectedProgress = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
  const currentPace = progress / daysElapsed;
  const requiredPace = daysRemaining > 0 ? (100 - progress) / daysRemaining : 0;
  const onTrack = currentPace >= requiredPace;
  const weeklyPace = currentPace * 7;
  const requiredWeeklyPace = requiredPace * 7;

  let projectedCompletionDate: string | null = null;
  let projectedDaysFromNow: number | null = null;
  let daysAhead = 0;
  let paceIncreaseNeeded = 0;

  if (currentPace > 0) {
    const daysToComplete = (100 - progress) / currentPace;
    const projDate = addDays(new Date(), daysToComplete);
    projectedCompletionDate = projDate.toISOString().split('T')[0];
    projectedDaysFromNow = Math.round(daysToComplete);
    daysAhead = daysRemaining - Math.round(daysToComplete);
  }

  if (!onTrack && requiredPace > 0) {
    paceIncreaseNeeded = Math.round(((requiredPace - currentPace) / currentPace) * 100);
  }

  return {
    daysElapsed,
    daysRemaining,
    totalDays,
    expectedProgress,
    currentPace,
    requiredPace,
    projectedCompletionDate,
    projectedDaysFromNow,
    onTrack,
    weeklyPace,
    requiredWeeklyPace,
    paceIncreaseNeeded,
    daysAhead,
    hasTargetDate: true,
  };
}

function AnimatedBar({
  actual,
  expected,
  theme,
  animValue,
}: {
  actual: number;
  expected: number;
  theme: ReturnType<typeof useTractionTheme>;
  animValue: Animated.Value;
}) {
  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, []);

  const actualWidth = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${actual}%`],
  });
  const expectedWidth = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${expected}%`],
  });

  return (
    <View style={styles.dualBarContainer}>
      <View style={styles.dualBarTrack}>
        <Animated.View
          style={[
            styles.dualBarExpected,
            { width: expectedWidth, backgroundColor: theme.colors.surfaceMuted },
          ]}
        />
        <Animated.View
          style={[
            styles.dualBarActual,
            { width: actualWidth, backgroundColor: theme.colors.accent },
          ]}
        />
      </View>
      <View style={styles.dualBarLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.accent }]} />
          <Text style={[styles.legendText, { color: theme.colors.textMuted }]}>Actual ({actual}%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.surfaceMuted }]} />
          <Text style={[styles.legendText, { color: theme.colors.textMuted }]}>Expected ({expected}%)</Text>
        </View>
      </View>
    </View>
  );
}

export default function GoalProjectionScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const animValue = useRef(new Animated.Value(0)).current;

  const { data: goal, isLoading: goalLoading } = useGoal(goalId || '');
  const { data: projection } = useGoalProjection(goalId || '');

  const isLoading = goalLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.backBtn, { color: theme.colors.primary }]}>Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Projection</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>Goal not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const m = computeMetrics(goal.progress, goal.startDate, goal.targetDate);
  const healthColor = m.onTrack ? '#10B981' : '#EF4444';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backBtn, { color: theme.colors.primary }]}>Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Projection</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: m.onTrack ? theme.colors.successSurface : theme.colors.dangerSurface }]}>
          <View style={[styles.heroIcon, { backgroundColor: healthColor + '20' }]}>
            <Text style={[styles.heroIconText, { color: healthColor }]}>
              {m.onTrack ? '\u2713' : '!'}
            </Text>
          </View>
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
            {m.onTrack ? 'On Track' : 'Needs Attention'}
          </Text>
          {m.hasTargetDate ? (
            <Text style={[styles.heroDays, { color: healthColor }]}>
              {m.daysRemaining > 0 ? `${m.daysRemaining} days remaining` : 'Target date passed'}
            </Text>
          ) : (
            <Text style={[styles.heroDays, { color: theme.colors.textMuted }]}>
              Set a target date to enable projections
            </Text>
          )}
          <View style={styles.heroProgressRow}>
            <Text style={[styles.heroProgressLabel, { color: theme.colors.textMuted }]}>
              {goal.progress}% done
            </Text>
            <Text style={[styles.heroProgressLabel, { color: theme.colors.textMuted }]}>
              {m.hasTargetDate ? `${m.expectedProgress}% expected` : 'No target'}
            </Text>
          </View>
          <ProgressBar
            value={goal.progress}
            tone={m.onTrack ? 'success' : 'warning'}
            height={10}
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Days Elapsed</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{m.daysElapsed}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Days Remaining</Text>
            <Text style={[styles.statValue, { color: m.daysRemaining < 0 ? theme.colors.danger : theme.colors.text }]}>
              {m.hasTargetDate ? m.daysRemaining : '\u2014'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Current Pace</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {m.currentPace > 0 ? `${(m.currentPace * 7).toFixed(1)}%/wk` : '\u2014'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Required Pace</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {m.hasTargetDate && m.requiredWeeklyPace > 0 ? `${m.requiredWeeklyPace.toFixed(1)}%/wk` : '\u2014'}
            </Text>
          </View>
        </View>

        {/* Visual Progress Comparison */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Progress vs Expected</Text>
          <AnimatedBar
            actual={goal.progress}
            expected={m.expectedProgress}
            theme={theme}
            animValue={animValue}
          />
        </View>

        {/* Forecast Card */}
        {m.hasTargetDate && (
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Forecast</Text>
            {m.projectedCompletionDate ? (
              <>
                <View style={styles.forecastRow}>
                  <Text style={[styles.forecastLabel, { color: theme.colors.textMuted }]}>Projected completion</Text>
                  <Text style={[styles.forecastValue, { color: theme.colors.text }]}>
                    {formatDate(m.projectedCompletionDate)}
                  </Text>
                </View>
                {m.projectedDaysFromNow !== null && (
                  <View style={styles.forecastRow}>
                    <Text style={[styles.forecastLabel, { color: theme.colors.textMuted }]}>Days from now</Text>
                    <Text style={[styles.forecastValue, { color: theme.colors.text }]}>
                      {m.projectedDaysFromNow} days
                    </Text>
                  </View>
                )}
                {m.daysAhead > 0 ? (
                  <View style={[styles.forecastBanner, { backgroundColor: theme.colors.successSurface }]}>
                    <Text style={[styles.forecastBannerText, { color: theme.colors.successText }]}>
                      You're ahead of schedule by {m.daysAhead} days
                    </Text>
                  </View>
                ) : m.daysAhead < 0 ? (
                  <View style={[styles.forecastBanner, { backgroundColor: theme.colors.dangerSurface }]}>
                    <Text style={[styles.forecastBannerText, { color: theme.colors.dangerText }]}>
                      You need to increase your pace by {m.paceIncreaseNeeded}% to hit the target
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.forecastBanner, { backgroundColor: theme.colors.successSurface }]}>
                    <Text style={[styles.forecastBannerText, { color: theme.colors.successText }]}>
                      Right on track to hit your target
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={[styles.forecastText, { color: theme.colors.textMuted }]}>
                Not enough data to project a completion date
              </Text>
            )}
          </View>
        )}

        {/* Recommendation Card */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recommendation</Text>
          {!m.hasTargetDate ? (
            <Text style={[styles.recommendText, { color: theme.colors.textMuted }]}>
              Set a target date to enable projections and personalized recommendations.
            </Text>
          ) : m.onTrack ? (
            <Text style={[styles.recommendText, { color: theme.colors.textMuted }]}>
              Great progress! Maintain your current pace of {(m.weeklyPace).toFixed(1)}% per week to stay on track.
            </Text>
          ) : m.paceIncreaseNeeded > 0 ? (
            <Text style={[styles.recommendText, { color: theme.colors.textMuted }]}>
              Increase your weekly effort by {m.paceIncreaseNeeded}% to meet your target.
              Currently at {(m.weeklyPace).toFixed(1)}%/wk, need {m.requiredWeeklyPace.toFixed(1)}%/wk.
            </Text>
          ) : (
            <Text style={[styles.recommendText, { color: theme.colors.textMuted }]}>
              Target date has passed. Consider updating your target date or adjusting your goal.
            </Text>
          )}
        </View>

        {/* Timeline Context */}
        {m.hasTargetDate && (
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Timeline</Text>
            <View style={styles.timelineRow}>
              <View style={styles.timelineItem}>
                <Text style={[styles.timelineLabel, { color: theme.colors.textSubtle }]}>Start</Text>
                <Text style={[styles.timelineValue, { color: theme.colors.text }]}>
                  {formatDate(goal.startDate)}
                </Text>
              </View>
              <Text style={[styles.timelineArrow, { color: theme.colors.textSubtle }]}>{'\u2192'}</Text>
              <View style={styles.timelineItem}>
                <Text style={[styles.timelineLabel, { color: theme.colors.textSubtle }]}>Target</Text>
                <Text style={[styles.timelineValue, { color: theme.colors.text }]}>
                  {formatDate(goal.targetDate)}
                </Text>
              </View>
            </View>
            <View style={styles.timelineBar}>
              <View style={[styles.timelineProgress, { width: `${m.expectedProgress}%`, backgroundColor: theme.colors.surfaceMuted }]} />
              <View style={[styles.timelineActual, { width: `${Math.min(100, goal.progress)}%`, backgroundColor: theme.colors.accent }]} />
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 16,
  },
  backBtn: {
    fontSize: 15,
    fontWeight: '500',
    minWidth: 50,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 17,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroIconText: {
    fontSize: 24,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  heroDays: {
    fontSize: 15,
    fontWeight: '600',
  },
  heroProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  heroProgressLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  dualBarContainer: {
    gap: 8,
  },
  dualBarTrack: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  dualBarExpected: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 6,
  },
  dualBarActual: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 6,
  },
  dualBarLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forecastLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  forecastValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  forecastBanner: {
    padding: 12,
    borderRadius: 8,
  },
  forecastBannerText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  forecastText: {
    fontSize: 14,
    lineHeight: 22,
  },
  recommendText: {
    fontSize: 14,
    lineHeight: 22,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineItem: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  timelineArrow: {
    fontSize: 18,
    marginTop: 12,
  },
  timelineBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 8,
  },
  timelineProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 3,
  },
  timelineActual: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 3,
  },
});
