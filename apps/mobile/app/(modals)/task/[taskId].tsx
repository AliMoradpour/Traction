import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useTask, useUpdateTask, useDeleteTask, useCompleteTask } from '@/hooks/useTasks';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#6B7280',
  MEDIUM: '#F59E0B',
  HIGH: '#F97316',
  URGENT: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  SKIPPED: 'Skipped',
  CANCELLED: 'Cancelled',
};

export default function TaskModal() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const theme = useTractionTheme();
  const router = useRouter();
  const { data: task, isLoading, error } = useTask(taskId!);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const completeTask = useCompleteTask();

  const handleComplete = () => {
    Alert.alert('Complete Task', 'Mark this task as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: () => {
          completeTask.mutate(taskId!, {
            onSuccess: () => router.back(),
            onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to complete task.'),
          });
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTask.mutate(taskId!, {
            onSuccess: () => router.back(),
            onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete task.'),
          });
        },
      },
    ]);
  };

  const handlePause = () => {
    updateTask.mutate(
      { id: taskId!, data: { status: 'PENDING' } },
      { onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update task.') }
    );
  };

  const handleStart = () => {
    updateTask.mutate(
      { id: taskId!, data: { status: 'IN_PROGRESS' } },
      { onError: (err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update task.') }
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {error ? 'Failed to load task.' : 'Task not found.'}
          </Text>
          <Button variant="primary" onPress={() => router.back()} style={{ marginTop: 16 }}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{task.title}</Text>
          {task.description ? (
            <Text style={[styles.description, { color: theme.colors.textMuted }]}>{task.description}</Text>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: PRIORITY_COLORS[task.priority] + '20' }]}>
            <Text style={[styles.badgeText, { color: PRIORITY_COLORS[task.priority] }]}>
              {task.priority}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Text style={[styles.badgeText, { color: theme.colors.textMuted }]}>
              {STATUS_LABELS[task.status]}
            </Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          {task.duration ? (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Duration</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>{task.duration} min</Text>
            </View>
          ) : null}
          {task.category ? (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Category</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>{task.category}</Text>
            </View>
          ) : null}
          {task.dueAt ? (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Due</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {new Date(task.dueAt).toLocaleDateString()}
              </Text>
            </View>
          ) : null}
          {task.scheduledAt ? (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Scheduled</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {new Date(task.scheduledAt).toLocaleDateString()}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          {task.status === 'PENDING' && (
            <Button variant="primary" size="lg" onPress={handleStart} loading={updateTask.isPending} style={styles.actionButton}>
              Start Task
            </Button>
          )}
          {task.status === 'IN_PROGRESS' && (
            <>
              <Button variant="primary" size="lg" onPress={handleComplete} loading={completeTask.isPending} style={styles.actionButton}>
                Complete
              </Button>
              <Button variant="secondary" size="lg" onPress={handlePause} loading={updateTask.isPending} style={styles.actionButton}>
                Pause
              </Button>
            </>
          )}
          {task.status === 'COMPLETED' && (
            <View style={[styles.completedBanner, { backgroundColor: theme.colors.successSurface }]}>
              <Text style={[styles.completedText, { color: theme.colors.success }]}>Task completed</Text>
            </View>
          )}
          <Button variant="danger" size="lg" onPress={handleDelete} loading={deleteTask.isPending} style={styles.actionButton}>
            Delete Task
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  description: { fontSize: 15, lineHeight: 22 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 28 },
  detailItem: { minWidth: 100 },
  detailLabel: { fontSize: 12, marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: '500' },
  actions: { gap: 12 },
  actionButton: { width: '100%' },
  completedBanner: { padding: 16, borderRadius: 12, alignItems: 'center' },
  completedText: { fontSize: 15, fontWeight: '600' },
  emptyText: { fontSize: 15, textAlign: 'center' },
});
