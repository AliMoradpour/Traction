import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import {
  useGoalMilestones,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
} from '@/hooks/useGoals';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#F3F4F6', text: '#374151' },
  IN_PROGRESS: { bg: '#DBEAFE', text: '#1D4ED8' },
  COMPLETED: { bg: '#D1FAE5', text: '#065F46' },
  SKIPPED: { bg: '#FEF3C7', text: '#92400E' },
};

export default function MilestonesScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const { data: milestones, isLoading } = useGoalMilestones(goalId || '');
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');

  const completedCount = milestones?.filter((m) => m.status === 'COMPLETED').length || 0;
  const totalCount = milestones?.length || 0;
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCreate = () => {
    if (!goalId) return;
    if (!newTitle.trim()) {
      Alert.alert('Validation', 'Milestone title is required');
      return;
    }

    createMilestone.mutate(
      {
        goalId,
        data: {
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          targetDate: newTargetDate || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setNewTitle('');
          setNewDescription('');
          setNewTargetDate('');
        },
        onError: (error: any) => Alert.alert('Error', error?.message || 'Failed to create milestone'),
      }
    );
  };

  const handleToggleStatus = (milestoneId: string, currentStatus: string) => {
    if (!goalId) return;
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    updateMilestone.mutate({
      goalId,
      milestoneId,
      data: { status: newStatus as any },
    });
  };

  const handleDelete = (milestoneId: string) => {
    if (!goalId) return;
    Alert.alert('Delete Milestone', 'Are you sure you want to delete this milestone?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteMilestone.mutate({ goalId, milestoneId });
        },
      },
    ]);
  };

  const startEdit = (milestone: any) => {
    setEditingMilestone(milestone.id);
    setNewTitle(milestone.title || '');
    setNewDescription(milestone.description || '');
    setNewTargetDate(milestone.targetDate ? milestone.targetDate.split('T')[0] : '');
  };

  const handleUpdate = () => {
    if (!goalId || !editingMilestone) return;
    if (!newTitle.trim()) {
      Alert.alert('Validation', 'Milestone title is required');
      return;
    }

    updateMilestone.mutate(
      {
        goalId,
        milestoneId: editingMilestone,
        data: {
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          targetDate: newTargetDate || undefined,
        },
      },
      {
        onSuccess: () => {
          setEditingMilestone(null);
          setNewTitle('');
          setNewDescription('');
          setNewTargetDate('');
        },
        onError: (error: any) => Alert.alert('Error', error?.message || 'Failed to update milestone'),
      }
    );
  };

  const cancelModal = () => {
    setShowCreateModal(false);
    setEditingMilestone(null);
    setNewTitle('');
    setNewDescription('');
    setNewTargetDate('');
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Milestones</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.colors.text }]}>Overall Progress</Text>
            <Text style={[styles.progressValue, { color: theme.colors.text }]}>{overallProgress}%</Text>
          </View>
          <ProgressBar value={overallProgress} tone={overallProgress >= 100 ? 'success' : 'accent'} height={8} />
          <Text style={[styles.progressDetail, { color: theme.colors.textMuted }]}>
            {completedCount} of {totalCount} milestones completed
          </Text>
        </View>

        {milestones && milestones.length > 0 ? (
          <View style={styles.milestonesList}>
            {milestones.map((milestone) => {
              const isCompleted = milestone.status === 'COMPLETED';
              const statusStyle = STATUS_COLORS[milestone.status] || STATUS_COLORS.PENDING;
              return (
                <View
                  key={milestone.id}
                  style={[
                    styles.milestoneCard,
                    { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
                  ]}
                >
                  <View style={styles.milestoneHeader}>
                    <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
                    <Text
                      style={[
                        styles.milestoneTitle,
                        { color: theme.colors.text },
                        isCompleted && styles.milestoneTitleCompleted,
                      ]}
                    >
                      {milestone.title}
                    </Text>
                    <Text style={[styles.milestoneProgressText, { color: theme.colors.textMuted }]}>
                      {milestone.progress}%
                    </Text>
                  </View>

                  {milestone.description ? (
                    <Text style={[styles.milestoneDescription, { color: theme.colors.textMuted }]}>
                      {milestone.description}
                    </Text>
                  ) : null}

                  <ProgressBar value={milestone.progress} tone={isCompleted ? 'success' : 'accent'} height={4} />

                  <View style={styles.milestoneFooter}>
                    {milestone.targetDate ? (
                      <Text style={[styles.milestoneDate, { color: theme.colors.textSubtle }]}>
                        Due: {formatDate(milestone.targetDate)}
                      </Text>
                    ) : (
                      <View />
                    )}
                    <View style={styles.milestoneActions}>
                      <Pressable
                        style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceSoft }]}
                        onPress={() => handleToggleStatus(milestone.id, milestone.status)}
                      >
                        <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>
                          {isCompleted ? 'Undo' : 'Complete'}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceSoft }]}
                        onPress={() => startEdit(milestone)}
                      >
                        <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>Edit</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.actionBtn, { backgroundColor: theme.colors.dangerSurface || '#FEE2E2' }]}
                        onPress={() => handleDelete(milestone.id)}
                      >
                        <Text style={[styles.actionBtnText, { color: theme.colors.danger }]}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: theme.colors.textMuted }]}>🎯</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No milestones yet</Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textMuted }]}>
              Break your goal into smaller milestones to track progress.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="primary" onPress={() => setShowCreateModal(true)} title="+ Add Milestone" />
      </View>

      <Modal
        visible={showCreateModal || editingMilestone !== null}
        title={editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
        onClose={cancelModal}
        footer={
          <Button
            variant="primary"
            onPress={editingMilestone ? handleUpdate : handleCreate}
            loading={createMilestone.isPending || updateMilestone.isPending}
            title={editingMilestone ? 'Update' : 'Create'}
          />
        }
      >
        <View style={styles.modalField}>
          <Text style={[styles.modalLabel, { color: theme.colors.textMuted }]}>TITLE</Text>
          <TextInput
            style={[
              styles.modalInput,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Milestone title"
            placeholderTextColor={theme.colors.textSubtle}
          />
        </View>
        <View style={styles.modalField}>
          <Text style={[styles.modalLabel, { color: theme.colors.textMuted }]}>DESCRIPTION</Text>
          <TextInput
            style={[
              styles.modalInput,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={newDescription}
            onChangeText={setNewDescription}
            placeholder="Optional description"
            placeholderTextColor={theme.colors.textSubtle}
          />
        </View>
        <View style={styles.modalField}>
          <Text style={[styles.modalLabel, { color: theme.colors.textMuted }]}>TARGET DATE (YYYY-MM-DD)</Text>
          <TextInput
            style={[
              styles.modalInput,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={newTargetDate}
            onChangeText={setNewTargetDate}
            placeholder="2025-12-31"
            placeholderTextColor={theme.colors.textSubtle}
          />
        </View>
      </Modal>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    marginBottom: 20,
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressDetail: {
    fontSize: 13,
    fontWeight: '500',
  },
  milestonesList: {
    gap: 12,
  },
  milestoneCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  milestoneTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  milestoneTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  milestoneProgressText: {
    fontSize: 13,
    fontWeight: '500',
  },
  milestoneDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  milestoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  milestoneDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  milestoneActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
  },
  modalField: {
    gap: 6,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
});
