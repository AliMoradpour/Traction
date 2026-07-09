import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';

const MOCK_GOALS = [
  {
    id: '1',
    title: 'IELTS Prep',
    status: 'on-track',
    statusText: 'On Track - 17 weeks remaining',
    dueDate: 'Due Dec 15, 2024',
    progress: 65,
    velocity: 'Stable',
    aiSuggestion: 'AI suggests focusing on Writing Section next.',
  },
  {
    id: '2',
    title: 'Learn Rust',
    status: 'at-risk',
    statusText: 'At Risk - 5 days inactive',
    dueDate: 'Due Jan 20, 2025',
    progress: 12,
    velocity: 'Down 40%',
    aiSuggestion: 'Recovery needed to meet January deadline.',
  },
  {
    id: '3',
    title: 'Marathon Training',
    status: 'on-track',
    statusText: 'On Track - Peak Week',
    dueDate: 'Due Nov 02, 2024',
    progress: 88,
    velocity: 'Increasing',
    aiSuggestion: null,
  },
  {
    id: '4',
    title: 'Design Portfolio',
    status: 'behind',
    statusText: 'Behind Schedule - 11 days behind',
    dueDate: 'Due Dec 01, 2024',
    progress: 42,
    velocity: 'Recovery Needed',
    aiSuggestion: null,
  },
];

const getStatusColor = (status: string, theme: any) => {
  switch (status) {
    case 'on-track':
      return { bg: theme.colors.successMuted, text: theme.colors.success, dot: theme.colors.success };
    case 'at-risk':
      return { bg: theme.colors.warningMuted, text: theme.colors.warning, dot: theme.colors.warning };
    case 'behind':
      return { bg: theme.colors.errorMuted, text: theme.colors.error, dot: theme.colors.error };
    default:
      return { bg: theme.colors.surfaceMuted, text: theme.colors.textMuted, dot: theme.colors.textMuted };
  }
};

export default function GoalsScreen() {
  const theme = useTractionTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Goals</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={[styles.iconButton, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Text style={[styles.iconText, { color: theme.colors.text }]}>🔍</Text>
          </Pressable>
          <Pressable
            style={[styles.iconButton, { backgroundColor: theme.colors.surfaceElevated }]}
            onPress={() => router.push('/(app)/goals/select')}
          >
            <Text style={[styles.iconText, { color: theme.colors.text }]}>+</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summarySection}>
          <Text style={[styles.summaryLabel, { color: theme.colors.primary }]}>ACTIVE FOCUS</Text>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
            You have {MOCK_GOALS.length} goals in progress.
          </Text>
        </View>

        <View style={styles.goalsList}>
          {MOCK_GOALS.map((goal) => {
            const statusColors = getStatusColor(goal.status, theme);
            return (
              <Pressable
                key={goal.id}
                style={[styles.goalCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                onPress={() => router.push(`/(app)/goals/${goal.id}`)}
              >
                <View style={styles.goalHeader}>
                  <Text style={[styles.goalTitle, { color: theme.colors.text }]}>{goal.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColors.dot }]} />
                    <Text style={[styles.statusText, { color: statusColors.text }]}>{goal.statusText}</Text>
                  </View>
                </View>

                <View style={styles.goalMeta}>
                  <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>📅 {goal.dueDate}</Text>
                </View>

                <View style={styles.progressSection}>
                  <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: statusColors.dot,
                          width: `${goal.progress}%`,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.progressMeta}>
                    <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>
                      Velocity: {goal.velocity}
                    </Text>
                    <Text style={[styles.progressPercent, { color: theme.colors.textMuted }]}>
                      {goal.progress}% complete
                    </Text>
                  </View>
                </View>

                {goal.aiSuggestion && (
                  <View style={[styles.aiSuggestion, { borderTopColor: theme.colors.border }]}>
                    <Text style={styles.aiIcon}>✨</Text>
                    <Text style={[styles.aiText, { color: theme.colors.textMuted }]}>{goal.aiSuggestion}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.addMilestoneCard, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/(app)/goals/select')}
        >
          <View style={styles.addMilestoneContent}>
            <Text style={[styles.addMilestoneTitle, { color: '#FFFFFF' }]}>New Milestone?</Text>
            <Text style={[styles.addMilestoneSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
              Add a sub-goal to maintain momentum.
            </Text>
          </View>
          <View style={[styles.addButton, { backgroundColor: '#FFFFFF' }]}>
            <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>+ Add</Text>
          </View>
        </Pressable>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  goalsList: {
    gap: 16,
  },
  goalCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  goalMeta: {
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '500',
  },
  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  aiIcon: {
    fontSize: 16,
  },
  aiText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  addMilestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  addMilestoneContent: {
    flex: 1,
    gap: 4,
  },
  addMilestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addMilestoneSubtitle: {
    fontSize: 13,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
