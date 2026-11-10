import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import {
  Card,
  ChoiceChips,
  DayPicker,
  EmptyHint,
  Group,
  Page,
  Pill,
  Row,
  SectionTitle,
} from '@/components/calm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGoals } from '@/hooks/useGoals';
import { useCompleteTask, useDeleteTask, useTask, useUpdateTask } from '@/hooks/useTasks';
import { isSameDay, localNoonISO, startOfDay } from '@/lib/dates';
import { useTractionTheme } from '@/theme';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

const DURATIONS = [10, 25, 45, 60, 90];
const PRIORITIES: { label: string; value: Priority }[] = [
  { label: 'Can wait', value: 'LOW' },
  { label: 'Normal', value: 'MEDIUM' },
  { label: 'Important', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

const durationLabel = (m: number) =>
  m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} h`;

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
  const [day, setDay] = useState<Date | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (task && !initialized) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'MEDIUM');
      setDuration(task.duration ?? null);
      setGoalId(task.goalId);
      setDay(task.scheduledAt ? startOfDay(new Date(task.scheduledAt)) : null);
      setInitialized(true);
    }
  }, [task, initialized]);

  const originalDay = task?.scheduledAt ? startOfDay(new Date(task.scheduledAt)) : null;
  const dayChanged = !!day && (!originalDay || !isSameDay(day, originalDay));

  const changed =
    !!task &&
    (title.trim() !== (task.title || '') ||
      description.trim() !== (task.description || '') ||
      priority !== (task.priority || 'MEDIUM') ||
      duration !== (task.duration ?? null) ||
      goalId !== task.goalId ||
      dayChanged);

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
          ...(dayChanged && day ? { scheduledAt: localNoonISO(day) } : {}),
        },
      },
      {
        onSuccess: () => router.back(),
        onError: (error: any) =>
          Alert.alert("Couldn't save your changes", error?.message || 'Please try again.'),
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
            onError: (error: any) =>
              Alert.alert("Couldn't delete the task", error?.message || 'Please try again.'),
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
          <EmptyHint
            icon="cloud-offline-outline"
            title="We couldn't load this task"
            text="Go back and try again."
          />
        )}
      </Page>
    );
  }

  const isDone = task.status === 'COMPLETED';
  const durationOptions = Array.from(
    new Set([...DURATIONS, ...(task.duration ? [task.duration] : [])]),
  ).sort((a, b) => a - b);

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
            <Text style={{ ...theme.typography.bodyMd, color: theme.colors.text }}>
              Nice work. This one is finished.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Button variant="primary" onPress={() => router.push(`/focus/${taskId}`)}>
              Start focusing
            </Button>
            <Button
              variant="secondary"
              onPress={() => completeTask.mutate(taskId)}
              loading={completeTask.isPending}
            >
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

      {!isDone ? (
        <>
          <SectionTitle title="When?" detail={day ? undefined : 'No day set'} />
          <DayPicker value={day ?? startOfDay(new Date())} onChange={setDay} />
        </>
      ) : null}

      <SectionTitle title="How long will it take?" />
      <ChoiceChips
        options={durationOptions.map((m) => ({ label: durationLabel(m), value: m }))}
        selected={duration}
        onSelect={(m) => setDuration(m === duration ? null : m)}
      />

      <SectionTitle title="How important is it?" />
      <ChoiceChips options={PRIORITIES} selected={priority} onSelect={setPriority} />

      {goals && goals.length > 0 ? (
        <>
          <SectionTitle title="Part of a goal?" />
          <ChoiceChips
            options={goals.map((g) => ({ label: g.title, value: g.id }))}
            selected={goalId}
            onSelect={(id) => setGoalId(id === goalId ? undefined : id)}
          />
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
        <Row
          first
          icon="trash-outline"
          iconTint="clay"
          title="Delete task"
          destructive
          onPress={handleDelete}
        />
      </Group>
    </Page>
  );
}
