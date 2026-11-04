import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { useUser } from '@/hooks/useAuth';
import { useReadinessScore } from '@/hooks/useExecution';
import { useCompleteTask, useTasks } from '@/hooks/useTasks';
import { localDayStartISO } from '@/lib/dates';
import type { Task } from '@/services/task.service';
import { type TractionTheme, useTractionTheme } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function formatDuration(minutes?: number | null): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

function getGreeting(firstName?: string | null): string {
  const hour = new Date().getHours();
  const name = firstName ? `, ${firstName}` : '';
  if (hour < 12) return `Good morning${name}`;
  if (hour < 17) return `Good afternoon${name}`;
  return `Good evening${name}`;
}

function readinessMessage(score: number): { title: string; tone: 'calm' | 'steady' | 'gentle' } {
  if (score >= 70) return { title: 'Good energy for focused work', tone: 'calm' };
  if (score >= 40) return { title: 'A steady day. Start small', tone: 'steady' };
  return { title: 'Take it gently today', tone: 'gentle' };
}

const TaskCard = React.memo(function TaskCard({
  task,
  styles,
  theme,
  onComplete,
  onStartSession,
  onPress,
}: {
  task: Task;
  styles: ReturnType<typeof createStyles>;
  theme: TractionTheme;
  onComplete: (id: string) => void;
  onStartSession: (id: string) => void;
  onPress: (id: string) => void;
}) {
  const isCompleted = task.status === 'COMPLETED';
  const isImportant = task.priority === 'HIGH' || task.priority === 'URGENT';

  // The card is a plain View with three sibling buttons (check, details, start) so no button nests in another.
  return (
    <View style={[styles.task, isCompleted && styles.taskDone]}>
      <Pressable
        style={[styles.check, isCompleted && styles.checkDone]}
        onPress={() => {
          if (!isCompleted) onComplete(task.id);
        }}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
        accessibilityLabel={`Mark ${task.title} as done`}
      >
        {isCompleted ? <Ionicons name="checkmark" size={15} color={theme.colors.textInverse} /> : null}
      </Pressable>

      <Pressable
        style={({ pressed }) => [{ flex: 1 }, pressed && { opacity: 0.7 }]}
        onPress={() => onPress(task.id)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${task.title}`}
      >
        <Text style={[styles.taskTitle, isCompleted && styles.taskTitleDone]} numberOfLines={2}>
          {task.title}
        </Text>
        {!isCompleted && (task.duration || isImportant) ? (
          <View style={styles.pills}>
            {task.duration ? (
              <Text style={[styles.pill, styles.pillBlue]}>{formatDuration(task.duration)}</Text>
            ) : null}
            {isImportant ? <Text style={[styles.pill, styles.pillClay]}>Important</Text> : null}
          </View>
        ) : null}
      </Pressable>

      {!isCompleted ? (
        <Pressable
          style={styles.play}
          onPress={() => onStartSession(task.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Start focusing on ${task.title}`}
        >
          <Ionicons name="play" size={16} color={theme.colors.accent} />
        </Pressable>
      ) : null}
    </View>
  );
});

export default function TodayScreen() {
  const theme = useTractionTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const { data: tasks, isLoading, isError, refetch, isRefetching } = useTasks({ scheduledDate: localDayStartISO() });
  const { data: readiness } = useReadinessScore();
  const { data: user } = useUser();
  const completeTask = useCompleteTask();

  // Open tasks first, finished ones at the bottom.
  const sorted = useMemo(
    () =>
      [...(tasks ?? [])].sort(
        (a, b) => Number(a.status === 'COMPLETED') - Number(b.status === 'COMPLETED'),
      ),
    [tasks],
  );
  const doneCount = sorted.filter((t) => t.status === 'COMPLETED').length;
  const openCount = sorted.length - doneCount;
  const isBehindSchedule = openCount > 2 && new Date().getHours() >= 14;

  const handleComplete = useCallback((id: string) => completeTask.mutate(id), [completeTask]);
  const handleStart = useCallback((id: string) => router.push(`/focus/${id}`), [router]);
  const handlePress = useCallback(
    (id: string) => router.push({ pathname: '/today/task-details', params: { taskId: id } }),
    [router],
  );

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const mood = readiness ? readinessMessage(readiness.score) : null;
  const moodColors = mood
    ? {
        calm: { bg: theme.colors.successSurface, fg: theme.colors.success, icon: 'sunny-outline' as IconName },
        steady: { bg: theme.colors.accentMuted, fg: theme.colors.accent, icon: 'partly-sunny-outline' as IconName },
        gentle: { bg: theme.colors.warningSurface, fg: theme.colors.warning, icon: 'cafe-outline' as IconName },
      }[mood.tone]
    : null;

  const quickActions: { label: string; icon: IconName; href: Href }[] = [
    { label: 'Smart start', icon: 'flash-outline', href: '/(app)/today/smart-start' as Href },
    { label: 'Plan day', icon: 'list-outline', href: '/(app)/today/planner' as Href },
    { label: 'Reflect', icon: 'moon-outline', href: '/(app)/today/reflection' as Href },
  ];

  const header = (
    <View>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.date}>{today}</Text>
          <Text style={styles.greeting}>{getGreeting(user?.firstName)}</Text>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/today/add-task')}
          accessibilityRole="button"
          accessibilityLabel="Add a task"
        >
          <Ionicons name="add" size={26} color={theme.colors.textInverse} />
        </Pressable>
      </View>

      {mood && moodColors ? (
        <View style={[styles.moodCard, { backgroundColor: moodColors.bg }]}>
          <View style={styles.moodIcon}>
            <Ionicons name={moodColors.icon} size={22} color={moodColors.fg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.moodTitle}>{mood.title}</Text>
            {readiness?.explanation ? (
              <Text style={styles.moodText} numberOfLines={2}>
                {readiness.explanation}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {isBehindSchedule ? (
        <Pressable
          style={[styles.moodCard, { backgroundColor: theme.colors.warningSurface }]}
          onPress={() => router.push('/(app)/today/replan' as Href)}
          accessibilityRole="button"
        >
          <View style={styles.moodIcon}>
            <Ionicons name="refresh-outline" size={22} color={theme.colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.moodTitle}>Running behind? That&apos;s okay</Text>
            <Text style={styles.moodText}>Re-plan the rest of your day</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textSubtle} />
        </Pressable>
      ) : null}

      <View style={styles.actions}>
        {quickActions.map((a) => (
          <Pressable
            key={a.label}
            style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
            onPress={() => router.push(a.href)}
            accessibilityRole="button"
          >
            <Ionicons name={a.icon} size={16} color={theme.colors.text} />
            <Text style={styles.actionText}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Today</Text>
        {sorted.length > 0 ? (
          <Text style={styles.sectionMeta}>
            {doneCount} of {sorted.length} done
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>We couldn&apos;t load your day</Text>
          <Text style={styles.emptyText}>Check your connection and try again.</Text>
          <Button variant="secondary" onPress={() => refetch()} style={{ marginTop: 16 }} fullWidth={false}>
            Try again
          </Button>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              styles={styles}
              theme={theme}
              onComplete={handleComplete}
              onStartSession={handleStart}
              onPress={handlePress}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="leaf-outline" size={28} color={theme.colors.success} />
              </View>
              <Text style={styles.emptyTitle}>A clear day</Text>
              <Text style={styles.emptyText}>Add one thing you&apos;d like to get done today.</Text>
              <Button
                variant="primary"
                onPress={() => router.push('/today/add-task')}
                style={{ marginTop: 16 }}
                fullWidth={false}
              >
                Add a task
              </Button>
            </View>
          }
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={theme.colors.accent} />
          }
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(theme: TractionTheme) {
  const card =
    theme.mode === 'light' ? theme.shadows.card : { borderWidth: 1, borderColor: theme.colors.border };
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    date: { ...theme.typography.labelSm, fontWeight: '600', color: theme.colors.textSubtle },
    greeting: { ...theme.typography.displayLgMobile, color: theme.colors.text, marginTop: 2 },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    moodCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      borderRadius: theme.radius.lg,
      marginTop: 16,
    },
    moodIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moodTitle: { ...theme.typography.bodyMd, fontWeight: '600', color: theme.colors.text },
    moodText: { ...theme.typography.labelSm, color: theme.colors.textMuted, marginTop: 2 },
    actions: { flexDirection: 'row', gap: 8, marginTop: 16 },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 9,
      paddingHorizontal: 13,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surfaceSoft,
    },
    actionText: { ...theme.typography.labelSm, fontWeight: '600', color: theme.colors.text },
    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginTop: 24,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    sectionTitle: { ...theme.typography.titleMd, color: theme.colors.text },
    sectionMeta: { ...theme.typography.labelSm, color: theme.colors.textSubtle },
    task: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      ...card,
    },
    taskDone: {
      backgroundColor: 'transparent',
      shadowOpacity: 0,
      elevation: 0,
      borderWidth: 0,
    },
    check: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: theme.colors.textSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkDone: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
    taskTitle: { ...theme.typography.bodyLg, fontWeight: '600', color: theme.colors.text },
    taskTitleDone: { fontWeight: '400', color: theme.colors.textSubtle, textDecorationLine: 'line-through' },
    pills: { flexDirection: 'row', gap: 6, marginTop: 6 },
    pill: {
      ...theme.typography.labelSm,
      fontSize: 12,
      fontWeight: '600',
      paddingVertical: 3,
      paddingHorizontal: 9,
      borderRadius: theme.radius.full,
      overflow: 'hidden',
    },
    pillBlue: { backgroundColor: theme.colors.accentMuted, color: theme.colors.accentText },
    pillClay: { backgroundColor: theme.colors.warningSurface, color: theme.colors.warningText },
    play: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: 2,
    },
    empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.successSurface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    emptyTitle: { ...theme.typography.titleMd, color: theme.colors.text, textAlign: 'center' },
    emptyText: { ...theme.typography.bodyMd, color: theme.colors.textMuted, textAlign: 'center', marginTop: 4 },
  });
}
