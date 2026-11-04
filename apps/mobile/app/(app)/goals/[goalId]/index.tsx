import { Ionicons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import {
  BodyText,
  Card,
  EmptyHint,
  Group,
  IconButton,
  Page,
  Pill,
  ProgressBar,
  Row,
  SectionTitle,
} from '@/components/calm';
import { useArchiveGoal, useDeleteGoal, useGoal, useGoalMilestones } from '@/hooks/useGoals';
import { useCompleteTask, useTasks } from '@/hooks/useTasks';
import { daysLeftLabel, GOAL_HEALTH, GOAL_TYPES } from '@/lib/goalLabels';
import { useTractionTheme } from '@/theme';

function formatDate(date?: string): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function GoalDetailScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const { data: goal, isLoading, isError } = useGoal(goalId || '');
  const { data: milestones } = useGoalMilestones(goalId || '');
  const { data: linkedTasks } = useTasks({ goalId: goalId || undefined });
  const deleteGoal = useDeleteGoal();
  const archiveGoal = useArchiveGoal();
  const completeTask = useCompleteTask();

  const go = (path: string) => router.push(path as Href);

  const handleDelete = () => {
    if (!goalId) return;
    Alert.alert('Delete this goal?', "Its steps stay in your task list. This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteGoal.mutate(goalId, {
            onSuccess: () => router.replace('/(app)/goals'),
            onError: (error: any) => Alert.alert("Couldn't delete the goal", error?.message || 'Please try again.'),
          }),
      },
    ]);
  };

  const handleArchive = () => {
    if (!goalId) return;
    Alert.alert('Archive this goal?', 'It moves out of your list but nothing is deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        onPress: () =>
          archiveGoal.mutate(goalId, {
            onSuccess: () => router.replace('/(app)/goals'),
            onError: (error: any) => Alert.alert("Couldn't archive the goal", error?.message || 'Please try again.'),
          }),
      },
    ]);
  };

  if (isLoading || isError || !goal) {
    return (
      <Page title={isLoading ? '' : 'Goal'}>
        {isLoading ? (
          <ActivityIndicator color={theme.colors.accent} style={{ marginTop: 32 }} />
        ) : (
          <EmptyHint icon="cloud-offline-outline" title="We couldn't load this goal" text="Go back and try again." />
        )}
      </Page>
    );
  }

  const type = GOAL_TYPES[goal.type] ?? GOAL_TYPES.CUSTOM;
  const health = GOAL_HEALTH[goal.health] ?? GOAL_HEALTH.ON_TRACK;
  const isBehind = health.tone !== 'sage';
  const steps = [...(linkedTasks ?? [])].sort(
    (a, b) => Number(a.status === 'COMPLETED') - Number(b.status === 'COMPLETED'),
  );
  const doneMilestones = milestones?.filter((m) => m.status === 'COMPLETED').length ?? 0;
  const daysLeft = daysLeftLabel(goal.targetDate);

  return (
    <Page
      title={goal.title}
      action={
        <IconButton icon="create-outline" label="Edit goal" onPress={() => go(`/(app)/goals/${goalId}/edit`)} />
      }
    >
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={type.icon} size={16} color={theme.colors.textMuted} />
            <Text style={{ ...theme.typography.labelSm, fontWeight: '600', color: theme.colors.textMuted }}>
              {type.label}
            </Text>
          </View>
          <Pill label={health.label} tone={health.tone} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 14 }}>
          <Text style={{ ...theme.typography.displayLg, color: theme.colors.text }}>{Math.round(goal.progress)}%</Text>
          <Text style={{ ...theme.typography.bodyMd, color: theme.colors.textMuted }}>complete</Text>
        </View>
        <View style={{ marginTop: 10 }}>
          <ProgressBar value={goal.progress} tone={isBehind ? 'clay' : 'sage'} />
        </View>
        <Text style={{ ...theme.typography.labelSm, color: theme.colors.textMuted, marginTop: 12 }}>
          Started {formatDate(goal.startDate)}
          {goal.targetDate ? ` · Target ${formatDate(goal.targetDate)}` : ' · No deadline'}
          {daysLeft ? ` · ${daysLeft}` : ''}
        </Text>
      </Card>

      {isBehind ? (
        <Card tint="clay" onPress={() => go(`/(app)/goals/${goalId}/recovery`)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="refresh-outline" size={22} color={theme.colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={{ ...theme.typography.bodyMd, fontWeight: '600', color: theme.colors.text }}>
                Fallen behind? Let&apos;s reset gently
              </Text>
              <Text style={{ ...theme.typography.labelSm, color: theme.colors.textMuted }}>See a recovery plan</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textSubtle} />
          </View>
        </Card>
      ) : null}

      {goal.description ? (
        <Card tint="sand">
          <Text style={{ ...theme.typography.labelSm, fontWeight: '600', color: theme.colors.textSubtle, marginBottom: 4 }}>
            Why it matters
          </Text>
          <BodyText>{goal.description}</BodyText>
        </Card>
      ) : null}

      <SectionTitle
        title="Next steps"
        action={
          <Pressable onPress={() => go(`/(app)/today/add-task?goalId=${goalId}`)} hitSlop={8} accessibilityRole="button">
            <Text style={{ ...theme.typography.bodyMd, fontWeight: '600', color: theme.colors.accent }}>Add step</Text>
          </Pressable>
        }
      />
      {steps.length === 0 ? (
        <Card tint="sand">
          <BodyText muted>Break this goal into small tasks. Each one you finish moves it forward.</BodyText>
        </Card>
      ) : (
        <Group>
          {steps.map((task, i) => {
            const done = task.status === 'COMPLETED';
            return (
              <Row
                key={task.id}
                first={i === 0}
                title={task.title}
                detail={task.duration ? `${task.duration} min` : undefined}
                onPress={() => go(`/(app)/today/task-details?taskId=${task.id}`)}
                right={
                  <Pressable
                    onPress={() => !done && completeTask.mutate(task.id)}
                    hitSlop={10}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: done }}
                    accessibilityLabel={`Mark ${task.title} as done`}
                  >
                    <Ionicons
                      name={done ? 'checkmark-circle' : 'ellipse-outline'}
                      size={26}
                      color={done ? theme.colors.success : theme.colors.textSubtle}
                    />
                  </Pressable>
                }
              />
            );
          })}
        </Group>
      )}

      <SectionTitle title="Plan and progress" />
      <Group>
        <Row
          first
          icon="git-commit-outline"
          title="Milestones"
          value={milestones?.length ? `${doneMilestones} of ${milestones.length}` : undefined}
          detail={milestones?.length ? undefined : 'Mark the big checkpoints'}
          onPress={() => go(`/(app)/goals/${goalId}/milestones`)}
        />
        <Row
          icon="speedometer-outline"
          iconTint="sage"
          title="Chance of success"
          detail="Based on your pace so far"
          onPress={() => go(`/(app)/goals/feasibility?goalId=${goalId}`)}
        />
        <Row
          icon="trending-up-outline"
          iconTint="sage"
          title="Forecast"
          detail="When you'll likely finish"
          onPress={() => go(`/(app)/goals/${goalId}/projection`)}
        />
        <Row
          icon="stats-chart-outline"
          iconTint="sand"
          title="Activity"
          detail="Focus time and finished steps"
          onPress={() => go(`/(app)/goals/${goalId}/analytics`)}
        />
      </Group>

      <Group>
        <Row first icon="archive-outline" iconTint="sand" title="Archive goal" onPress={handleArchive} />
        <Row icon="trash-outline" iconTint="clay" title="Delete goal" destructive onPress={handleDelete} />
      </Group>
    </Page>
  );
}
