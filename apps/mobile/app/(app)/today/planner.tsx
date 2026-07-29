import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useDailyBrief } from '@/hooks/useAI';
import { useTasks } from '@/hooks/useTasks';

interface PrioritizedTask {
  id: string;
  title: string;
  reason: string;
  energy: 'high' | 'medium' | 'low';
  duration?: number;
  priority?: string;
}

interface DailyPlan {
  summary: string;
  tasks: PrioritizedTask[];
  energyInsights: { peak: string; low: string; recommendation: string };
  focusRecommendation: string;
  timeAllocation: string;
  reasoning: string;
}

function parseDailyBrief(raw: any): DailyPlan {
  if (!raw) {
    return {
      summary: 'No daily brief available yet.',
      tasks: [],
      energyInsights: { peak: '', low: '', recommendation: '' },
      focusRecommendation: '',
      timeAllocation: '',
      reasoning: '',
    };
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return normalizePlan(parsed);
    } catch {
      return {
        summary: raw,
        tasks: [],
        energyInsights: { peak: '', low: '', recommendation: '' },
        focusRecommendation: '',
        timeAllocation: '',
        reasoning: '',
      };
    }
  }

  return normalizePlan(raw);
}

function normalizePlan(data: any): DailyPlan {
  const tasks: PrioritizedTask[] = (data.tasks || data.prioritizedTasks || []).map(
    (t: any, i: number) => ({
      id: t.id || String(i),
      title: t.title || t.name || 'Untitled task',
      reason: t.reason || t.reasoning || t.description || '',
      energy: t.energy || t.energyLevel || (i < 2 ? 'high' : i < 5 ? 'medium' : 'low'),
      duration: t.duration,
      priority: t.priority,
    })
  );

  const energy = data.energyInsights || data.energy || {};
  return {
    summary: data.summary || data.overview || '',
    tasks,
    energyInsights: {
      peak: energy.peak || energy.peakWindow || '',
      low: energy.low || energy.lowWindow || '',
      recommendation: energy.recommendation || energy.advice || '',
    },
    focusRecommendation: data.focusRecommendation || data.focus || '',
    timeAllocation: data.timeAllocation || data.timeBlocks || '',
    reasoning: data.reasoning || data.aiReasoning || data.explanation || '',
  };
}

function EnergyBadge({ level, theme }: { level: string; theme: any }) {
  const colors: Record<string, { bg: string; text: string }> = {
    high: { bg: '#ECFDF5', text: '#047857' },
    medium: { bg: '#FEF3C7', text: '#B45309' },
    low: { bg: '#FEE2E2', text: '#B91C1C' },
  };
  const c = colors[level] || colors.medium;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{level}</Text>
    </View>
  );
}

function ReasoningCard({ text, theme }: { text: string; theme: any }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  return (
    <View style={[styles.reasoningCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <View style={styles.reasoningHeader}>
          <Text style={[styles.reasoningLabel, { color: theme.colors.textMuted }]}>AI REASONING</Text>
          <Text style={[styles.expandArrow, { color: theme.colors.textMuted }]}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </Pressable>
      {expanded && (
        <Text style={[styles.reasoningText, { color: theme.colors.text }]}>{text}</Text>
      )}
    </View>
  );
}

function TaskItem({ task, theme }: { task: PrioritizedTask; theme: any }) {
  const [showReason, setShowReason] = useState(false);
  return (
    <View style={[styles.taskItem, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
      <View style={styles.taskRow}>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{task.title}</Text>
          <View style={styles.taskMeta}>
            <EnergyBadge level={task.energy} theme={theme} />
            {task.duration ? (
              <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                {task.duration < 60 ? `${task.duration}m` : `${Math.floor(task.duration / 60)}h ${task.duration % 60 ? `${task.duration % 60}m` : ''}`}
              </Text>
            ) : null}
          </View>
        </View>
        {task.reason ? (
          <Pressable
            style={[styles.reasonButton, { borderColor: theme.colors.border }]}
            onPress={() => setShowReason(!showReason)}
          >
            <Text style={[styles.reasonButtonText, { color: theme.colors.primary }]}>Why?</Text>
          </Pressable>
        ) : null}
      </View>
      {showReason && task.reason ? (
        <Text style={[styles.reasonText, { color: theme.colors.textMuted }]}>{task.reason}</Text>
      ) : null}
    </View>
  );
}

function TimeBlockSection({
  title,
  icon,
  tasks,
  theme,
}: {
  title: string;
  icon: string;
  tasks: PrioritizedTask[];
  theme: any;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.taskCount, { color: theme.colors.textMuted }]}>{tasks.length}</Text>
      </View>
      {tasks.length === 0 ? (
        <Text style={[styles.noTasks, { color: theme.colors.textMuted }]}>No tasks in this block</Text>
      ) : (
        tasks.map((task) => <TaskItem key={task.id} task={task} theme={theme} />)
      )}
    </View>
  );
}

export default function PlannerScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: briefRaw, isLoading, isError, refetch } = useDailyBrief();
  const { data: allTasks } = useTasks({});

  const plan = useMemo(() => parseDailyBrief(briefRaw), [briefRaw]);

  const todayTasks = useMemo(() => {
    if (!allTasks) return [];
    const today = new Date().toISOString().split('T')[0];
    return allTasks.filter((t: any) => t.scheduledDate === today && t.status !== 'COMPLETED');
  }, [allTasks]);

  const highEnergy = useMemo(
    () => plan.tasks.filter((t) => t.energy === 'high'),
    [plan.tasks]
  );
  const mediumEnergy = useMemo(
    () => plan.tasks.filter((t) => t.energy === 'medium'),
    [plan.tasks]
  );
  const lowEnergy = useMemo(
    () => plan.tasks.filter((t) => t.energy === 'low'),
    [plan.tasks]
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backArrow, { color: theme.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>AI Daily Plan</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Generating your plan...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <Text style={[styles.errorIcon, { color: theme.colors.textMuted }]}>⚠️</Text>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>AI plan unavailable</Text>
          <Text style={[styles.errorSubtext, { color: theme.colors.textMuted }]}>
            Check your connection and try again
          </Text>
          <Pressable
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Summary */}
            {plan.summary ? (
              <View style={[styles.summaryCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.summaryText, { color: theme.colors.text }]}>{plan.summary}</Text>
              </View>
            ) : null}

            {/* Energy Insights */}
            {(plan.energyInsights.peak || plan.energyInsights.low) && (
              <View style={[styles.insightCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                <Text style={[styles.insightLabel, { color: '#166534' }]}>ENERGY INSIGHTS</Text>
                {plan.energyInsights.peak ? (
                  <Text style={[styles.insightText, { color: '#15803D' }]}>
                    Peak: {plan.energyInsights.peak}
                  </Text>
                ) : null}
                {plan.energyInsights.low ? (
                  <Text style={[styles.insightText, { color: '#15803D' }]}>
                    Low: {plan.energyInsights.low}
                  </Text>
                ) : null}
                {plan.energyInsights.recommendation ? (
                  <Text style={[styles.insightAdvice, { color: '#166534' }]}>{plan.energyInsights.recommendation}</Text>
                ) : null}
              </View>
            )}

            {/* Focus Recommendation */}
            {plan.focusRecommendation ? (
              <View style={[styles.focusCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Text style={[styles.focusLabel, { color: '#1E40AF' }]}>FOCUS TODAY</Text>
                <Text style={[styles.focusText, { color: '#1D4ED8' }]}>{plan.focusRecommendation}</Text>
              </View>
            ) : null}

            {/* Task Blocks */}
            <TimeBlockSection title="Morning — High Energy" icon="☀️" tasks={highEnergy} theme={theme} />
            <TimeBlockSection title="Afternoon — Medium Energy" icon="🌤" tasks={mediumEnergy} theme={theme} />
            <TimeBlockSection title="Evening — Low Energy" icon="🌙" tasks={lowEnergy} theme={theme} />

            {/* Unscheduled tasks */}
            {todayTasks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>📋</Text>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Unscheduled Tasks</Text>
                </View>
                {todayTasks.map((task: any) => (
                  <View
                    key={task.id}
                    style={[styles.taskItem, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                  >
                    <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{task.title}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Time Allocation */}
            {plan.timeAllocation ? (
              <View style={[styles.timeCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.timeLabel, { color: theme.colors.textMuted }]}>TIME ALLOCATION</Text>
                <Text style={[styles.timeText, { color: theme.colors.text }]}>{plan.timeAllocation}</Text>
              </View>
            ) : null}

            {/* AI Reasoning */}
            <ReasoningCard text={plan.reasoning} theme={theme} />

            {/* Refresh */}
            <Pressable
              style={[styles.refreshButton, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              onPress={handleRefresh}
            >
              <Text style={[styles.refreshButtonText, { color: theme.colors.primary }]}>↻ Refresh Plan</Text>
            </Pressable>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  insightLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    marginBottom: 4,
  },
  insightAdvice: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  focusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  focusLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  focusText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  taskCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  noTasks: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  taskItem: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskInfo: {
    flex: 1,
    gap: 6,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reasonButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  reasonButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  reasoningCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  reasoningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reasoningLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
  },
  expandArrow: {
    fontSize: 12,
  },
  reasoningText: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  timeCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    lineHeight: 22,
  },
  refreshButton: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
