import { useRef } from 'react';
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
import { useMomentum, useExecutionStats } from '@/hooks/useExecution';

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

export default function MomentumScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: momentum, isLoading: loadingMomentum, refetch: refetchMomentum } = useMomentum();
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useExecutionStats();

  const isLoading = loadingMomentum || loadingStats;

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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Momentum</Text>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => { refetchMomentum(); refetchStats(); }} tintColor={theme.colors.primary} />
          }
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Trend */}
            <View style={[styles.trendCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <Text style={[styles.trendLabel, { color: theme.colors.textMuted }]}>OVERALL TREND</Text>
              <View style={styles.trendRow}>
                <TrendArrow trend={momentum?.trend ?? 'stable'} theme={theme} />
                <Text style={[styles.trendText, { color: theme.colors.text }]}>
                  {(momentum?.trend ?? 'stable').charAt(0).toUpperCase() + (momentum?.trend ?? 'stable').slice(1)}
                </Text>
              </View>
            </View>

            {/* Streaks */}
            <View style={styles.streaksRow}>
              <View style={[styles.streakCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.streakLabel, { color: theme.colors.textMuted }]}>CURRENT</Text>
                <Text style={[styles.streakValue, { color: theme.colors.text }]}>{momentum?.currentStreak ?? 0}</Text>
                <Text style={[styles.streakUnit, { color: theme.colors.textMuted }]}>days</Text>
              </View>
              <View style={[styles.streakCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.streakLabel, { color: theme.colors.textMuted }]}>EXECUTION</Text>
                <Text style={[styles.streakValue, { color: theme.colors.success }]}>{momentum?.executionStreak ?? 0}</Text>
                <Text style={[styles.streakUnit, { color: theme.colors.textMuted }]}>days</Text>
              </View>
              <View style={[styles.streakCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.streakLabel, { color: theme.colors.textMuted }]}>RECOVERY</Text>
                <Text style={[styles.streakValue, { color: theme.colors.accent }]}>{momentum?.recoveryStreak ?? 0}</Text>
                <Text style={[styles.streakUnit, { color: theme.colors.textMuted }]}>days</Text>
              </View>
            </View>

            {/* Weekly / Monthly */}
            <View style={styles.comparisonRow}>
              <View style={[styles.comparisonCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.comparisonLabel, { color: theme.colors.textMuted }]}>WEEKLY MOMENTUM</Text>
                <Text style={[styles.comparisonValue, { color: theme.colors.text }]}>{momentum?.weeklyMomentum ?? 0}</Text>
              </View>
              <View style={[styles.comparisonCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.comparisonLabel, { color: theme.colors.textMuted }]}>MONTHLY MOMENTUM</Text>
                <Text style={[styles.comparisonValue, { color: theme.colors.text }]}>{momentum?.monthlyMomentum ?? 0}</Text>
              </View>
            </View>

            {/* Focus Time Stats */}
            {stats && (
              <View style={[styles.statsCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.statsLabel, { color: theme.colors.textMuted }]}>FOCUS TIME</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statsItem}>
                    <Text style={[styles.statsValue, { color: theme.colors.text }]}>{stats.focusTime.today}m</Text>
                    <Text style={[styles.statsSubtext, { color: theme.colors.textMuted }]}>Today</Text>
                  </View>
                  <View style={[styles.statsDivider, { backgroundColor: theme.colors.border }]} />
                  <View style={styles.statsItem}>
                    <Text style={[styles.statsValue, { color: theme.colors.text }]}>{stats.focusTime.thisWeek}m</Text>
                    <Text style={[styles.statsSubtext, { color: theme.colors.textMuted }]}>This Week</Text>
                  </View>
                  <View style={[styles.statsDivider, { backgroundColor: theme.colors.border }]} />
                  <View style={styles.statsItem}>
                    <Text style={[styles.statsValue, { color: theme.colors.text }]}>{stats.focusTime.allTime}m</Text>
                    <Text style={[styles.statsSubtext, { color: theme.colors.textMuted }]}>All Time</Text>
                  </View>
                </View>
              </View>
            )}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  trendCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  trendLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendArrow: {
    fontSize: 28,
    fontWeight: '600',
  },
  trendText: {
    fontSize: 20,
    fontWeight: '600',
  },
  streaksRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  streakCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  streakUnit: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  comparisonCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  statsLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statsItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statsSubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  statsDivider: {
    width: 1,
    height: 36,
  },
});
