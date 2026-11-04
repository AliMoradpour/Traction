import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Page, SectionTitle } from '@/components/calm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGoals } from '@/hooks/useGoals';
import { useCreateTask } from '@/hooks/useTasks';
import { useTractionTheme } from '@/theme';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

const DURATIONS = [10, 25, 45, 60, 90];
const PRIORITIES: { label: string; value: Priority }[] = [
  { label: 'Can wait', value: 'LOW' },
  { label: 'Normal', value: 'MEDIUM' },
  { label: 'Important', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

/** Midday of the user's local today, so the task lands on their day in any time zone. */
function todayLocalNoonISO(): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

export default function AddTaskScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { goalId: preselectedGoalId } = useLocalSearchParams<{ goalId?: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [duration, setDuration] = useState<number | null>(25);
  const [goalId, setGoalId] = useState<string | undefined>(preselectedGoalId);
  const createTask = useCreateTask();
  const { data: goals } = useGoals({ status: 'ACTIVE' });

  const handleSubmit = () => {
    createTask.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        duration: duration ?? undefined,
        goalId: goalId || undefined,
        scheduledAt: todayLocalNoonISO(),
      },
      {
        onSuccess: () => router.back(),
        onError: (error: any) => Alert.alert("Couldn't add the task", error?.message || 'Please try again.'),
      },
    );
  };

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

  const chips = <T,>(
    options: { label: string; value: T }[],
    selected: T | null | undefined,
    onSelect: (value: T) => void,
  ) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const isSelected = o.value === selected;
        return (
          <Pressable
            key={String(o.label)}
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
      title="New task"
      subtitle="Small and specific works best."
      footer={
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          disabled={!title.trim() || createTask.isPending}
          loading={createTask.isPending}
        >
          Add to today
        </Button>
      }
    >
      <Input
        label="What do you need to do?"
        placeholder="Write the intro paragraph"
        value={title}
        onChangeText={setTitle}
        autoFocus
        returnKeyType="done"
      />

      <SectionTitle title="How long will it take?" />
      {chips(
        DURATIONS.map((m) => ({ label: m < 60 ? `${m} min` : `${m / 60} h`.replace('1.5 h', '1½ h'), value: m })),
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
        label="Notes (optional)"
        placeholder="Anything that will help you start"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ minHeight: 80, paddingTop: 14, textAlignVertical: 'top' }}
      />
    </Page>
  );
}
