import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { BodyText, Card, EmptyHint, Group, IconButton, Page, Row, SectionTitle } from '@/components/calm';
import { TaskRow } from '@/components/calm/TaskRow';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMonthPlan, useUpdateMonthPlan } from '@/hooks/usePlanning';
import { useCompleteTask, useTasks } from '@/hooks/useTasks';
import {
  addMonths,
  dayKey,
  isSameDay,
  monthGrid,
  monthKey,
  monthLabel,
  monthRangeISO,
  parseMonthKey,
  relativeDayLabel,
  startOfDay,
} from '@/lib/dates';
import type { Task } from '@/services/task.service';
import { useTractionTheme } from '@/theme';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function MonthScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ month?: string }>();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [month, setMonth] = useState<Date>(() => parseMonthKey(params.month) ?? addMonths(today, 0));
  const key = monthKey(month);
  const isCurrentMonth = key === monthKey(today);
  const [selected, setSelected] = useState<Date>(() =>
    monthKey(month) === monthKey(today) ? today : month,
  );

  // Moving to another month selects its first day (or today in the current month).
  const changeMonth = (delta: number) => {
    const next = addMonths(month, delta);
    setMonth(next);
    setSelected(monthKey(next) === monthKey(today) ? today : next);
  };

  const range = useMemo(() => monthRangeISO(month), [month]);
  const tasks = useTasks(range);
  const plan = useMonthPlan(key);
  const completeTask = useCompleteTask();

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks.data ?? []) {
      if (!task.scheduledAt || task.status === 'CANCELLED') continue;
      const k = dayKey(new Date(task.scheduledAt));
      map.set(k, [...(map.get(k) ?? []), task]);
    }
    return map;
  }, [tasks.data]);

  const all = (tasks.data ?? []).filter((t) => t.status !== 'CANCELLED');
  const doneCount = all.filter((t) => t.status === 'COMPLETED').length;
  const selectedTasks = [...(byDay.get(dayKey(selected)) ?? [])].sort(
    (a, b) => Number(a.status === 'COMPLETED') - Number(b.status === 'COMPLETED'),
  );

  const openTask = useCallback(
    (id: string) => router.push({ pathname: '/today/task-details', params: { taskId: id } }),
    [router],
  );
  const complete = useCallback((id: string) => completeTask.mutate(id), [completeTask]);
  const isPast = key < monthKey(today);

  return (
    <Page
      title={monthLabel(month)}
      subtitle={all.length ? `${doneCount} of ${all.length} planned tasks done` : 'Set a few focuses, then spread tasks across the month.'}
      action={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconButton icon="chevron-back-outline" label="Previous month" onPress={() => changeMonth(-1)} />
          <IconButton icon="chevron-forward-outline" label="Next month" onPress={() => changeMonth(1)} />
        </View>
      }
      refreshing={tasks.isRefetching}
      onRefresh={() => {
        void tasks.refetch();
        void plan.refetch();
      }}
    >
      <FocusCard month={key} focuses={plan.data?.focuses ?? []} note={plan.data?.note ?? null} loading={plan.isLoading} />

      <Card>
        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
          {WEEKDAYS.map((d, i) => (
            <Text
              key={i}
              style={{ flex: 1, textAlign: 'center', ...theme.typography.labelSm, color: theme.colors.textSubtle }}
            >
              {d}
            </Text>
          ))}
        </View>
        {monthGrid(month).map((week, wi) => (
          <View key={wi} style={{ flexDirection: 'row' }}>
            {week.map((day, di) => {
              if (!day) return <View key={di} style={{ flex: 1, height: 48 }} />;
              const dayTasks = byDay.get(dayKey(day)) ?? [];
              const open = dayTasks.filter((t) => t.status !== 'COMPLETED').length;
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selected);
              return (
                <Pressable
                  key={di}
                  onPress={() => setSelected(day)}
                  accessibilityRole="button"
                  accessibilityLabel={`${relativeDayLabel(day)}, ${dayTasks.length} tasks`}
                  style={{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center' }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? theme.colors.primary : isToday ? theme.colors.accentMuted : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        ...theme.typography.bodyMd,
                        fontWeight: isToday || isSelected ? '700' : '400',
                        color: isSelected ? theme.colors.textInverse : day < today ? theme.colors.textSubtle : theme.colors.text,
                      }}
                    >
                      {day.getDate()}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 2, height: 5, marginTop: 2 }}>
                    {dayTasks.length > 0 ? (
                      <View
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 3,
                          backgroundColor: open === 0 ? theme.colors.success : theme.colors.accent,
                        }}
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </Card>

      <SectionTitle
        title={relativeDayLabel(selected)}
        detail={selectedTasks.length ? `${selectedTasks.length} task${selectedTasks.length === 1 ? '' : 's'}` : undefined}
      />
      {tasks.isLoading ? (
        <ActivityIndicator />
      ) : (
        <Group>
          {selectedTasks.map((task, i) => (
            <TaskRow key={task.id} task={task} first={i === 0} onComplete={complete} onPress={openTask} />
          ))}
          {selected >= today ? (
            <Row
              first={selectedTasks.length === 0}
              title="Add a task"
              icon="add"
              iconTint="sand"
              right={null}
              onPress={() => router.push({ pathname: '/today/add-task', params: { date: dayKey(selected) } })}
            />
          ) : selectedTasks.length === 0 ? (
            <Row first title="Nothing was planned" icon="leaf-outline" iconTint="sage" />
          ) : null}
        </Group>
      )}

      <Group>
        <Row
          first
          icon="sparkles-outline"
          iconTint="sage"
          title={isPast ? `Review ${month.toLocaleDateString('en-US', { month: 'long' })}` : 'Review so far'}
          detail={isPast ? 'What went well and what to change' : 'A look at the month up to today'}
          onPress={() => router.push({ pathname: '/today/monthly-review', params: { month: key } })}
        />
        {isCurrentMonth ? (
          <Row
            icon="time-outline"
            title="Review last month"
            onPress={() => router.push({ pathname: '/today/monthly-review', params: { month: monthKey(addMonths(today, -1)) } })}
          />
        ) : null}
      </Group>
    </Page>
  );
}

function FocusCard({
  month,
  focuses,
  note,
  loading,
}: {
  month: string;
  focuses: string[];
  note: string | null;
  loading: boolean;
}) {
  const theme = useTractionTheme();
  const update = useUpdateMonthPlan(month);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(['', '', '']);
  const [draftNote, setDraftNote] = useState('');

  const startEditing = () => {
    setDraft([0, 1, 2].map((i) => focuses[i] ?? ''));
    setDraftNote(note ?? '');
    setEditing(true);
  };

  const save = () => {
    update.mutate(
      { focuses: draft.map((f) => f.trim()).filter(Boolean), note: draftNote.trim() || null },
      {
        onSuccess: () => setEditing(false),
        onError: (error: any) => Alert.alert("Couldn't save your focuses", error?.message || 'Please try again.'),
      },
    );
  };

  if (loading) return <ActivityIndicator />;

  if (editing) {
    return (
      <Card style={{ gap: 12 }}>
        <Text style={{ ...theme.typography.titleMd, color: theme.colors.text }}>Focus for the month</Text>
        <BodyText muted>One to three things that matter most. Fewer is easier.</BodyText>
        {draft.map((value, i) => (
          <Input
            key={i}
            placeholder={['e.g. Finish the writing course', 'e.g. Exercise three times a week', 'e.g. Read two books'][i]}
            value={value}
            onChangeText={(text) => setDraft(draft.map((d, j) => (j === i ? text : d)))}
            maxLength={120}
          />
        ))}
        <Input
          label="Note (optional)"
          placeholder="Anything to remember this month"
          value={draftNote}
          onChangeText={setDraftNote}
          multiline
          style={{ minHeight: 60, paddingTop: 12, textAlignVertical: 'top' }}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button variant="secondary" onPress={() => setEditing(false)} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button variant="primary" onPress={save} loading={update.isPending} style={{ flex: 1 }}>
            Save
          </Button>
        </View>
      </Card>
    );
  }

  if (focuses.length === 0) {
    return (
      <Card tint="blue">
        <EmptyHint icon="compass-outline" title="What matters this month?" text="Pick one to three focuses to guide your days.">
          <Button variant="primary" onPress={startEditing} fullWidth={false}>
            Set focuses
          </Button>
        </EmptyHint>
      </Card>
    );
  }

  return (
    <Card tint="blue" style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ ...theme.typography.titleMd, color: theme.colors.text }}>Focus for the month</Text>
        <Pressable onPress={startEditing} accessibilityRole="button" hitSlop={8}>
          <Text style={{ ...theme.typography.labelSm, fontWeight: '600', color: theme.colors.accentText }}>Edit</Text>
        </Pressable>
      </View>
      {focuses.map((focus, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <Text style={{ ...theme.typography.bodyMd, fontWeight: '700', color: theme.colors.accent }}>{i + 1}</Text>
          <Text style={{ flex: 1, ...theme.typography.bodyMd, color: theme.colors.text }}>{focus}</Text>
        </View>
      ))}
      {note ? <BodyText muted>{note}</BodyText> : null}
    </Card>
  );
}
