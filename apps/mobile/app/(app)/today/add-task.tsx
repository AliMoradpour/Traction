import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ChoiceChips, DayPicker, Page, SectionTitle } from '@/components/calm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGoals } from '@/hooks/useGoals';
import { useCreateTask } from '@/hooks/useTasks';
import { localNoonISO, parseDayKey, relativeDayLabel, startOfDay } from '@/lib/dates';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

const DURATIONS = [10, 25, 45, 60, 90];
const PRIORITIES: { label: string; value: Priority }[] = [
  { label: 'Can wait', value: 'LOW' },
  { label: 'Normal', value: 'MEDIUM' },
  { label: 'Important', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

export default function AddTaskScreen() {
  const router = useRouter();
  const { goalId: preselectedGoalId, date } = useLocalSearchParams<{
    goalId?: string;
    date?: string;
  }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [duration, setDuration] = useState<number | null>(25);
  const [goalId, setGoalId] = useState<string | undefined>(preselectedGoalId);
  const [day, setDay] = useState<Date>(() => parseDayKey(date) ?? startOfDay(new Date()));
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
        scheduledAt: localNoonISO(day),
      },
      {
        onSuccess: () => router.back(),
        onError: (error: any) =>
          Alert.alert("Couldn't add the task", error?.message || 'Please try again.'),
      },
    );
  };

  const dayLabel = relativeDayLabel(day);

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
          {dayLabel === 'Today' || dayLabel === 'Tomorrow'
            ? `Add to ${dayLabel.toLowerCase()}`
            : `Add to ${dayLabel}`}
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

      <SectionTitle title="When?" />
      <DayPicker value={day} onChange={setDay} />

      <SectionTitle title="How long will it take?" />
      <ChoiceChips
        options={DURATIONS.map((m) => ({
          label: m < 60 ? `${m} min` : `${m / 60} h`.replace('1.5 h', '1½ h'),
          value: m,
        }))}
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
