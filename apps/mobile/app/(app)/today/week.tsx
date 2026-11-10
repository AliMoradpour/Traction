import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

import { BodyText, Card, EmptyHint, Group, Page, Row, SectionTitle } from '@/components/calm';
import { TaskRow } from '@/components/calm/TaskRow';
import { Button } from '@/components/ui/Button';
import { useCompleteTask, useTasks, useUpdateTask } from '@/hooks/useTasks';
import { addDays, dayKey, daysRangeISO, localNoonISO, relativeDayLabel, startOfDay } from '@/lib/dates';
import type { Task } from '@/services/task.service';

const DAYS = 7;
const OPEN = new Set(['PENDING', 'IN_PROGRESS']);

export default function WeekScreen() {
  const router = useRouter();
  const today = useMemo(() => startOfDay(new Date()), []);
  const range = useMemo(() => daysRangeISO(today, DAYS), [today]);
  // Unfinished tasks from the last two weeks, so nothing quietly falls off the plan.
  const pastRange = useMemo(() => daysRangeISO(addDays(today, -14), 14), [today]);

  const week = useTasks(range);
  const past = useTasks(pastRange);
  const completeTask = useCompleteTask();
  const updateTask = useUpdateTask();
  const [moving, setMoving] = useState(false);

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of week.data ?? []) {
      if (!task.scheduledAt || task.status === 'CANCELLED') continue;
      const key = dayKey(new Date(task.scheduledAt));
      map.set(key, [...(map.get(key) ?? []), task]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => Number(a.status === 'COMPLETED') - Number(b.status === 'COMPLETED'));
    }
    return map;
  }, [week.data]);

  const leftOver = useMemo(() => (past.data ?? []).filter((t) => OPEN.has(t.status)), [past.data]);

  const openTask = useCallback(
    (id: string) => router.push({ pathname: '/today/task-details', params: { taskId: id } }),
    [router],
  );
  const complete = useCallback((id: string) => completeTask.mutate(id), [completeTask]);
  const addOn = (day: Date) => router.push({ pathname: '/today/add-task', params: { date: dayKey(day) } });

  const moveLeftOverToToday = async () => {
    setMoving(true);
    try {
      for (const task of leftOver) {
        await updateTask.mutateAsync({ id: task.id, data: { scheduledAt: localNoonISO(today) } });
      }
    } catch (error: any) {
      Alert.alert("Couldn't move every task", error?.message || 'Please try again.');
    } finally {
      setMoving(false);
    }
  };

  const days = Array.from({ length: DAYS }, (_, i) => addDays(today, i));
  const totalOpen = (week.data ?? []).filter((t) => OPEN.has(t.status)).length;

  return (
    <Page
      title="This week"
      subtitle={totalOpen ? `${totalOpen} task${totalOpen === 1 ? '' : 's'} planned for the next 7 days` : 'Spread your tasks across the days ahead.'}
      refreshing={week.isRefetching}
      onRefresh={() => {
        void week.refetch();
        void past.refetch();
      }}
    >
      {leftOver.length > 0 ? (
        <Card tint="clay" style={{ gap: 12 }}>
          <BodyText>
            {leftOver.length} unfinished task{leftOver.length === 1 ? '' : 's'} from earlier days. Bring them into today, or open
            one to pick another day.
          </BodyText>
          <Group>
            {leftOver.slice(0, 5).map((task, i) => (
              <TaskRow key={task.id} task={task} first={i === 0} onComplete={complete} onPress={openTask} />
            ))}
          </Group>
          <Button variant="secondary" onPress={moveLeftOverToToday} loading={moving}>
            Move all to today
          </Button>
        </Card>
      ) : null}

      {week.isLoading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : week.isError ? (
        <EmptyHint icon="cloud-offline-outline" title="We couldn't load your week" text="Pull down to try again." />
      ) : (
        days.map((day) => {
          const tasks = byDay.get(dayKey(day)) ?? [];
          const done = tasks.filter((t) => t.status === 'COMPLETED').length;
          return (
            <Group key={dayKey(day)}>
              <Row
                first
                title={relativeDayLabel(day)}
                detail={tasks.length ? `${done} of ${tasks.length} done` : 'Nothing planned'}
                icon={tasks.length && done === tasks.length ? 'checkmark-circle-outline' : 'calendar-clear-outline'}
                iconTint={tasks.length && done === tasks.length ? 'sage' : 'blue'}
                right={null}
              />
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} onComplete={complete} onPress={openTask} />
              ))}
              <Row title="Add a task" icon="add" iconTint="sand" onPress={() => addOn(day)} right={null} />
            </Group>
          );
        })
      )}

      <SectionTitle title="Looking further ahead?" />
      <Group>
        <Row first icon="calendar-outline" title="Plan the month" onPress={() => router.push('/today/month')} />
      </Group>
    </Page>
  );
}
