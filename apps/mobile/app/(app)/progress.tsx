import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useExecutionStats, useMomentum } from '@/hooks/useExecution';
import { type TractionTheme, useTractionTheme } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const SECTIONS: { title: string; detail: string; icon: IconName; href: Href }[] = [
  { title: 'Suggestions', detail: 'Ideas based on how you work', icon: 'bulb-outline', href: '/insights' },
  { title: 'Habits and patterns', detail: 'Consistency, procrastination, burnout', icon: 'pulse-outline', href: '/behavior' },
  { title: 'Momentum', detail: 'Readiness, streaks and resistance', icon: 'trending-up-outline', href: '/execution' },
  { title: 'Weekly review', detail: 'Wins, lessons and next week', icon: 'calendar-outline', href: '/insights/weekly-review' },
];

export default function ProgressScreen() {
  const theme = useTractionTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { data: stats } = useExecutionStats();
  const { data: momentum } = useMomentum();

  const tiles = [
    { label: 'Done this week', value: stats ? String(stats.tasksCompleted.thisWeek) : '–', tint: theme.colors.successSurface },
    { label: 'Focus this week', value: stats ? `${stats.focusTime.thisWeek}m` : '–', tint: theme.colors.accentMuted },
    { label: 'Day streak', value: momentum ? String(momentum.currentStreak) : '–', tint: theme.colors.warningSurface },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Small steps add up. Here&apos;s how your week is going.</Text>

        <View style={styles.tiles}>
          {tiles.map((t) => (
            <View key={t.label} style={[styles.tile, { backgroundColor: t.tint }]}>
              <Text style={styles.tileValue}>{t.value}</Text>
              <Text style={styles.tileLabel}>{t.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.group}>
          {SECTIONS.map((s, i) => (
            <Pressable
              key={s.title}
              onPress={() => router.push(s.href)}
              style={({ pressed }) => [styles.row, i > 0 && styles.rowDivider, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
            >
              <View style={styles.rowIcon}>
                <Ionicons name={s.icon} size={20} color={theme.colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{s.title}</Text>
                <Text style={styles.rowDetail}>{s.detail}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textSubtle} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: TractionTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
    title: { ...theme.typography.displayLgMobile, color: theme.colors.text },
    subtitle: { ...theme.typography.bodyMd, color: theme.colors.textMuted, marginTop: 4 },
    tiles: { flexDirection: 'row', gap: 10, marginTop: 20 },
    tile: { flex: 1, borderRadius: theme.radius.lg, paddingVertical: 16, paddingHorizontal: 12 },
    tileValue: { ...theme.typography.headlineMd, color: theme.colors.text },
    tileLabel: { ...theme.typography.labelSm, color: theme.colors.textMuted, marginTop: 2 },
    group: {
      marginTop: 24,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
      ...(theme.mode === 'light' ? theme.shadows.card : { borderWidth: 1, borderColor: theme.colors.border }),
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16 },
    rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowTitle: { ...theme.typography.bodyLg, fontWeight: '600', color: theme.colors.text },
    rowDetail: { ...theme.typography.labelSm, color: theme.colors.textMuted, marginTop: 1 },
  });
}
