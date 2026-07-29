import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useWeeklyMetrics } from '@/hooks/useBehavior';
import { Button } from '@/components/ui/Button';

function startOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(weekStart + 'T00:00:00');
  end.setDate(end.getDate() + 6);
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startStr} – ${endStr}`;
}

function getDayLabel(dayOffset: number): string {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days[dayOffset];
}

export default function WeeklyMetricsScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(startOfWeek(todayStr()));

  const { data: metrics, isLoading, isError, refetch } = useWeeklyMetrics(weekStart);

  const isCurrentWeek = weekStart === startOfWeek(todayStr());

  const handlePrevWeek = useCallback(() => {
    setWeekStart((prev) => addDays(prev, -7));
  }, []);

  const handleNextWeek = useCallback(() => {
    setWeekStart((prev) => addDays(prev, 7));
  }, []);

  const dayIndicators = useMemo(() => {
    if (!metrics) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = addDays(weekStart, i);
      const isPastOrToday = dayDate <= todayStr();
      return {
        label: getDayLabel(i),
        active: isPastOrToday && metrics.consistency > 0,
      };
    });
  }, [metrics, weekStart]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backArrow, { color: theme.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Weekly Trends</Text>
        <View style={styles.backButton} />
      </View>

      {/* Week Selector */}
      <View style={[styles.weekSelector, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
        <Pressable style={styles.dateArrow} onPress={handlePrevWeek}>
          <Text style={[styles.arrowText, { color: theme.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <View style={styles.weekInfo}>
          <Text style={[styles.weekRange, { color: theme.colors.text }]}>{formatWeekRange(weekStart)}</Text>
          {isCurrentWeek && (
            <View style={[styles.currentBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.currentBadgeText}>This Week</Text>
            </View>
          )}
        </View>
        <Pressable
          style={[styles.dateArrow, isCurrentWeek && styles.dateArrowDisabled]}
          onPress={handleNextWeek}
          disabled={isCurrentWeek}
        >
          <Text style={[styles.arrowText, { color: isCurrentWeek ? theme.colors.disabled : theme.colors.text }]}>
            {'›'}
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>
            Failed to load data
          </Text>
          <Button variant="secondary" onPress={() => refetch()} style={{ marginTop: 12 }}>
            Retry
          </Button>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Consistency */}
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>CONSISTENCY</Text>
            <View style={styles.consistencyRow}>
              <Text style={[styles.consistencyValue, { color: theme.colors.text }]}>{metrics?.consistency ?? 0}%</Text>
              <View style={styles.consistencyBarContainer}>
                <View style={[styles.consistencyBarBg, { backgroundColor: theme.colors.surfaceMuted }]}>
                  <View
                    style={[
                      styles.consistencyBarFill,
                      {
                        backgroundColor:
                          (metrics?.consistency ?? 0) > 70
                            ? theme.colors.success
                            : (metrics?.consistency ?? 0) > 40
                            ? theme.colors.warning
                            : theme.colors.danger,
                        width: `${Math.min(100, metrics?.consistency ?? 0)}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Completion Stats */}
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>COMPLETION STATS</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.success }]}>{metrics?.weeklyCompletion ?? 0}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>completed</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: (metrics?.missedTasks ?? 0) > 0 ? theme.colors.danger : theme.colors.text }]}>
                  {metrics?.missedTasks ?? 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>missed</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: (metrics?.delayedTasks ?? 0) > 0 ? theme.colors.warning : theme.colors.text }]}>
                  {metrics?.delayedTasks ?? 0}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>delayed</Text>
              </View>
            </View>
          </View>

          {/* Planning Accuracy & Output */}
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>ACCURACY & OUTPUT</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{metrics?.planningAccuracy ?? 0}%</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>planning accuracy</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{metrics?.averageDailyOutput?.toFixed(1) ?? '0.0'}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>avg daily output</Text>
              </View>
            </View>
          </View>

          {/* 7-Day Grid */}
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>7-DAY ACTIVITY</Text>
            <View style={styles.dayGrid}>
              {dayIndicators.map((day, i) => (
                <View key={i} style={styles.dayItem}>
                  <View
                    style={[
                      styles.dayDot,
                      { backgroundColor: day.active ? theme.colors.success : theme.colors.disabled },
                    ]}
                  />
                  <Text style={[styles.dayLabel, { color: theme.colors.textMuted }]}>{day.label}</Text>
                </View>
              ))}
            </View>
          </View>
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
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateArrow: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateArrowDisabled: {
    opacity: 0.4,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: '300',
  },
  weekInfo: {
    alignItems: 'center',
    gap: 4,
  },
  weekRange: {
    fontSize: 15,
    fontWeight: '600',
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
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
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 12,
  },
  consistencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  consistencyValue: {
    fontSize: 36,
    fontWeight: '700',
    minWidth: 80,
  },
  consistencyBarContainer: {
    flex: 1,
  },
  consistencyBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  consistencyBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  dayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    gap: 6,
  },
  dayDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
