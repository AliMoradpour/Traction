import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import Button from '@/components/ui/Button';

const MOCK_TASKS = [
  { id: '1', title: 'Quarterly growth review' },
  { id: '2', title: 'Client onboarding flow' },
  { id: '3', title: 'Inbox zero sprint' },
  { id: '4', title: 'Design system audit' },
  { id: '5', title: 'Weekly retro notes' },
];

const DELAY_REASONS = [
  { id: '1', label: 'Time miscalc', icon: '⏱' },
  { id: '2', label: 'Focus energy', icon: '⚡' },
  { id: '3', label: 'Blockers', icon: '🚧' },
  { id: '4', label: 'Self-care skip', icon: '☕' },
];

export default function ReflectionScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [pendingTasks, setPendingTasks] = useState<string[]>([]);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const toggleCompleted = (taskId: string) => {
    setCompletedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const togglePending = (taskId: string) => {
    setPendingTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete reflection
      router.back();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: theme.colors.surfaceElevated }]}>
          <Text style={[styles.closeIcon, { color: theme.colors.text }]}>✕</Text>
        </Pressable>
        <View style={styles.progressDots}>
          {[1, 2, 3].map((step) => (
            <View
              key={step}
              style={[
                styles.dot,
                {
                  backgroundColor: step <= currentStep ? theme.colors.primary : theme.colors.surfaceMuted,
                  width: step === currentStep ? 16 : 8,
                },
              ]}
            />
          ))}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {currentStep === 1 && (
          <View style={styles.step}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>What did you complete?</Text>
              <Text style={[styles.stepSubtitle, { color: theme.colors.textMuted }]}>
                Every win counts. Select your finished tasks.
              </Text>
            </View>
            <View style={styles.taskList}>
              {MOCK_TASKS.map((task) => (
                <Pressable
                  key={task.id}
                  style={[
                    styles.taskChip,
                    {
                      backgroundColor: completedTasks.includes(task.id)
                        ? theme.colors.primary
                        : theme.colors.surfaceElevated,
                      borderColor: completedTasks.includes(task.id)
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                  onPress={() => toggleCompleted(task.id)}
                >
                  <Text
                    style={[
                      styles.taskChipText,
                      {
                        color: completedTasks.includes(task.id) ? '#FFFFFF' : theme.colors.text,
                      },
                    ]}
                  >
                    {task.title}
                  </Text>
                  {completedTasks.includes(task.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.step}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>What stayed pending?</Text>
              <Text style={[styles.stepSubtitle, { color: theme.colors.textMuted }]}>
                It's okay. Let's identify the carry-overs.
              </Text>
            </View>
            <View style={styles.taskList}>
              {MOCK_TASKS.map((task) => (
                <Pressable
                  key={task.id}
                  style={[
                    styles.taskChip,
                    {
                      backgroundColor: pendingTasks.includes(task.id)
                        ? theme.colors.primary
                        : theme.colors.surfaceElevated,
                      borderColor: pendingTasks.includes(task.id)
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                  onPress={() => togglePending(task.id)}
                >
                  <Text
                    style={[
                      styles.taskChipText,
                      {
                        color: pendingTasks.includes(task.id) ? '#FFFFFF' : theme.colors.text,
                      },
                    ]}
                  >
                    {task.title}
                  </Text>
                  {pendingTasks.includes(task.id) && (
                    <Text style={styles.pauseIcon}>⏸</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.step}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Why the delay?</Text>
              <Text style={[styles.stepSubtitle, { color: theme.colors.textMuted }]}>
                Understanding the friction helps us adjust.
              </Text>
            </View>
            <View style={styles.reasonGrid}>
              {DELAY_REASONS.map((reason) => (
                <Pressable
                  key={reason.id}
                  style={[
                    styles.reasonCard,
                    {
                      backgroundColor: selectedReason === reason.id
                        ? theme.colors.primary
                        : theme.colors.surfaceElevated,
                      borderColor: selectedReason === reason.id
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                  onPress={() => setSelectedReason(reason.id)}
                >
                  <Text style={styles.reasonIcon}>{reason.icon}</Text>
                  <Text
                    style={[
                      styles.reasonLabel,
                      {
                        color: selectedReason === reason.id ? '#FFFFFF' : theme.colors.text,
                      },
                    ]}
                  >
                    {reason.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={[styles.noteInput, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a quick note (optional)..."
              placeholderTextColor={theme.colors.textSubtle}
              multiline
              numberOfLines={3}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <Pressable onPress={handleBack}>
            <Text style={[styles.backText, { color: theme.colors.textMuted }]}>Back</Text>
          </Pressable>
        )}
        <Button variant="primary" onPress={handleContinue} style={styles.continueButton}>
          {currentStep === 3 ? 'Finish Day' : 'Continue'}
        </Button>
      </View>
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '500',
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  step: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  taskList: {
    gap: 8,
  },
  taskChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  taskChipText: {
    fontSize: 17,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  pauseIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  reasonCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  reasonIcon: {
    fontSize: 24,
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
  continueButton: {
    minWidth: 140,
  },
});
