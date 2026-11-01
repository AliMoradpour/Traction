import { ActivityIndicator,ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAnalytics } from '@/hooks/useAnalytics';
import { useTractionTheme } from '@/theme';

type Theme = ReturnType<typeof useTractionTheme>;

function EngagementCard({ label, value, theme }: { label: string; value: string | number; theme: Theme }) {
  return (
    <View
      style={[
        styles.engagementCard,
        { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
      ]}
    >
      <Text style={[styles.engagementValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.engagementLabel, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

/** percentage is null when no user is old enough to measure this day yet. */
function RetentionBar({ label, percentage, theme }: { label: string; percentage: number | null; theme: Theme }) {
  return (
    <View style={styles.retentionRow}>
      <Text style={[styles.retentionLabel, { color: theme.colors.text }]}>{label}</Text>
      <View style={[styles.retentionBarContainer, { backgroundColor: theme.colors.surfaceMuted }]}>
        {percentage !== null && (
          <View style={[styles.retentionBar, { width: `${percentage}%`, backgroundColor: theme.colors.accent }]} />
        )}
      </View>
      <Text style={[styles.retentionValue, { color: theme.colors.textMuted }]}>
        {percentage === null ? '—' : `${percentage}%`}
      </Text>
    </View>
  );
}

function FeatureBar({
  label,
  count,
  percentage,
  theme,
}: {
  label: string;
  count: number;
  percentage: number;
  theme: Theme;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureHeader}>
        <Text style={[styles.featureLabel, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.featureCount, { color: theme.colors.textMuted }]}>{count}</Text>
      </View>
      <View style={[styles.featureBarContainer, { backgroundColor: theme.colors.surfaceMuted }]}>
        <View style={[styles.featureBar, { width: `${percentage}%`, backgroundColor: theme.colors.accent }]} />
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const theme = useTractionTheme();
  const { data, isLoading, error } = useAnalytics();
  const container = [styles.container, { backgroundColor: theme.colors.background }];
  const card = [styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }];
  const muted = { color: theme.colors.textMuted };

  if (isLoading) {
    return (
      <SafeAreaView style={container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={container}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>Failed to load analytics</Text>
        </View>
      </SafeAreaView>
    );
  }

  const engagement = data?.engagement || {};
  const retention = data?.retention || {};
  const featureUsage = data?.featureUsage || {};

  return (
    <SafeAreaView style={container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Analytics</Text>
          <Text style={[styles.headerSubtitle, muted]}>User Engagement Metrics</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Engagement</Text>
          <Text style={[styles.sectionNote, muted]}>
            Active = any task, goal, focus, AI or session activity. Days in UTC.
          </Text>
          <View style={styles.engagementGrid}>
            <EngagementCard theme={theme} label="Active Today" value={engagement.activeToday || 0} />
            <EngagementCard theme={theme} label="Active This Week" value={engagement.activeThisWeek || 0} />
            <EngagementCard theme={theme} label="Avg Tasks/User" value={engagement.avgTasksPerUser || 0} />
            <EngagementCard theme={theme} label="Completion Rate" value={`${engagement.completionRate || 0}%`} />
            <EngagementCard theme={theme} label="Focus Minutes" value={engagement.totalFocusMinutes || 0} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Retention</Text>
          <View style={card}>
            <RetentionBar theme={theme} label="Day 1" percentage={retention.day1 ?? null} />
            <RetentionBar theme={theme} label="Day 3" percentage={retention.day3 ?? null} />
            <RetentionBar theme={theme} label="Day 7" percentage={retention.day7 ?? null} />
            <Text style={[styles.retentionNote, muted]}>
              Users who came back N+ days after signing up. — means no one has been signed up that long yet.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Feature Usage</Text>
          <View style={card}>
            <FeatureBar theme={theme} label="Tasks" count={featureUsage.tasks?.count || 0} percentage={featureUsage.tasks?.percentage || 0} />
            <FeatureBar theme={theme} label="Goals" count={featureUsage.goals?.count || 0} percentage={featureUsage.goals?.percentage || 0} />
            <FeatureBar theme={theme} label="Focus" count={featureUsage.focus?.count || 0} percentage={featureUsage.focus?.percentage || 0} />
            <FeatureBar theme={theme} label="AI" count={featureUsage.ai?.count || 0} percentage={featureUsage.ai?.percentage || 0} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  engagementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  engagementCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  engagementValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  engagementLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  retentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  retentionLabel: {
    width: 50,
    fontSize: 14,
  },
  retentionBarContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  retentionBar: {
    height: '100%',
    borderRadius: 4,
  },
  retentionNote: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionNote: {
    fontSize: 12,
    marginTop: -6,
    marginBottom: 12,
  },
  retentionValue: {
    width: 45,
    fontSize: 14,
    textAlign: 'right',
  },
  featureRow: {
    marginBottom: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 14,
  },
  featureCount: {
    fontSize: 14,
  },
  featureBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  featureBar: {
    height: '100%',
    borderRadius: 4,
  },
  errorText: {
    fontSize: 16,
  },
});
