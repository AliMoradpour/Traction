import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useSimplifyTask } from '@/hooks/useTasks';
import { TaskStep } from '@/services/task.service';

export default function SimplifyScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const theme = useTractionTheme();
  const router = useRouter();
  const simplifyTask = useSimplifyTask();
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleLoadSteps = async () => {
    if (!taskId) return;
    try {
      const result = await simplifyTask.mutateAsync(taskId);
      setSteps(result);
      setHasLoaded(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to simplify task. Please try again.');
    }
  };

  const toggleStep = (stepId: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, status: step.status === 'completed' ? 'pending' : 'completed' } : step
      )
    );
  };

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const totalMinutes = steps.reduce((acc, step) => acc + step.durationMinutes, 0);

  const handleApply = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>AI Simplification</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!hasLoaded && !simplifyTask.isPending ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: theme.colors.textMuted }]}>✨</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Break this task down</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
              Let AI split this task into manageable micro-steps
            </Text>
            <Button variant="primary" onPress={handleLoadSteps} style={{ marginTop: 16 }}>
              Simplify Task
            </Button>
          </View>
        ) : simplifyTask.isPending ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Analyzing task...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Broken down for you</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
                Your task has been split into manageable micro-steps
              </Text>
            </View>

            <View style={[styles.statsCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>{completedCount}/{steps.length}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Steps</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>{totalMinutes}m</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Total Effort</Text>
              </View>
            </View>

            <View style={[styles.aiCard, { backgroundColor: theme.colors.accentMuted }]}>
              <View style={styles.aiHeader}>
                <Text style={styles.aiIcon}>✨</Text>
                <Text style={[styles.aiTitle, { color: theme.colors.accentText }]}>AI Insight</Text>
              </View>
              <Text style={[styles.aiContent, { color: theme.colors.accentText }]}>
                Breaking this into {steps.length} smaller steps reduces cognitive load. Start with the first step
                to build momentum.
              </Text>
            </View>

            <View style={styles.stepsList}>
              {steps.map((step, index) => {
                const isCompleted = step.status === 'completed';
                return (
                  <Pressable
                    key={step.id}
                    style={[
                      styles.stepCard,
                      {
                        backgroundColor: isCompleted ? theme.colors.successMuted : theme.colors.surfaceElevated,
                        borderColor: isCompleted ? theme.colors.success : theme.colors.border,
                      },
                    ]}
                    onPress={() => toggleStep(step.id)}
                  >
                    <View style={styles.stepLeft}>
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isCompleted ? theme.colors.success : 'transparent',
                            borderColor: isCompleted ? theme.colors.success : theme.colors.border,
                          },
                        ]}
                      >
                        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={styles.stepContent}>
                        <Text
                          style={[
                            styles.stepTitle,
                            {
                              color: isCompleted ? theme.colors.textMuted : theme.colors.text,
                              textDecorationLine: isCompleted ? 'line-through' : 'none',
                            },
                          ]}
                        >
                          {step.title}
                        </Text>
                        <Text style={[styles.stepEffort, { color: theme.colors.textMuted }]}>⏱ {step.durationMinutes}m</Text>
                      </View>
                    </View>
                    <Text style={[styles.stepNumber, { color: theme.colors.textSubtle }]}>#{index + 1}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.actions}>
              <Button variant="primary" onPress={handleApply}>
                Apply Simplified Steps
              </Button>
              <Pressable onPress={() => router.back()}>
                <Text style={[styles.cancelText, { color: theme.colors.textMuted }]}>Cancel</Text>
              </Pressable>
            </View>
          </>
        )}
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  statsCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
  },
  aiCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiIcon: {
    fontSize: 18,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  aiContent: {
    fontSize: 15,
    lineHeight: 20,
  },
  stepsList: {
    gap: 8,
    marginBottom: 24,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  stepEffort: {
    fontSize: 11,
    fontWeight: '500',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    gap: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
