import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useGoal, useDeleteGoal, useArchiveGoal, useGoalMilestones } from '@/hooks/useGoals';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

const HEALTH_COLORS: Record<string, string> = {
  ON_TRACK: '#10B981',
  SLIGHTLY_BEHIND: '#F59E0B',
  BEHIND_SCHEDULE: '#F97316',
  RECOVERY_NEEDED: '#EF4444',
  AT_RISK: '#EF4444',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: '#DBEAFE', text: '#1D4ED8' },
  COMPLETED: { bg: '#D1FAE5', text: '#065F46' },
  PAUSED: { bg: '#FEF3C7', text: '#92400E' },
  ARCHIVED: { bg: '#F3F4F6', text: '#374151' },
};

const TYPE_COLORS: Record<string, string> = {
  IELTS: '#3B82F6',
  PROGRAMMING: '#8B5CF6',
  FITNESS: '#10B981',
  SAVINGS: '#F59E0B',
  CUSTOM: '#6B7280',
};

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDaysRemaining(targetDate?: string): number | null {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getProgressTone(progress: number): 'accent' | 'success' | 'warning' | 'danger' {
  if (progress >= 100) return 'success';
  if (progress >= 70) return 'accent';
  if (progress >= 40) return 'warning';
  return 'danger';
}

export default function GoalDetailScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const { data: goal, isLoading, isError } = useGoal(goalId || '');
  const deleteGoal = useDeleteGoal();
  const archiveGoal = useArchiveGoal();
  const { data: milestones } = useGoalMilestones(goalId || '');

  const [showMilestones, setShowMilestones] = useState(false);

  const handleDelete = () => {
    if (!goalId) return;
    Alert.alert('Delete Goal', 'Are you sure you want to delete this goal? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteGoal.mutate(goalId, {
            onSuccess: () => router.back(),
            onError: (error: any) => Alert.alert('Error', error?.message || 'Failed to delete goal'),
          });
        },
      },
    ]);
  };

  const handleArchive = () => {
    if (!goalId) return;
    Alert.alert('Archive Goal', 'Are you sure you want to archive this goal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: () => {
          archiveGoal.mutate(goalId, {
            onSuccess: () => Alert.alert('Success', 'Goal archived'),
            onError: (error: any) => Alert.alert('Error', error?.message || 'Failed to archive goal'),
          });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !goal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Goal Details</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>Goal not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const daysRemaining = getDaysRemaining(goal.targetDate);
  const healthColor = HEALTH_COLORS[goal.health] || '#6B7280';
  const statusStyle = STATUS_COLORS[goal.status] || STATUS_COLORS.ACTIVE;
  const typeColor = TYPE_COLORS[goal.type] || TYPE_COLORS.CUSTOM;
  const completedMilestones = milestones?.filter((m) => m.status === 'COMPLETED').length || 0;
  const totalMilestones = milestones?.length || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Goal Details</Text>
        <Pressable onPress={() => router.push(`/(app)/goals/${goalId}/edit` as any)}>
          <Text style={[styles.editButton, { color: theme.colors.primary }]}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{goal.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.typeText}>{goal.type}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>Progress</Text>
            <Text style={[styles.progressValue, { color: theme.colors.text }]}>{goal.progress}%</Text>
          </View>
          <ProgressBar value={goal.progress} tone={getProgressTone(goal.progress)} height={8} />
        </View>

        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <View style={[styles.badgeDot, { backgroundColor: statusStyle.text }]} />
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>{goal.status}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: healthColor + '20' }]}>
            <View style={[styles.badgeDot, { backgroundColor: healthColor }]} />
            <Text style={[styles.badgeText, { color: healthColor }]}>
              {goal.health.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        {goal.description ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>DESCRIPTION</Text>
            <Text style={[styles.description, { color: theme.colors.text }]}>{goal.description}</Text>
          </View>
        ) : null}

        {goal.category ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>CATEGORY</Text>
            <Text style={[styles.categoryText, { color: theme.colors.text }]}>{goal.category}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>TIMELINE</Text>
          <View style={styles.timelineRow}>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: theme.colors.textSubtle }]}>Start</Text>
              <Text style={[styles.timelineValue, { color: theme.colors.text }]}>
                {formatDate(goal.startDate)}
              </Text>
            </View>
            <Text style={[styles.timelineArrow, { color: theme.colors.textSubtle }]}>→</Text>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: theme.colors.textSubtle }]}>Target</Text>
              <Text style={[styles.timelineValue, { color: theme.colors.text }]}>
                {formatDate(goal.targetDate) || 'No target'}
              </Text>
            </View>
          </View>
          {daysRemaining !== null && (
            <Text
              style={[
                styles.daysRemaining,
                { color: daysRemaining < 0 ? theme.colors.danger : theme.colors.textMuted },
              ]}
            >
              {daysRemaining < 0
                ? `${Math.abs(daysRemaining)} days overdue`
                : `${daysRemaining} days remaining`}
            </Text>
          )}
        </View>

        {goal.velocity ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>VELOCITY</Text>
            <View style={styles.velocityRow}>
              <Text style={[styles.velocityIcon, { color: theme.colors.text }]}>
                {goal.velocity === 'INCREASING' ? '↑' : goal.velocity === 'DECREASING' ? '↓' : '→'}
              </Text>
              <Text style={[styles.velocityText, { color: theme.colors.text }]}>{goal.velocity}</Text>
            </View>
          </View>
        ) : null}

        {totalMilestones > 0 ? (
          <Pressable
            style={[styles.section, styles.milestoneToggle]}
            onPress={() => setShowMilestones(!showMilestones)}
          >
            <View style={styles.milestoneHeader}>
              <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>MILESTONES</Text>
              <Text style={[styles.milestoneCount, { color: theme.colors.primary }]}>
                {completedMilestones}/{totalMilestones} completed
              </Text>
            </View>
            <Text style={[styles.expandIcon, { color: theme.colors.textMuted }]}>
              {showMilestones ? '▲' : '▼'}
            </Text>
          </Pressable>
        ) : null}

        {showMilestones && milestones ? (
          <View style={styles.milestonesList}>
            {milestones.map((milestone) => {
              const isCompleted = milestone.status === 'COMPLETED';
              const milestoneProgress = milestone.progress;
              return (
                <View
                  key={milestone.id}
                  style={[
                    styles.milestoneCard,
                    { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
                  ]}
                >
                  <View style={styles.milestoneTop}>
                    <View style={[styles.milestoneStatusDot, { backgroundColor: isCompleted ? theme.colors.success : theme.colors.textSubtle }]} />
                    <Text
                      style={[
                        styles.milestoneTitle,
                        { color: theme.colors.text },
                        isCompleted && styles.milestoneTitleCompleted,
                      ]}
                    >
                      {milestone.title}
                    </Text>
                    <Text style={[styles.milestoneProgress, { color: theme.colors.textMuted }]}>
                      {milestoneProgress}%
                    </Text>
                  </View>
                  {milestone.targetDate ? (
                    <Text style={[styles.milestoneDate, { color: theme.colors.textSubtle }]}>
                      Due: {formatDate(milestone.targetDate)}
                    </Text>
                  ) : null}
                  <ProgressBar value={milestoneProgress} tone={isCompleted ? 'success' : 'accent'} height={4} />
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.actionsSection}>
          <Button
            variant="secondary"
            onPress={() => router.push(`/(app)/goals/${goalId}/milestones` as any)}
            title="View Milestones"
          />
          <Button
            variant="secondary"
            onPress={() => router.push(`/(app)/goals/${goalId}/projection` as any)}
            title="View Projection"
          />
          <Button variant="secondary" onPress={handleArchive} title="Archive Goal" />
          <Button variant="danger" onPress={handleDelete} title="Delete Goal" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  editButton: {
    fontSize: 15,
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 17,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 6,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '500',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  timelineItem: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  timelineArrow: {
    fontSize: 18,
    marginTop: 12,
  },
  daysRemaining: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  velocityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  velocityIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  velocityText: {
    fontSize: 15,
    fontWeight: '500',
  },
  milestoneToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  milestoneCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 12,
  },
  milestonesList: {
    gap: 10,
    marginBottom: 12,
  },
  milestoneCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  milestoneTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  milestoneStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  milestoneTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  milestoneTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  milestoneProgress: {
    fontSize: 12,
    fontWeight: '500',
  },
  milestoneDate: {
    fontSize: 12,
  },
  actionsSection: {
    marginTop: 20,
    gap: 12,
  },
});
