import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { Card, EmptyHint, Group, Page, Pill, Row, SectionTitle } from '@/components/calm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGoals } from '@/hooks/useGoals';
import { useCompleteTask, useDeleteTask, useTask, useUpdateTask } from '@/hooks/useTasks';
import { useTractionTheme } from '@/theme';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

const DURATIONS = [10, 25, 45, 60, 90];
const PRIORITIES: { label: string; value: Priority }[] = [
  { label: 'Can wait', value: 'LOW' },
  { label: 'Normal', value: 'MEDIUM' },
  { label: 'Important', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

const durationLabel = (m: number) => (m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} h`);

export default function TaskDetailsScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const { data: task, isLoading, isError } = useTask(taskId || '');
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const completeTask = useCompleteTask();
  const { data: goals } = useGoals({ status: 'ACTIVE' });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [duration, setDuration] = useState<number | null>(null);
  const [goalId, setGoalId] = useState<string | undefined>();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (task && !initialized) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'MEDIUM');
      setDuration(task.duration ?? null);
      setGoalId(task.goalId);
      setInitialized(true);
    }
  }, [task, initialized]);

  const changed =
    !!task &&
    (title.trim() !== (task.title || '') ||
      description.trim() !== (task.description || '') ||
      priority !== (task.priority || 'MEDIUM') ||
      duration !== (task.duration ?? null) ||
      goalId !== task.goalId);

  const handleSave = () => {
    if (!taskId) return;
    updateTask.mutate(
      {
        id: taskId,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          duration: duration ?? undefined,
          goalId: goalId || undefined,
        },
      },
      {
        onSuccess: () => router.back(),
        onError: (error: any) => Alert.alert("Couldn't save your changes", error?.message || 'Please try again.'),
      },
    );
  };

  const handleDelete = () => {
    if (!taskId) return;
    Alert.alert('Delete this task?', "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteTask.mutate(taskId, {
            onSuccess: () => router.back(),
            onError: (error: any) => Alert.alert("Couldn't delete the task", error?.message || 'Please try again.'),
          }),
      },
    ]);
  };

  if (isLoading || isError || !task) {
    return (
      <Page title={isLoading ? '' : 'Task'}>
        {isLoading ? (
          <ActivityIndicator color={theme.colors.accent} style={{ marginTop: 32 }} />
        ) : (
          <EmptyHint icon="cloud-offline-outline" title="We couldn't load this task" text="Go back and try again." />
        )}
      </Page>
    );
  }

  const isDone = task.status === 'COMPLETED';
  const durationOptions = Array.from(new Set([...DURATIONS, ...(task.duration ? [task.duration] : [])])).sort(
    (a, b) => a - b,
  );

  const chip = (selected: boolean) => ({
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: selected ? theme.colors.accent : theme.colors.border,
    backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surface,
  });
  const chipText = (selected: boolean) => ({
    ...theme.typography.bodyMd,
    fontWeight: '600' as const,
    color: selected ? theme.colors.accentText : theme.colors.text,
  });
  const chips = <T,>(options: { label: string; value: T }[], selected: T | null | undefined, onSelect: (v: T) => void) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const isSelected = o.value === selected;
        return (
          <Pressable
            key={o.label}
            onPress={() => onSelect(o.value)}
            style={chip(isSelected)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={chipText(isSelected)}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Page
      title={task.title}
      footer={
        changed ? (
          <Button
            variant="primary"
            size="lg"
            onPress={handleSave}
            disabled={!title.trim() || updateTask.isPending}
            loading={updateTask.isPending}
          >
            Save changes
          </Button>
        ) : undefined
      }
    >
      <Card tint={isDone ? 'sage' : 'blue'}>
        {isDone ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pill label="Done" tone="sage" />
            <Text style={{ ...theme.typography.bodyMd, color: theme.colors.text }}>Nice work. This one is finished.</Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Button variant="primary" onPress={() => router.push(`/focus/${taskId}`)}>
              Start focusing
            </Button>
            <Button variant="secondary" onPress={() => completeTask.mutate(taskId)} loading={completeTask.isPending}>
              Mark as done
            </Button>
          </View>
        )}
      </Card>

      {!isDone ? (
        <Group>
          <Row
            first
            icon="git-branch-outline"
            title="Break it into steps"
            detail="Make it smaller and easier to start"
            onPress={() => router.push(`/focus/${taskId}/simplify` as Href)}
          />
          <Row
            icon="help-buoy-outline"
            iconTint="clay"
            title="I'm stuck on this"
            detail="Find out what's in the way"
            onPress={() => router.push(`/focus/${taskId}/resistance` as Href)}
          />
        </Group>
      ) : null}

      <SectionTitle title="Details" />
      <Input label="Task" value={title} onChangeText={setTitle} placeholder="What needs doing?" />

      <SectionTitle title="How long will it take?" />
      {chips(
        durationOptions.map((m) => ({ label: durationLabel(m), value: m })),
        duration,
        (m) => setDuration(m === duration ? null : m),
      )}

      <SectionTitle title="How important is it?" />
      {chips(PRIORITIES, priority, setPriority)}

      {goals && goals.length > 0 ? (
        <>
          <SectionTitle title="Part of a goal?" />
          {chips(
            goals.map((g) => ({ label: g.title, value: g.id })),
            goalId,
            (id) => setGoalId(id === goalId ? undefined : id),
          )}
        </>
      ) : null}

      <Input
        label="Notes"
        placeholder="Anything that will help you start"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ minHeight: 80, paddingTop: 14, textAlignVertical: 'top' }}
      />

      <Group>
        <Row first icon="trash-outline" iconTint="clay" title="Delete task" destructive onPress={handleDelete} />
      </Group>
    </Page>
  );
}
