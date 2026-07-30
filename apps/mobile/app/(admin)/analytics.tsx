import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnalytics } from '@/hooks/useAnalytics';

function EngagementCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={[styles.engagementCard, { backgroundColor: '#1a1a2e' }]}>
      <Text style={[styles.engagementValue, { color }]}>{value}</Text>
      <Text style={styles.engagementLabel}>{label}</Text>
    </View>
  );
}

function RetentionBar({ label, percentage }: { label: string; percentage: number }) {
  return (
    <View style={styles.retentionRow}>
      <Text style={styles.retentionLabel}>{label}</Text>
      <View style={styles.retentionBarContainer}>
        <View style={[styles.retentionBar, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.retentionValue}>{percentage}%</Text>
    </View>
  );
}

function FeatureBar({ label, count, percentage }: { label: string; count: number; percentage: number }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureHeader}>
        <Text style={styles.featureLabel}>{label}</Text>
        <Text style={styles.featureCount}>{count}</Text>
      </View>
      <View style={styles.featureBarContainer}>
        <View style={[styles.featureBar, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6c63ff" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load analytics</Text>
        </View>
      </SafeAreaView>
    );
  }

  const engagement = data?.engagement || {};
  const retention = data?.retention || {};
  const featureUsage = data?.featureUsage || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>User Engagement Metrics</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engagement</Text>
          <View style={styles.engagementGrid}>
            <EngagementCard label="Active Today" value={engagement.activeToday || 0} color="#6c63ff" />
            <EngagementCard label="Active This Week" value={engagement.activeThisWeek || 0} color="#22c55e" />
            <EngagementCard label="Avg Tasks/User" value={engagement.avgTasksPerUser || 0} color="#f59e0b" />
            <EngagementCard label="Completion Rate" value={`${engagement.completionRate || 0}%`} color="#ef4444" />
            <EngagementCard label="Focus Minutes" value={engagement.totalFocusMinutes || 0} color="#8b5cf6" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Retention</Text>
          <View style={[styles.retentionCard, { backgroundColor: '#1a1a2e' }]}>
            <RetentionBar label="Day 1" percentage={retention.day1 || 0} />
            <RetentionBar label="Day 3" percentage={retention.day3 || 0} />
            <RetentionBar label="Day 7" percentage={retention.day7 || 0} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feature Usage</Text>
          <View style={[styles.featureCard, { backgroundColor: '#1a1a2e' }]}>
            <FeatureBar label="Tasks" count={featureUsage.tasks?.count || 0} percentage={featureUsage.tasks?.percentage || 0} />
            <FeatureBar label="Goals" count={featureUsage.goals?.count || 0} percentage={featureUsage.goals?.percentage || 0} />
            <FeatureBar label="Focus" count={featureUsage.focus?.count || 0} percentage={featureUsage.focus?.percentage || 0} />
            <FeatureBar label="AI" count={featureUsage.ai?.count || 0} percentage={featureUsage.ai?.percentage || 0} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
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
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#8888aa',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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
    borderColor: '#2a2a3e',
  },
  engagementValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  engagementLabel: {
    fontSize: 13,
    color: '#8888aa',
    marginTop: 4,
  },
  retentionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  retentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  retentionLabel: {
    width: 50,
    fontSize: 14,
    color: '#ffffff',
  },
  retentionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  retentionBar: {
    height: '100%',
    backgroundColor: '#6c63ff',
    borderRadius: 4,
  },
  retentionValue: {
    width: 45,
    fontSize: 14,
    color: '#8888aa',
    textAlign: 'right',
  },
  featureCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
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
    color: '#ffffff',
  },
  featureCount: {
    fontSize: 14,
    color: '#8888aa',
  },
  featureBarContainer: {
    height: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  featureBar: {
    height: '100%',
    backgroundColor: '#6c63ff',
    borderRadius: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
});
