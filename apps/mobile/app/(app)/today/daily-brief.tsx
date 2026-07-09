import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import Button from '@/components/ui/Button';

const MOCK_TASKS = [
  { id: '1', title: 'Review feedback from Design Team', friction: 25, duration: '20m', energy: 'medium' },
  { id: '2', title: 'Prepare Weekly Sync Slides', friction: 40, duration: '45m', energy: 'high' },
  { id: '3', title: 'Reply to Slack mentions', friction: 10, duration: '15m', energy: 'low' },
  { id: '4', title: 'Update project documentation', friction: 30, duration: '30m', energy: 'medium' },
];

const MOCK_FOCUS_HISTORY = [
  { day: 'Mon', score: 60 },
  { day: 'Tue', score: 45 },
  { day: 'Wed', score: 75 },
  { day: 'Thu', score: 55 },
  { day: 'Fri', score: 80 },
];

const ENERGY_INSIGHT = {
  peak: '9:00 AM - 11:30 AM',
  low: '2:00 PM - 3:30 PM',
  tip: 'Schedule your most demanding tasks during your peak energy window.',
};

export default function DailyBriefScreen() {
  const theme = useTractionTheme();
  const router = useRouter();

  const getFrictionColor = (friction: number) => {
    if (friction < 20) return theme.colors.success;
    if (friction < 40) return theme.colors.warning;
    return theme.colors.error;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Daily Brief</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Overview</Text>
          <Text style={[styles.date, { color: theme.colors.textMuted }]}>Monday, October 23</Text>
        </View>

        <View style={[styles.energyCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
          <View style={styles.energyHeader}>
            <Text style={styles.energyIcon}>⚡</Text>
            <Text style={[styles.energyTitle, { color: theme.colors.text }]}>Energy Insights</Text>
          </View>
          <View style={styles.energyRow}>
            <View style={styles.energyItem}>
              <Text style={[styles.energyLabel, { color: theme.colors.textMuted }]}>Peak</Text>
              <Text style={[styles.energyValue, { color: theme.colors.success }]}>{ENERGY_INSIGHT.peak}</Text>
            </View>
            <View style={styles.energyItem}>
              <Text style={[styles.energyLabel, { color: theme.colors.textMuted }]}>Low</Text>
              <Text style={[styles.energyValue, { color: theme.colors.warning }]}>{ENERGY_INSIGHT.low}</Text>
            </View>
          </View>
          <Text style={[styles.energyTip, { color: theme.colors.textMuted }]}>💡 {ENERGY_INSIGHT.tip}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Focus History (5 days)</Text>
          <View style={[styles.chartCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={styles.chart}>
              {MOCK_FOCUS_HISTORY.map((day, index) => (
                <View key={index} style={styles.chartBar}>
                  <View
                    style={[
                      styles.bar,
                      {
                        backgroundColor: theme.colors.primary,
                        height: `${day.score}%`,
                      },
                    ]}
                  />
                  <Text style={[styles.chartLabel, { color: theme.colors.textMuted }]}>{day.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tasks Sorted by Friction</Text>
          <View style={styles.taskList}>
            {MOCK_TASKS.sort((a, b) => a.friction - b.friction).map((task) => (
              <Pressable
                key={task.id}
                style={[styles.taskCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                onPress={() => router.push(`/tasks/${task.id}`)}
              >
                <View style={styles.taskHeader}>
                  <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{task.title}</Text>
                  <View style={[styles.frictionBadge, { backgroundColor: getFrictionColor(task.friction) + '20' }]}>
                    <Text style={[styles.frictionText, { color: getFrictionColor(task.friction) }]}>
                      {task.friction}
                    </Text>
                  </View>
                </View>
                <View style={styles.taskMeta}>
                  <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>⏱ {task.duration}</Text>
                  <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>⚡ {task.energy}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.aiInsightCard, { backgroundColor: theme.colors.accentMuted }]}>
          <Text style={styles.aiIcon}>✨</Text>
          <View style={styles.aiContent}>
            <Text style={[styles.aiTitle, { color: theme.colors.accentText }]}>AI Suggestion</Text>
            <Text style={[styles.aiText, { color: theme.colors.accentText }]}>
              You've completed 80% of your high-friction tasks early this week. Consider tackling the
              remaining friction-heavy items today while your momentum is strong.
            </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    fontWeight: '500',
  },
  energyCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  energyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  energyIcon: {
    fontSize: 20,
  },
  energyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  energyRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  energyItem: {
    flex: 1,
  },
  energyLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: 4,
  },
  energyValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  energyTip: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  chartCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 8,
  },
  taskList: {
    gap: 8,
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  frictionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  frictionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  aiInsightCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  aiIcon: {
    fontSize: 20,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  aiText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
