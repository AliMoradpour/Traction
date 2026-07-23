import { useRef, useCallback, useMemo } from 'react';
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
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import {
  useDailyMetrics,
  useBehaviorIndicators,
  useBurnoutRisk,
  useProcrastinationProfile,
  useBehaviorTimeline,
} from '@/hooks/useBehavior';

function ScoreColor(theme: any, score: number, inverted = false): string {
  if (inverted) {
    if (score > 75) return theme.colors.danger;
    if (score > 50) return theme.colors.warning;
    if (score > 25) return theme.colors.warning;
    return theme.colors.success;
  }
  if (score > 70) return theme.colors.success;
  if (score > 40) return theme.colors.warning;
  return theme.colors.danger;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function TrendArrow({ trend, theme }: { trend: string; theme: any }) {
  let symbol = '→';
  let color = theme.colors.textMuted;
  if (trend === 'improving') {
    symbol = '↑';
    color = theme.colors.success;
  } else if (trend === 'worsening') {
    symbol = '↓';
    color = theme.colors.danger;
  }
  return (
    <Text style={[styles.trendArrow, { color }]}>{symbol}</Text>
  );
}

function RiskBadge({ level, theme }: { level: string; theme: any }) {
  let bgColor = theme.colors.successSurface;
  let textColor = theme.colors.successText;
  if (level === 'moderate') {
    bgColor = theme.colors.warningSurface;
    textColor = theme.colors.warningText;
  } else if (level === 'high') {
    bgColor = '#FFF7ED';
    textColor = '#C2410C';
  } else if (level === 'critical') {
    bgColor = theme.colors.dangerSurface;
    textColor = theme.colors.dangerText;
  }
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{level}</Text>
    </View>
  );
}

export default function BehaviorDashboardScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { data: dailyMetrics, isLoading: loadingDaily, refetch: refetchDaily } = useDailyMetrics(today);
  const { data: indicators, isLoading: loadingIndicators, refetch: refetchIndicators } = useBehaviorIndicators();
  const { data: burnout, isLoading: loadingBurnout, refetch: refetchBurnout } = useBurnoutRisk();
  const { data: procrastination, isLoading: loadingProcrastination, refetch: refetchProcrastination } = useProcrastinationProfile();

  const isLoading = loadingDaily || loadingIndicators || loadingBurnout || loadingProcrastination;

  const handleRefresh = useCallback(() => {
    refetchDaily();
    refetchIndicators();
    refetchBurnout();
    refetchProcrastination();
  }, [refetchDaily, refetchIndicators, refetchBurnout, refetchProcrastination]);

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 500,
    useNativeDriver: true,
  }).start();

  const todayDate = new Date();
  const dayName = todayDate.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = todayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const indicatorCards = useMemo(() => {
    if (!indicators) return [];
    return [
      { key: 'consistency', label: 'Consistency', score: indicators.consistencyScore },
      { key: 'execution', label: 'Execution', score: indicators.executionScore },
      { key: 'reliability', label: 'Reliability', score: indicators.reliabilityScore },
      { key: 'planning', label: 'Planning', score: indicators.planningAccuracy },
      { key: 'momentum', label: 'Momentum', score: indicators.momentumScore },
      { key: 'recovery', label: 'Recovery', score: indicators.recoveryScore },
    ];
  }, [indicators]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Behavior Engine</Text>
          <Text style={[styles.headerDate, { color: theme.colors.textMuted }]}>
            {dayName}, {monthDay}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading metrics...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
          }
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Today's Summary */}
            <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>TODAY'S SUMMARY</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    {dailyMetrics?.tasksCompleted ?? 0}
                  </Text>
                  <Text style={[styles.summarySubtext, { color: theme.colors.textMuted }]}>
                    / {dailyMetrics?.tasksPlanned ?? 0} completed
                  </Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: ScoreColor(theme, dailyMetrics?.completionRate ?? 0) },
                    ]}
                  >
                    {dailyMetrics?.completionRate ?? 0}%
                  </Text>
                  <Text style={[styles.summarySubtext, { color: theme.colors.textMuted }]}>completion</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    {dailyMetrics?.focusSessions ?? 0}
                  </Text>
                  <Text style={[styles.summarySubtext, { color: theme.colors.textMuted }]}>
                    {dailyMetrics?.deepWorkMinutes ?? 0}m focus
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Indicators Grid */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Indicators</Text>
            </View>
            <View style={styles.indicatorGrid}>
              {indicatorCards.map((item) => (
                <Pressable
                  key={item.key}
                  style={[styles.indicatorCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                  onPress={() => router.push('/(app)/behavior/indicators' as Href)}
                >
                  <Text
                    style={[
                      styles.indicatorScore,
                      { color: ScoreColor(theme, item.score) },
                    ]}
                  >
                    {item.score}
                  </Text>
                  <Text style={[styles.indicatorLabel, { color: theme.colors.textMuted }]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Burnout Risk Card */}
            <Pressable
              style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              onPress={() => router.push('/(app)/behavior/burnout' as Href)}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>BURNOUT RISK</Text>
                <RiskBadge level={burnout?.level ?? 'low'} theme={theme} />
              </View>
              <View style={styles.burnoutRow}>
                <Text style={[styles.burnoutScore, { color: theme.colors.text }]}>{burnout?.score ?? 0}</Text>
                <View style={styles.burnoutMeta}>
                  <View style={styles.trendRow}>
                    <Text style={[styles.trendLabel, { color: theme.colors.textMuted }]}>Trend</Text>
                    <TrendArrow trend={burnout?.trend ?? 'stable'} theme={theme} />
                  </View>
                </View>
              </View>
            </Pressable>

            {/* Procrastination Card */}
            <Pressable
              style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              onPress={() => router.push('/(app)/behavior/procrastination' as Href)}
            >
              <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>PROCRASTINATION</Text>
              <View style={styles.procrastinationRow}>
                <View style={styles.procrastinationItem}>
                  <Text style={[styles.procrastinationValue, { color: ScoreColor(theme, procrastination?.score ?? 0, true) }]}>
                    {procrastination?.score ?? 0}
                  </Text>
                  <Text style={[styles.procrastinationSubtext, { color: theme.colors.textMuted }]}>score</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.procrastinationItem}>
                  <Text style={[styles.procrastinationValue, { color: theme.colors.text }]}>
                    {procrastination?.frequency?.toFixed(1) ?? '0'}
                  </Text>
                  <Text style={[styles.procrastinationSubtext, { color: theme.colors.textMuted }]}>per week</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.procrastinationItem}>
                  <Text style={[styles.procrastinationPattern, { color: theme.colors.textMuted }]} numberOfLines={1}>
                    {procrastination?.patterns?.[0] ?? 'No patterns'}
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* Coaching Button */}
            <Pressable
              style={[styles.navCard, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
              onPress={() => router.push('/(app)/behavior/coaching' as Href)}
            >
              <Text style={styles.navIcon}>🧠</Text>
              <Text style={[styles.navTitle, { color: '#FFFFFF' }]}>Get Coaching</Text>
              <Text style={[styles.navArrow, { color: '#FFFFFF' }]}>›</Text>
            </Pressable>

            {/* Navigation Cards */}
            <View style={styles.navGrid}>
              <Pressable
                style={[styles.navCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                onPress={() => router.push('/(app)/behavior/daily' as Href)}
              >
                <Text style={styles.navIcon}>📅</Text>
                <Text style={[styles.navTitle, { color: theme.colors.text }]}>Daily Breakdown</Text>
                <Text style={[styles.navArrow, { color: theme.colors.textSubtle }]}>›</Text>
              </Pressable>
              <Pressable
                style={[styles.navCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                onPress={() => router.push('/(app)/behavior/weekly' as Href)}
              >
                <Text style={styles.navIcon}>📊</Text>
                <Text style={[styles.navTitle, { color: theme.colors.text }]}>Weekly Trends</Text>
                <Text style={[styles.navArrow, { color: theme.colors.textSubtle }]}>›</Text>
              </Pressable>
              <Pressable
                style={[styles.navCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                onPress={() => router.push('/(app)/behavior/indicators' as Href)}
              >
                <Text style={styles.navIcon}>📈</Text>
                <Text style={[styles.navTitle, { color: theme.colors.text }]}>All Indicators</Text>
                <Text style={[styles.navArrow, { color: theme.colors.textSubtle }]}>›</Text>
              </Pressable>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerDate: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
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
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  summarySubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 36,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  indicatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  indicatorCard: {
    width: '31%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  indicatorScore: {
    fontSize: 28,
    fontWeight: '700',
  },
  indicatorLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.03,
  },
  burnoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  burnoutScore: {
    fontSize: 48,
    fontWeight: '700',
  },
  burnoutMeta: {
    alignItems: 'flex-end',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  trendArrow: {
    fontSize: 20,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  procrastinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  procrastinationItem: {
    alignItems: 'center',
    flex: 1,
  },
  procrastinationValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  procrastinationSubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  procrastinationPattern: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  navGrid: {
    gap: 8,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  navIcon: {
    fontSize: 22,
  },
  navTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  navArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
});
