import { useState, useMemo } from 'react';
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
import { Button } from '@/components/ui/Button';
import { useTasks } from '@/hooks/useTasks';
import { useReadinessScore } from '@/hooks/useExecution';
import { type Task } from '@/services/task.service';

function formatDuration(minutes?: number): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getPriorityColor(theme: any, priority: Task['priority']): string {
  switch (priority) {
    case 'URGENT': return theme.colors.error || theme.colors.danger;
    case 'HIGH': return theme.colors.warning || theme.colors.accent;
    case 'MEDIUM': return theme.colors.primary;
    case 'LOW': return theme.colors.textMuted;
    default: return theme.colors.textMuted;
  }
}

const STEPS = ['Choose task', 'Estimate', 'Prepare', 'Ready'];

export default function SmartStartScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [distractionChecks, setDistractionChecks] = useState({
    closeTabs: false,
    silenceNotifications: false,
    clearDesk: false,
  });

  const today = new Date().toISOString().split('T')[0];
  const { data: tasks, isLoading } = useTasks({ scheduledDate: today });
  const { data: readiness } = useReadinessScore();

  const availableTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter((t) => t.status !== 'COMPLETED')
      .sort((a, b) => {
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [tasks]);

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setEstimatedDuration(task.duration ?? 25);
    setStep(1);
  };

  const handleToggleDistraction = (key: keyof typeof distractionChecks) => {
    setDistractionChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStart = () => {
    if (selectedTask) {
      router.push(`/focus/${selectedTask.id}`);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backArrow, { color: theme.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Smart Start</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.stepsRow}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor: i <= step ? theme.colors.primary : theme.colors.surfaceMuted,
                },
              ]}
            />
            <Text
              style={[
                styles.stepLabel,
                { color: i <= step ? theme.colors.text : theme.colors.textMuted },
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading tasks...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {step === 0 && (
            <View>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Pick ONE task to focus on
              </Text>
              <Text style={[styles.stepSubtext, { color: theme.colors.textMuted }]}>
                Choose the task that matters most right now
              </Text>
              {availableTasks.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                  <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No tasks for today</Text>
                  <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                    Add a task first to use Smart Start
                  </Text>
                  <Button variant="secondary" onPress={() => router.push('/today/add-task')} style={{ marginTop: 12 }}>
                    Add Task
                  </Button>
                </View>
              ) : (
                <View style={styles.taskList}>
                  {availableTasks.map((task) => (
                    <Pressable
                      key={task.id}
                      style={[
                        styles.taskCard,
                        { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
                        selectedTask?.id === task.id && { borderColor: theme.colors.primary, borderWidth: 2 },
                      ]}
                      onPress={() => handleSelectTask(task)}
                    >
                      <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(theme, task.priority) }]} />
                      <View style={styles.taskContent}>
                        <Text style={[styles.taskTitle, { color: theme.colors.text }]} numberOfLines={1}>
                          {task.title}
                        </Text>
                        <View style={styles.taskMeta}>
                          {task.duration && (
                            <Text style={[styles.taskMetaText, { color: theme.colors.textMuted }]}>
                              {formatDuration(task.duration)}
                            </Text>
                          )}
                          <Text style={[styles.taskMetaText, { color: theme.colors.textMuted }]}>
                            {task.energy}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.chevron, { color: theme.colors.textSubtle }]}>›</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          {step === 1 && selectedTask && (
            <View>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Time estimate
              </Text>
              <Text style={[styles.stepSubtext, { color: theme.colors.textMuted }]}>
                This should take about {estimatedDuration} minutes
              </Text>
              <View style={[styles.taskPreview, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.taskPreviewTitle, { color: theme.colors.text }]}>{selectedTask.title}</Text>
                <Text style={[styles.taskPreviewMeta, { color: theme.colors.textMuted }]}>
                  {selectedTask.energy} energy
                  {selectedTask.category ? ` · ${selectedTask.category}` : ''}
                </Text>
              </View>
              <View style={styles.durationAdjust}>
                <Pressable
                  style={[styles.durationButton, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                  onPress={() => setEstimatedDuration((prev) => Math.max(5, (prev ?? 25) - 5))}
                >
                  <Text style={[styles.durationButtonText, { color: theme.colors.text }]}>-5m</Text>
                </Pressable>
                <Text style={[styles.durationValue, { color: theme.colors.text }]}>
                  {estimatedDuration}m
                </Text>
                <Pressable
                  style={[styles.durationButton, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                  onPress={() => setEstimatedDuration((prev) => (prev ?? 25) + 5)}
                >
                  <Text style={[styles.durationButtonText, { color: theme.colors.text }]}>+5m</Text>
                </Pressable>
              </View>
              <Button onPress={() => setStep(2)} style={{ marginTop: 20 }}>
                Continue
              </Button>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Remove distractions
              </Text>
              <Text style={[styles.stepSubtext, { color: theme.colors.textMuted }]}>
                Optional — set yourself up for focus
              </Text>
              <View style={styles.checklist}>
                {([
                  { key: 'closeTabs' as const, label: 'Close other tabs', icon: '🗂' },
                  { key: 'silenceNotifications' as const, label: 'Silence notifications', icon: '🔕' },
                  { key: 'clearDesk' as const, label: 'Clear desk', icon: '🧹' },
                ]).map((item) => (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.checkItem,
                      { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
                      distractionChecks[item.key] && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryContainer },
                    ]}
                    onPress={() => handleToggleDistraction(item.key)}
                  >
                    <Text style={styles.checkIcon}>{item.icon}</Text>
                    <Text style={[styles.checkLabel, { color: theme.colors.text }]}>{item.label}</Text>
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: theme.colors.borderStrong },
                        distractionChecks[item.key] && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                      ]}
                    >
                      {distractionChecks[item.key] && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
              <Button onPress={() => setStep(3)} style={{ marginTop: 20 }}>
                I'm ready
              </Button>
              <Button variant="ghost" onPress={() => setStep(3)} style={{ marginTop: 8 }}>
                Skip
              </Button>
            </View>
          )}

          {step === 3 && (
            <View style={styles.readyContainer}>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                You're ready
              </Text>
              {readiness && (
                <View style={[styles.readinessCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                  <Text style={[styles.readinessLabel, { color: theme.colors.textMuted }]}>READINESS</Text>
                  <Text
                    style={[
                      styles.readinessScore,
                      { color: readiness.score >= 70 ? theme.colors.success : readiness.score >= 40 ? theme.colors.warning : theme.colors.danger },
                    ]}
                  >
                    {readiness.score}%
                  </Text>
                  <Text style={[styles.readinessText, { color: theme.colors.textMuted }]}>
                    {readiness.explanation}
                  </Text>
                </View>
              )}
              <Text style={[styles.confidenceText, { color: theme.colors.textMuted }]}>
                {selectedTask?.title}
                {estimatedDuration ? ` · ${estimatedDuration}m` : ''}
              </Text>
              <Button onPress={handleStart} style={{ marginTop: 24 }}>
                START NOW
              </Button>
              <Button variant="ghost" onPress={handleBack} style={{ marginTop: 8 }}>
                Go back
              </Button>
            </View>
          )}
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
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 24,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepSubtext: {
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 22,
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
  taskList: {
    gap: 8,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  taskContent: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '500',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  taskPreview: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  taskPreviewTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskPreviewMeta: {
    fontSize: 13,
    fontWeight: '500',
  },
  durationAdjust: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  durationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  durationButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  durationValue: {
    fontSize: 32,
    fontWeight: '700',
    minWidth: 80,
    textAlign: 'center',
  },
  checklist: {
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  checkIcon: {
    fontSize: 22,
  },
  checkLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  readyContainer: {
    alignItems: 'center',
  },
  readinessCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  readinessLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  readinessScore: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  readinessText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  confidenceText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
