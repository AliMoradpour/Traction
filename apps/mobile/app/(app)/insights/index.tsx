import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';

const MOCK_INSIGHTS = [
  {
    id: '1',
    title: 'Energy Cycles',
    icon: '💡',
    learned: 'You complete 71% more deep work when tasks are started before noon.',
    change: 'Move coding and architecture sessions before 11:00 AM.',
  },
  {
    id: '2',
    title: 'Resistance Triggers',
    icon: '🧠',
    learned: 'Complexity is your primary friction source. Tasks estimated at >2 hours have an 88% avoidance rate.',
    change: 'Enforce a "Micro-Task" rule: Break any task over 45 mins into 3 sub-tasks immediately.',
  },
  {
    id: '3',
    title: 'Momentum vs Drift',
    icon: '📊',
    learned: 'Your IELTS Prep momentum has stalled. Falling below 3 sessions/week has historically led to a 14-day delay.',
    change: 'Reduce IELTS sessions to 15 minutes daily instead of 1 hour bi-weekly to lower entry friction.',
  },
];

export default function InsightsScreen() {
  const theme = useTractionTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Self-Awareness</Text>
        </View>
        <View style={[styles.frictionBadge, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
          <Text style={[styles.frictionText, { color: theme.colors.text }]}>Friction: 24/100</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pattern Recognition</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
            Turning observations into deliberate action.
          </Text>
        </View>

        <View style={styles.insightsList}>
          {MOCK_INSIGHTS.map((insight) => (
            <View key={insight.id} style={[styles.insightCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <Text style={[styles.insightLabel, { color: theme.colors.primary }]}>WHAT WE LEARNED</Text>
              </View>
              <Text style={[styles.insightLearned, { color: theme.colors.text }]}>{insight.learned}</Text>
              <View style={[styles.changeBox, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Text style={[styles.changeLabel, { color: theme.colors.primary }]}>WHAT TO CHANGE</Text>
                <Text style={[styles.changeText, { color: theme.colors.text }]}>{insight.change}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.aiSynthesisCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <View style={styles.aiSynthesisHeader}>
            <Text style={styles.aiSynthesisIcon}>✨</Text>
            <Text style={[styles.aiSynthesisLabel, { color: theme.colors.onPrimaryContainer }]}>STRATEGY SYNTHESIS</Text>
          </View>
          <Text style={[styles.aiSynthesisTitle, { color: theme.colors.onPrimaryContainer }]}>
            Reducing daily targets from 12 to 5 tasks will eliminate the 'overwhelmed' trigger and ensure 100% completion.
          </Text>
          <Pressable style={[styles.applyButton, { backgroundColor: '#FFFFFF' }]}>
            <Text style={[styles.applyButtonText, { color: theme.colors.primary }]}>Update Daily Capacity</Text>
          </Pressable>
        </View>

        <View style={styles.quickLinks}>
          <Pressable
            style={[styles.quickLinkCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
            onPress={() => router.push('/(app)/insights/weekly-review')}
          >
            <Text style={styles.quickLinkIcon}>📈</Text>
            <View style={styles.quickLinkContent}>
              <Text style={[styles.quickLinkTitle, { color: theme.colors.text }]}>Weekly Review</Text>
              <Text style={[styles.quickLinkSubtitle, { color: theme.colors.textMuted }]}>View your weekly patterns</Text>
            </View>
            <Text style={[styles.quickLinkArrow, { color: theme.colors.textSubtle }]}>›</Text>
          </Pressable>

          <Pressable
            style={[styles.quickLinkCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
            onPress={() => router.push('/(app)/insights/behavioral-awareness')}
          >
            <Text style={styles.quickLinkIcon}>🧠</Text>
            <View style={styles.quickLinkContent}>
              <Text style={[styles.quickLinkTitle, { color: theme.colors.text }]}>Behavioral Awareness</Text>
              <Text style={[styles.quickLinkSubtitle, { color: theme.colors.textMuted }]}>Deep dive into your habits</Text>
            </View>
            <Text style={[styles.quickLinkArrow, { color: theme.colors.textSubtle }]}>›</Text>
          </Pressable>
        </View>
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  frictionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  frictionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  insightsList: {
    gap: 16,
    marginBottom: 24,
  },
  insightCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 18,
  },
  insightLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
  },
  insightLearned: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 12,
  },
  changeBox: {
    padding: 12,
    borderRadius: 8,
  },
  changeLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 4,
  },
  changeText: {
    fontSize: 15,
    lineHeight: 20,
  },
  aiSynthesisCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  aiSynthesisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiSynthesisIcon: {
    fontSize: 18,
  },
  aiSynthesisLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  aiSynthesisTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 16,
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickLinks: {
    gap: 12,
  },
  quickLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  quickLinkIcon: {
    fontSize: 24,
  },
  quickLinkContent: {
    flex: 1,
    gap: 2,
  },
  quickLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickLinkSubtitle: {
    fontSize: 13,
  },
  quickLinkArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
});
