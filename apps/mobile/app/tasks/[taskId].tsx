import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useTask, useDeleteTask } from '@/hooks/useTasks';
import { Task } from '@/services/task.service';

function formatDuration(minutes?: number): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getPriorityLabel(priority: Task['priority']): string {
  switch (priority) {
    case 'URGENT': return '🔴 Urgent';
    case 'HIGH': return '🟠 High';
    case 'MEDIUM': return '🟡 Medium';
    case 'LOW': return '⚪ Low';
    default: return priority;
  }
}

function getStatusLabel(status: Task['status']): string {
  switch (status) {
    case 'COMPLETED': return '✅ Completed';
    case 'IN_PROGRESS': return '🔄 In Progress';
    case 'PENDING': return '⏳ Pending';
    case 'SKIPPED': return '⏭ Skipped';
    case 'CANCELLED': return '❌ Cancelled';
    default: return status;
  }
}

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const theme = useTractionTheme();
  const router = useRouter();
  const { data: task, isLoading, isError } = useTask(taskId || '');
  const deleteTask = useDeleteTask();

  const handleDelete = () => {
    if (!taskId) return;
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTask.mutate(taskId, {
            onSuccess: () => {
              router.back();
            },
            onError: (error: any) => {
              Alert.alert('Error', error?.message || 'Failed to delete task');
            },
          });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Button variant="ghost" onPress={() => router.back()}>
            ← Back
          </Button>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Task</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.colors.error || theme.colors.danger }]}>
            Task not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button variant="ghost" onPress={() => router.back()}>
          ← Back
        </Button>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Task</Text>
        <Button variant="ghost" onPress={() => router.push({ pathname: '/today/task-details', params: { taskId } })}>
          Edit
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.titleSection, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{task.title}</Text>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: theme.colors.textMuted }]}>
              {getStatusLabel(task.status)}
            </Text>
          </View>
        </View>

        {task.description ? (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>DESCRIPTION</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{task.description}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>PRIORITY</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{getPriorityLabel(task.priority)}</Text>
        </View>

        {task.category ? (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>CATEGORY</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{task.category}</Text>
          </View>
        ) : null}

        {task.duration ? (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>DURATION</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{formatDuration(task.duration)}</Text>
          </View>
        ) : null}

        {task.energy ? (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>ENERGY</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{task.energy}</Text>
          </View>
        ) : null}

        {task.friction != null ? (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>FRICTION</Text>
            <View style={[styles.resistanceCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <View style={styles.resistanceHeader}>
                <Text style={[styles.resistanceLabel, { color: theme.colors.text }]}>Score</Text>
                <Text style={[styles.resistanceValue, { color: theme.colors.warning }]}>{task.friction}</Text>
              </View>
              <View style={[styles.resistanceTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
                <View style={[styles.resistanceFill, { backgroundColor: theme.colors.warning, width: `${Math.min(task.friction, 100)}%` }]} />
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>DATES</Text>
          <View style={[styles.dateCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={styles.dateRow}>
              <Text style={[styles.dateLabel, { color: theme.colors.textMuted }]}>Created</Text>
              <Text style={[styles.dateValue, { color: theme.colors.text }]}>{formatDate(task.createdAt)}</Text>
            </View>
            {task.scheduledAt ? (
              <View style={styles.dateRow}>
                <Text style={[styles.dateLabel, { color: theme.colors.textMuted }]}>Scheduled</Text>
                <Text style={[styles.dateValue, { color: theme.colors.text }]}>{formatDate(task.scheduledAt)}</Text>
              </View>
            ) : null}
            {task.dueAt ? (
              <View style={styles.dateRow}>
                <Text style={[styles.dateLabel, { color: theme.colors.textMuted }]}>Due</Text>
                <Text style={[styles.dateValue, { color: theme.colors.text }]}>{formatDate(task.dueAt)}</Text>
              </View>
            ) : null}
            {task.completedAt ? (
              <View style={styles.dateRow}>
                <Text style={[styles.dateLabel, { color: theme.colors.textMuted }]}>Completed</Text>
                <Text style={[styles.dateValue, { color: theme.colors.text }]}>{formatDate(task.completedAt)}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Button variant="danger" onPress={handleDelete} loading={deleteTask.isPending}>
          Delete Task
        </Button>
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
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  titleSection: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 8,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.01,
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  value: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
  resistanceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  resistanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resistanceLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  resistanceValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  resistanceTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  resistanceFill: {
    height: '100%',
    borderRadius: 3,
  },
  dateCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '400',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 17,
    fontWeight: '500',
  },
});
