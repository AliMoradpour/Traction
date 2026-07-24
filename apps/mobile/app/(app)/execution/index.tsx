import { useRef, useCallback } from 'react';
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
import { useReadinessScore, useMomentum, useResistance, useExecutionStats } from '@/hooks/useExecution';

function TrendArrow({ trend, theme }: { trend: string; theme: any }) {
  let symbol = '→';
  let color = theme.colors.textMuted;
  if (trend === 'improving') {
    symbol = '↑';
    color = theme.colors.success;
  } else if (trend === 'declining') {
    symbol = '↓';
    color = theme.colors.danger;
  }
  return <Text style={[styles.trendArrow, { color }]}>{symbol}</Text>;
}

function ReadinessGauge({ score, theme }: { score: number; theme: any }) {
  const color =
    score >= 70 ? theme.colors.success : score >= 40 ? theme.colors.warning : theme.colors.danger;
  return (
    <View style={[styles.gauge, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
      <Text style={[styles.gaugeLabel, { color: theme.colors.textMuted }]}>READINESS</Text>
      <Text style={[styles.gaugeValue, { color }]}>{score}%</Text>
    </View>
  );
}

export default function ExecutionDashboardScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: readiness, isLoading: loadingReadiness, refetch: refetchReadiness } = useReadinessScore();
  const { data: momentum, isLoading: loadingMomentum, refetch: refetchMomentum } = useMomentum();
  const { data: resistance, isLoading: loadingResistance, refetch: refetchResistance } = useResistance();
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useExecutionStats();

  const isLoading = loadingReadiness || loadingMomentum || loadingResistance || loadingStats;

  const handleRefresh = useCallback(() => {
    refetchReadiness();
    refetchMomentum();
    refetchResistance();
    refetchStats();
  }, [refetchReadiness, refetchMomentum, refetchResistance, refetchStats]);

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 500,
    useNativeDriver: true,
  }).start();

  const todayDate = new Date();
  const dayName = todayDate.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = todayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Execution Engine</Text>
          <Text style={[styles.headerDate, { color: theme.colors.textMuted }]}>
            {dayName}, {monthDay}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
          }
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Readiness */}
            <ReadinessGauge score={readiness?.score ?? 0} theme={theme} />
            {readiness && (
              <Text style={[styles.readinessText, { color: theme.colors.textMuted, marginTop: 8, marginBottom: 16 }]}>
                {readiness.explanation}
              </Text>
            )}

            {/* Momentum + Resistance row */}
            <View style={styles.row}>
              <Pressable
                style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                onPress={() => router.push('/(app)/execution/momentum' as Href)}
              >
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>MOMENTUM</Text>
                <View style={styles.statValueRow}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{momentum?.currentStreak ?? 0}</Text>
                  <TrendArrow trend={momentum?.trend ?? 'stable'} theme={theme} />
                </View>
                <Text style={[styles.statSubtext, { color: theme.colors.textMuted }]}>day streak</Text>
              </Pressable>

              <Pressable
                style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                onPress={() => router.push('/(app)/execution/resistance' as Href)}
              >
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>RESISTANCE</Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: (resistance?.score ?? 0) > 50 ? theme.colors.danger : theme.colors.success },
                  ]}
                >
                  {resistance?.score ?? 0}
                </Text>
                <Text style={[styles.statSubtext, { color: theme.colors.textMuted }]}>resistance level</Text>
              </Pressable>
            </View>

            {/* Focus Time + Stats */}
            <View style={styles.row}>
              <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>FOCUS TODAY</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats?.focusTime.today ?? 0}m
                </Text>
                <Text style={[styles.statSubtext, { color: theme.colors.textMuted }]}>this week: {stats?.focusTime.thisWeek ?? 0}m</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>COMPLETED</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {stats?.tasksCompleted.today ?? 0}
                </Text>
                <Text style={[styles.statSubtext, { color: theme.colors.textMuted }]}>tasks today</Text>
              </View>
            </View>

            {/* Reliability + Planning */}
            <View style={styles.row}>
              <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>RELIABILITY</Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: (stats?.completionReliability ?? 0) >= 70 ? theme.colors.success : theme.colors.warning },
                  ]}
                >
                  {stats?.completionReliability ?? 0}%
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>PLANNING</Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: (stats?.planningAccuracy ?? 0) >= 70 ? theme.colors.success : theme.colors.warning },
                  ]}
                >
                  {stats?.planningAccuracy ?? 0}%
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Pressable
                style={[styles.actionCard, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/(app)/today/smart-start' as Href)}
              >
                <Text style={styles.actionIcon}>⚡</Text>
                <Text style={[styles.actionTitle, { color: '#FFFFFF' }]}>Smart Start</Text>
              </Pressable>
              <Pressable
                style={[styles.actionCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                onPress={() => router.push('/(app)/today' as Href)}
              >
                <Text style={styles.actionIcon}>▶</Text>
                <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Start Focus</Text>
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
  gauge: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  gaugeLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  gaugeValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  readinessText: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statSubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  trendArrow: {
    fontSize: 20,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
});
