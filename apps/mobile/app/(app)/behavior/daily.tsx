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
import { useDailyMetrics } from '@/hooks/useBehavior';
import { Button } from '@/components/ui/Button';

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyMetricsScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const { data: metrics, isLoading, isError, refetch } = useDailyMetrics(selectedDate);

  const isToday = selectedDate === todayStr();

  const handlePrevDay = useCallback(() => {
    setSelectedDate((prev) => addDays(prev, -1));
  }, []);

  const handleNextDay = useCallback(() => {
    setSelectedDate((prev) => addDays(prev, 1));
  }, []);

  const hasData = metrics && (metrics.tasksPlanned > 0 || metrics.focusSessions > 0 || metrics.eventsCount > 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backArrow, { color: theme.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Daily Breakdown</Text>
        <View style={styles.backButton} />
      </View>

      {/* Date Picker */}
      <View style={[styles.datePicker, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
        <Pressable style={styles.dateArrow} onPress={handlePrevDay}>
          <Text style={[styles.arrowText, { color: theme.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <View style={styles.dateInfo}>
          <Text style={[styles.dateText, { color: theme.colors.text }]}>{formatDateDisplay(selectedDate)}</Text>
          {isToday && (
            <View style={[styles.todayBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.todayText}>Today</Text>
            </View>
          )}
        </View>
        <Pressable
          style={[styles.dateArrow, isToday && styles.dateArrowDisabled]}
          onPress={handleNextDay}
          disabled={isToday}
        >
          <Text style={[styles.arrowText, { color: isToday ? theme.colors.disabled : theme.colors.text }]}>
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
      ) : !hasData ? (
        <View style={styles.centerContent}>
          <Text style={[styles.emptyIcon, { color: theme.colors.textMuted }]}>📋</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No activity recorded</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            No tasks, focus sessions, or events for this day.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Tasks */}
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>TASKS</Text>
            <View style={styles.tasksVisual}>
              <View style={styles.tasksBarContainer}>
                <View style={[styles.tasksBarBg, { backgroundColor: theme.colors.surfaceMuted }]}>
                  <View
                    style={[
                      styles.tasksBarFill,
                      {
                        backgroundColor: theme.colors.primary,
                        width: `${Math.min(100, metrics.completionRate)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.tasksBarLabel, { color: theme.colors.textMuted }]}>
                  {metrics.tasksCompleted} / {metrics.tasksPlanned}
                </Text>
              </View>
              <Text
                style={[
                  styles.completionRate,
                  { color: metrics.completionRate > 70 ? theme.colors.success : metrics.completionRate > 40 ? theme.colors.warning : theme.colors.danger },
                ]}
              >
                {metrics.completionRate}%
              </Text>
            </View>
          </View>

          {/* Delays */}
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>DELAYS</Text>
            <View style={styles.delaysRow}>
              <View style={styles.delayItem}>
                <Text style={[styles.delayValue, { color: theme.colors.text }]}>{metrics.averageStartDelay}</Text>
                <Text style={[styles.delayLabel, { color: theme.colors.textMuted }]}>avg start delay (min)</Text>
              </View>
              <View style={[styles.delayDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.delayItem}>
                <Text style={[styles.delayValue, { color: theme.colors.text }]}>{metrics.averageCompletionDelay}</Text>
                <Text style={[styles.delayLabel, { color: theme.colors.textMuted }]}>avg completion delay (min)</Text>
              </View>
            </View>
          </View>

          {/* Focus */}
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>FOCUS</Text>
            <View style={styles.delaysRow}>
              <View style={styles.delayItem}>
                <Text style={[styles.delayValue, { color: theme.colors.text }]}>{metrics.deepWorkMinutes}</Text>
                <Text style={[styles.delayLabel, { color: theme.colors.textMuted }]}>deep work (min)</Text>
              </View>
              <View style={[styles.delayDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.delayItem}>
                <Text style={[styles.delayValue, { color: theme.colors.text }]}>{metrics.focusSessions}</Text>
                <Text style={[styles.delayLabel, { color: theme.colors.textMuted }]}>sessions</Text>
              </View>
              <View style={[styles.delayDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.delayItem}>
                <Text style={[styles.delayValue, { color: theme.colors.text }]}>{metrics.eventsCount}</Text>
                <Text style={[styles.delayLabel, { color: theme.colors.textMuted }]}>events</Text>
              </View>
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
  datePicker: {
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
  dateInfo: {
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayText: {
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
    paddingHorizontal: 40,
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
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
  tasksVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tasksBarContainer: {
    flex: 1,
    gap: 6,
  },
  tasksBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tasksBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tasksBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  completionRate: {
    fontSize: 32,
    fontWeight: '700',
  },
  delaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  delayItem: {
    alignItems: 'center',
    flex: 1,
  },
  delayValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  delayLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  delayDivider: {
    width: 1,
    height: 36,
  },
});
