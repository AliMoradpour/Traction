import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { Card, EmptyHint, IconButton, Page, Pill, ProgressBar } from '@/components/calm';
import { Button } from '@/components/ui/Button';
import { useGoals } from '@/hooks/useGoals';
import { daysLeftLabel, GOAL_HEALTH, GOAL_TYPES } from '@/lib/goalLabels';
import { useTractionTheme } from '@/theme';

export default function GoalsScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { data: goals, isLoading, isError, refetch, isRefetching } = useGoals();
  const list = goals ?? [];
  const createGoal = () => router.push('/(app)/goals/create');

  return (
    <Page
      title="Goals"
      subtitle={
        list.length > 0
          ? `${list.length} goal${list.length === 1 ? '' : 's'} in progress. One step at a time.`
          : 'The bigger things you are working towards.'
      }
      back={false}
      action={<IconButton icon="add" label="New goal" tone="primary" onPress={createGoal} />}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.colors.accent} style={{ marginTop: 32 }} />
      ) : isError ? (
        <EmptyHint icon="cloud-offline-outline" title="We couldn't load your goals" text="Check your connection and try again.">
          <Button variant="secondary" fullWidth={false} onPress={() => refetch()}>
            Try again
          </Button>
        </EmptyHint>
      ) : list.length === 0 ? (
        <EmptyHint icon="flag-outline" title="No goals yet" text="Pick one thing you'd like to achieve in the next few months.">
          <Button variant="primary" fullWidth={false} onPress={createGoal}>
            Create a goal
          </Button>
        </EmptyHint>
      ) : (
        list.map((goal) => {
          const type = GOAL_TYPES[goal.type] ?? GOAL_TYPES.CUSTOM;
          const health = GOAL_HEALTH[goal.health] ?? GOAL_HEALTH.ON_TRACK;
          const daysLeft = daysLeftLabel(goal.targetDate);
          return (
            <Card key={goal.id} onPress={() => router.push(`/(app)/goals/${goal.id}`)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 13,
                    backgroundColor: theme.colors.accentMuted,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={type.icon} size={20} color={theme.colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ ...theme.typography.bodyLg, fontWeight: '600', color: theme.colors.text }}
                    numberOfLines={1}
                  >
                    {goal.title}
                  </Text>
                  <Text style={{ ...theme.typography.labelSm, color: theme.colors.textMuted }}>
                    {type.label}
                    {daysLeft ? ` · ${daysLeft}` : ''}
                  </Text>
                </View>
                <Pill label={health.label} tone={health.tone} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
                <View style={{ flex: 1 }}>
                  <ProgressBar value={goal.progress} tone={health.tone === 'sage' ? 'sage' : 'blue'} />
                </View>
                <Text style={{ ...theme.typography.labelSm, fontWeight: '600', color: theme.colors.textMuted }}>
                  {Math.round(goal.progress)}%
                </Text>
              </View>
            </Card>
          );
        })
      )}
    </Page>
  );
}
