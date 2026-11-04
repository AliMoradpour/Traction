import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { useTasks } from '@/hooks/useTasks';
import { localDayStartISO } from '@/lib/dates';
import type { Task } from '@/services/task.service';
import { type TractionTheme, useTractionTheme } from '@/theme';

export default function FocusStartScreen() {
  const theme = useTractionTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { data: tasks, isLoading } = useTasks({ scheduledDate: localDayStartISO() });
  const open = (tasks ?? []).filter((t) => t.status !== 'COMPLETED');

  const renderTask = ({ item }: { item: Task }) => (
    <Pressable
      style={({ pressed }) => [styles.task, pressed && styles.pressed]}
      onPress={() => router.push(`/focus/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Start focusing on ${item.title}`}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        {item.duration ? <Text style={styles.taskMeta}>{item.duration} min</Text> : null}
      </View>
      <View style={styles.play}>
        <Ionicons name="play" size={18} color={theme.colors.textInverse} />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Focus</Text>
        <Text style={styles.subtitle}>Pick one thing and give it your full attention.</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.accent} style={{ marginTop: 48 }} />
      ) : open.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="leaf-outline" size={30} color={theme.colors.success} />
          </View>
          <Text style={styles.emptyTitle}>Nothing waiting for you</Text>
          <Text style={styles.emptyText}>Add a task for today, then come back here to start.</Text>
          <Button variant="primary" style={{ marginTop: theme.spacing.lg }} onPress={() => router.push('/today/add-task')}>
            Add a task
          </Button>
        </View>
      ) : (
        <FlatList
          data={open}
          keyExtractor={(t) => t.id}
          renderItem={renderTask}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(theme: TractionTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
    title: { ...theme.typography.displayLgMobile, color: theme.colors.text },
    subtitle: { ...theme.typography.bodyMd, color: theme.colors.textMuted, marginTop: 4 },
    list: { paddingHorizontal: 20, paddingBottom: 32 },
    task: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      ...(theme.mode === 'light' ? theme.shadows.card : { borderWidth: 1, borderColor: theme.colors.border }),
    },
    pressed: { opacity: 0.85 },
    taskTitle: { ...theme.typography.bodyLg, fontWeight: '600', color: theme.colors.text },
    taskMeta: { ...theme.typography.labelSm, color: theme.colors.textSubtle, marginTop: 2 },
    play: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: 2,
    },
    empty: { alignItems: 'center', paddingHorizontal: 32, marginTop: 64 },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.successSurface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyTitle: { ...theme.typography.titleMd, color: theme.colors.text },
    emptyText: { ...theme.typography.bodyMd, color: theme.colors.textMuted, textAlign: 'center', marginTop: 6 },
  });
}
