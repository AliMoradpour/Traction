import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useTask, useUpdateTask, useDeleteTask, useCompleteTask } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';

const PRIORITIES: { label: string; value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }[] = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

function formatDuration(minutes?: number): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function parseDuration(input: string): number | undefined {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return undefined;

  const hMatch = trimmed.match(/^(\d+)h\s*(\d*)m?$/);
  if (hMatch) {
    const h = parseInt(hMatch[1], 10);
    const m = hMatch[2] ? parseInt(hMatch[2], 10) : 0;
    return h * 60 + m;
  }

  const mMatch = trimmed.match(/^(\d+)m?$/);
  if (mMatch) return parseInt(mMatch[1], 10);

  return undefined;
}

export default function TaskDetailsScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const { data: task, isLoading, isError } = useTask(taskId || '');
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const completeTask = useCompleteTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [goalId, setGoalId] = useState<string | undefined>();
  const [initialized, setInitialized] = useState(false);
  const { data: goals } = useGoals({ status: 'ACTIVE' });

  useEffect(() => {
    if (task && !initialized) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'MEDIUM');
      setDuration(task.duration ? formatDuration(task.duration) : '');
      setCategory(task.category || '');
      setGoalId(task.goalId);
      setInitialized(true);
    }
  }, [task, initialized]);

  const handleSave = () => {
    if (!taskId) return;
    if (!title.trim()) {
      Alert.alert('Validation', 'Task name is required');
      return;
    }

    updateTask.mutate(
      {
        id: taskId,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          duration: parseDuration(duration),
          category: category.trim() || undefined,
          goalId: goalId || undefined,
        },
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: (error: any) => {
          Alert.alert('Error', error?.message || 'Failed to save task');
        },
      }
    );
  };

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

  const handleToggleComplete = () => {
    if (!taskId || !task) return;
    if (task.status === 'COMPLETED') return;
    completeTask.mutate(taskId);
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
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Task Details</Text>
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

  const isCompleted = task.status === 'COMPLETED';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Task Details</Text>
        <Pressable onPress={handleDelete}>
          <Text style={[styles.deleteButton, { color: theme.colors.error || theme.colors.danger }]}>Delete</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>TASK NAME</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Task name"
            placeholderTextColor={theme.colors.textSubtle}
            editable={!isCompleted}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details..."
            placeholderTextColor={theme.colors.textSubtle}
            multiline
            numberOfLines={3}
            editable={!isCompleted}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>PRIORITY</Text>
          <View style={styles.chipGroup}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: priority === p.value ? theme.colors.primary : theme.colors.surfaceElevated,
                    borderColor: priority === p.value ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => !isCompleted && setPriority(p.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: priority === p.value ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>CATEGORY</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Design, Dev, Ops"
            placeholderTextColor={theme.colors.textSubtle}
            editable={!isCompleted}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>ESTIMATED DURATION</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
            value={duration}
            onChangeText={setDuration}
            placeholder="e.g. 30m, 1h"
            placeholderTextColor={theme.colors.textSubtle}
            editable={!isCompleted}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>LINK TO GOAL</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipGroup}>
            <Pressable
              style={[
                styles.chip,
                {
                  backgroundColor: !goalId ? theme.colors.primary : theme.colors.surfaceElevated,
                  borderColor: !goalId ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => !isCompleted && setGoalId(undefined)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: !goalId ? '#FFFFFF' : theme.colors.text },
                ]}
              >
                None
              </Text>
            </Pressable>
            {goals?.map((goal) => (
              <Pressable
                key={goal.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: goalId === goal.id ? theme.colors.primary : theme.colors.surfaceElevated,
                    borderColor: goalId === goal.id ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => !isCompleted && setGoalId(goal.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: goalId === goal.id ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  {goal.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {task.friction != null && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>RESISTANCE METER</Text>
            <View style={[styles.resistanceCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <View style={styles.resistanceHeader}>
                <Text style={[styles.resistanceLabel, { color: theme.colors.text }]}>Friction Score</Text>
                <Text style={[styles.resistanceValue, { color: theme.colors.warning }]}>{task.friction}</Text>
              </View>
              <View style={[styles.resistanceTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
                <View style={[styles.resistanceFill, { backgroundColor: theme.colors.warning, width: `${Math.min(task.friction, 100)}%` }]} />
              </View>
            </View>
          </View>
        )}

        {!isCompleted && (
          <View style={styles.field}>
            <Button variant="secondary" onPress={handleToggleComplete} loading={completeTask.isPending}>
              Mark as Completed
            </Button>
          </View>
        )}
      </ScrollView>

      {!isCompleted && (
        <View style={styles.footer}>
          <Button variant="primary" onPress={handleSave} loading={updateTask.isPending} disabled={updateTask.isPending}>
            {updateTask.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </View>
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
  deleteButton: {
    fontSize: 15,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
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
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
