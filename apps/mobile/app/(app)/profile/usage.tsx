import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useUsageSummary, useUsageByFeature, useUsageByDay } from '@/hooks/useAI';

export default function UsageScreen() {
  const theme = useTractionTheme();
  const { data: summary, isLoading: summaryLoading } = useUsageSummary();
  const { data: byFeature, isLoading: featureLoading } = useUsageByFeature();
  const { data: byDay, isLoading: dayLoading } = useUsageByDay(7);

  const isLoading = summaryLoading || featureLoading || dayLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>AI Usage</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Track your AI feature usage</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{summary?.dailyRequests ?? 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Today</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{summary?.monthlyRequests ?? 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>This Month</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>${summary?.estimatedCost?.toFixed(2) ?? '0.00'}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Est. Cost</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{formatTokens(summary?.totalTokens ?? 0)}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Tokens</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Usage by Feature</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            {byFeature && byFeature.length > 0 ? (
              byFeature.map((item, index) => (
                <View key={item.feature} style={styles.featureItem}>
                  <View style={styles.featureHeader}>
                    <Text style={[styles.featureName, { color: theme.colors.text }]}>{formatFeatureName(item.feature)}</Text>
                    <Text style={[styles.featureCount, { color: theme.colors.textMuted }]}>{item.requests}</Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { backgroundColor: theme.colors.primaryContainer, width: `${item.percentage}%` },
                      ]}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No usage data yet</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Daily Trend (Last 7 Days)</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            {byDay && byDay.length > 0 ? (
              <View style={styles.chartContainer}>
                <View style={styles.chart}>
                  {byDay.map((item, index) => {
                    const maxRequests = Math.max(...byDay.map((d) => d.requests), 1);
                    const height = (item.requests / maxRequests) * 100;
                    return (
                      <View key={item.date} style={styles.barContainer}>
                        <View
                          style={[
                            styles.bar,
                            {
                              backgroundColor: theme.colors.primaryContainer,
                              height: `${Math.max(height, 5)}%`,
                            },
                          ]}
                        />
                        <Text style={[styles.barLabel, { color: theme.colors.textMuted }]}>
                          {getDayLabel(item.date)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No daily data yet</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

function formatFeatureName(feature: string): string {
  return feature
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yest';
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  featureItem: {
    marginBottom: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureName: {
    fontSize: 15,
    fontWeight: '500',
  },
  featureCount: {
    fontSize: 15,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 24,
  },
  chartContainer: {
    height: 120,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    paddingBottom: 24,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});
