import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Modal, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useTask } from '@/hooks/useTasks';
import {
  useStartFocusSession,
  useCompleteFocusSession,
  usePauseFocusSession,
  useResumeFocusSession,
  useCancelFocusSession,
  useActiveFocusSession,
} from '@/hooks/useFocus';
import { useReadinessScore } from '@/hooks/useExecution';
import { useBehaviorIndicators } from '@/hooks/useBehavior';
import { behaviorService } from '@/services';

const RESISTANCE_REASONS = [
  'Task feels too large',
  "I don't know where to start",
  'Low energy',
  'Distracted',
  'Not interested',
];

const RESISTANCE_RECOMMENDATIONS: Record<string, string> = {
  'Task feels too large': 'Break this task into 3 tiny sub-steps. Just focus on step one for now.',
  "I don't know where to start": "Start with a 5-minute 'messy' draft. No pressure for perfection.",
  'Low energy': 'Switch to a low-energy variant of this task or take a 2-minute breath break.',
  'Distracted': "Clear your physical workspace. Let's restart the timer for 10 focus minutes.",
  'Not interested': "Connect this to your 'Why'. Completing this unlocks your evening freedom.",
};

function calculateAdaptiveDuration(
  readinessScore: number,
  momentumScore: number,
  resistanceScore: number
): number {
  const hour = new Date().getHours();
  const isEvening = hour >= 18;
  const isAfternoon = hour >= 13 && hour < 18;

  let base: number;
  if (readinessScore > 80 && momentumScore >= 60) {
    base = 50;
  } else if (readinessScore > 60) {
    base = 37;
  } else if (readinessScore > 40) {
    base = 25;
  } else {
    base = 17;
  }

  if (resistanceScore > 60) {
    base = Math.min(base, 20);
  }

  if (isEvening) {
    base = Math.round(base * 0.7);
  } else if (isAfternoon) {
    base = Math.round(base * 0.85);
  }

  return Math.max(10, Math.min(60, Math.round(base / 5) * 5));
}

export default function FocusSessionScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const theme = useTractionTheme();
  const router = useRouter();

  const { data: task } = useTask(taskId ?? '');
  const { data: activeSession } = useActiveFocusSession();
  const { data: readiness } = useReadinessScore();
  const { data: indicators } = useBehaviorIndicators();
  const startSession = useStartFocusSession();
  const completeSession = useCompleteFocusSession();
  const pauseSession = usePauseFocusSession();
  const resumeSession = useResumeFocusSession();
  const cancelSession = useCancelFocusSession();

  const adaptiveDurationMin = useMemo(() => {
    const readinessScore = readiness?.score ?? 50;
    const momentumScore = indicators?.momentumScore ?? 50;
    const resistanceScore = 50;
    return calculateAdaptiveDuration(readinessScore, momentumScore, resistanceScore);
  }, [readiness, indicators]);

  const [timeLeft, setTimeLeft] = useState(adaptiveDurationMin * 60);
  const [isActive, setIsActive] = useState(false);
  const [showResistanceModal, setShowResistanceModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showDurationConfirm, setShowDurationConfirm] = useState(false);
  const [confirmedDuration, setConfirmedDuration] = useState(adaptiveDurationMin);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (activeSession && activeSession.taskId === taskId) {
      if (activeSession.status === 'PAUSED' || activeSession.status === 'ACTIVE') {
        const started = new Date(activeSession.startedAt).getTime();
        const elapsed = Date.now() - started;
        if (elapsed > 5 * 60 * 1000) {
          router.replace(`/focus/${taskId}/recovery`);
          return;
        }
      }
      setSessionId(activeSession.id);
      setIsActive(activeSession.status === 'ACTIVE');
      setShowDurationConfirm(false);
    }
  }, [activeSession, taskId, router]);

  const handleStartSession = useCallback(async () => {
    setShowDurationConfirm(true);
  }, []);

  const handleConfirmDuration = useCallback(async () => {
    setShowDurationConfirm(false);
    setTimeLeft(confirmedDuration * 60);
    try {
      const session = await startSession.mutateAsync(taskId);
      setSessionId(session.id);
      setIsActive(true);
      behaviorService.track({ type: 'FOCUS_STARTED', taskId, focusSessionId: session.id });
    } catch (error) {
      Alert.alert('Error', 'Failed to start focus session');
    }
  }, [startSession, taskId, confirmedDuration]);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = confirmedDuration * 60;
    return (total - timeLeft) / total;
  };

  const handleComplete = async () => {
    if (!sessionId) return;
    try {
      setIsActive(false);
      await completeSession.mutateAsync(sessionId);
      behaviorService.track({ type: 'FOCUS_COMPLETED', taskId, focusSessionId: sessionId });
      Alert.alert('Session Complete', 'Great work! You completed the focus session.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete focus session');
    }
  };

  const handlePause = async () => {
    if (!sessionId) return;
    try {
      setIsActive(false);
      await pauseSession.mutateAsync(sessionId);
    } catch (error) {
      Alert.alert('Error', 'Failed to pause focus session');
    }
  };

  const handleResume = async () => {
    if (!sessionId) return;
    try {
      setIsActive(true);
      await resumeSession.mutateAsync(sessionId);
    } catch (error) {
      Alert.alert('Error', 'Failed to resume focus session');
    }
  };

  const handleCancelSession = async () => {
    if (!sessionId) return;
    try {
      setIsActive(false);
      await cancelSession.mutateAsync(sessionId);
      behaviorService.track({ type: 'FOCUS_ABANDONED', taskId, focusSessionId: sessionId });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel focus session');
    }
  };

  const handleResistance = (reason: string) => {
    setSelectedReason(reason);
    setShowResistanceModal(false);
    setAiInsight(RESISTANCE_RECOMMENDATIONS[reason] || '');
    behaviorService.track({ type: 'WHY_AM_I_STUCK', taskId, metadata: reason, focusSessionId: sessionId ?? undefined });
  };

  const taskTitle = task?.title ?? 'Loading...';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: theme.colors.surfaceElevated }]}>
          <Text style={[styles.closeIcon, { color: theme.colors.text }]}>✕</Text>
        </Pressable>
        <View style={[styles.sessionBadge, { backgroundColor: theme.colors.surfaceElevated }]}>
          <View style={[styles.pulseDot, { backgroundColor: theme.colors.error }]} />
          <Text style={[styles.sessionLabel, { color: theme.colors.text }]}>FOCUS SESSION</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {!sessionId ? (
          <>
            <View style={styles.objectiveSection}>
              <Text style={[styles.objectiveLabel, { color: theme.colors.textMuted }]}>CURRENT OBJECTIVE</Text>
              <Text style={[styles.objectiveTitle, { color: theme.colors.text }]}>{taskTitle}</Text>
            </View>

            {showDurationConfirm ? (
              <View style={styles.durationConfirmContainer}>
                <View style={[styles.durationCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                  <Text style={[styles.durationCardLabel, { color: theme.colors.textMuted }]}>ADAPTIVE SESSION LENGTH</Text>
                  <Text style={[styles.durationCardValue, { color: theme.colors.text }]}>{confirmedDuration} min</Text>
                  <Text style={[styles.durationCardReason, { color: theme.colors.textMuted }]}>
                    {readiness && readiness.score > 80
                      ? 'High readiness — longer session recommended'
                      : readiness && readiness.score > 60
                      ? 'Good readiness — moderate session'
                      : readiness && readiness.score > 40
                      ? 'Moderate readiness — shorter session'
                      : 'Low readiness — brief session recommended'}
                  </Text>
                  <View style={styles.durationAdjust}>
                    <Pressable
                      style={[styles.durationButton, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                      onPress={() => setConfirmedDuration((prev) => Math.max(10, prev - 5))}
                    >
                      <Text style={[styles.durationButtonText, { color: theme.colors.text }]}>-5m</Text>
                    </Pressable>
                    <Text style={[styles.durationValue, { color: theme.colors.text }]}>{confirmedDuration}m</Text>
                    <Pressable
                      style={[styles.durationButton, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                      onPress={() => setConfirmedDuration((prev) => Math.min(60, prev + 5))}
                    >
                      <Text style={[styles.durationButtonText, { color: theme.colors.text }]}>+5m</Text>
                    </Pressable>
                  </View>
                </View>
                <Button
                  variant="primary"
                  onPress={handleConfirmDuration}
                  style={styles.startButton}
                  disabled={startSession.isPending}
                >
                  {startSession.isPending ? 'Starting...' : `▶ START ${confirmedDuration} MIN SESSION`}
                </Button>
                <Pressable onPress={() => setShowDurationConfirm(false)}>
                  <Text style={[styles.cancelConfirmText, { color: theme.colors.textMuted }]}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <Button
                variant="primary"
                onPress={handleStartSession}
                style={styles.startButton}
                disabled={startSession.isPending}
              >
                {startSession.isPending ? 'Starting...' : '▶ START FOCUS SESSION'}
              </Button>
            )}
          </>
        ) : (
          <>
            <View style={styles.objectiveSection}>
              <Text style={[styles.objectiveLabel, { color: theme.colors.textMuted }]}>CURRENT OBJECTIVE</Text>
              <Text style={[styles.objectiveTitle, { color: theme.colors.text }]}>{taskTitle}</Text>
            </View>

            <View style={styles.timerContainer}>
              <View style={[styles.timerRing, { borderColor: theme.colors.surfaceMuted }]}>
                <View
                  style={[
                    styles.timerProgress,
                    {
                      borderColor: theme.colors.primary,
                      transform: [{ rotate: `${getProgress() * 360 - 90}deg` }],
                    },
                  ]}
                />
              </View>
              <Animated.View style={[styles.timerInner, { transform: [{ scale: pulseAnim }] }]}>
                <Text style={[styles.timerText, { color: theme.colors.text }]}>{formatTime(timeLeft)}</Text>
                <Text style={[styles.timerLabel, { color: theme.colors.textMuted }]}>MINUTES LEFT</Text>
              </Animated.View>
            </View>

            {!selectedReason && (
              <Pressable
                style={[styles.resistanceTrigger, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                onPress={() => setShowResistanceModal(true)}
              >
                <Text style={[styles.resistanceTriggerText, { color: theme.colors.text }]}>Why am I stuck?</Text>
              </Pressable>
            )}

            {aiInsight ? (
              <View style={[styles.aiCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <View style={styles.aiHeader}>
                  <Text style={styles.aiIcon}>✨</Text>
                  <Text style={[styles.aiTitle, { color: theme.colors.text }]}>
                    {selectedReason ? 'Intervention Recommendation' : 'AI Assistant'}
                  </Text>
                </View>
                <Text style={[styles.aiContent, { color: theme.colors.textMuted }]}>{aiInsight}</Text>
              </View>
            ) : null}

            <View style={styles.actions}>
              <Button
                variant="primary"
                onPress={handleComplete}
                style={styles.completeButton}
                disabled={completeSession.isPending}
              >
                {completeSession.isPending ? 'Completing...' : '✓ COMPLETE'}
              </Button>
              <View style={styles.secondaryActions}>
                <Pressable
                  style={[styles.secondaryButton, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                  onPress={isActive ? handlePause : handleResume}
                  disabled={pauseSession.isPending || resumeSession.isPending}
                >
                  <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                    {isActive ? '⏸ Pause' : '▶ Resume'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.secondaryButton, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                  onPress={() => setShowResistanceModal(true)}
                >
                  <Text style={[styles.secondaryButtonText, { color: theme.colors.error }]}>⚠ Too Difficult</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </Animated.View>

      <Modal visible={showResistanceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: theme.colors.surfaceMuted }]} />
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Identify the friction</Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textMuted }]}>
              What's preventing you from moving forward?
            </Text>
            <View style={styles.reasonList}>
              {RESISTANCE_REASONS.map((reason) => (
                <Pressable
                  key={reason}
                  style={[styles.reasonItem, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                  onPress={() => handleResistance(reason)}
                >
                  <Text style={[styles.reasonText, { color: theme.colors.text }]}>{reason}</Text>
                  <Text style={[styles.reasonArrow, { color: theme.colors.textSubtle }]}>›</Text>
                </Pressable>
              ))}
            </View>
            {selectedReason && (
              <Pressable
                style={[styles.modalActionButton, { backgroundColor: theme.colors.error }]}
                onPress={handleCancelSession}
                disabled={cancelSession.isPending}
              >
                <Text style={styles.modalActionText}>Abandon Session</Text>
              </Pressable>
            )}
            <Pressable style={styles.cancelButton} onPress={() => setShowResistanceModal(false)}>
              <Text style={[styles.cancelText, { color: theme.colors.textMuted }]}>Cancel</Text>
            </Pressable>
          </View>
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
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sessionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  objectiveSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  objectiveLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  objectiveTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.01,
  },
  startButton: {
    width: '100%',
    maxWidth: 320,
  },
  durationConfirmContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 16,
  },
  durationCard: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  durationCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  durationCardValue: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  durationCardReason: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  durationAdjust: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  durationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  durationButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  durationValue: {
    fontSize: 24,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'center',
  },
  cancelConfirmText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  timerContainer: {
    position: 'relative',
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  timerRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 140,
    borderWidth: 2,
  },
  timerProgress: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 140,
    borderWidth: 3,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timerInner: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 8,
    opacity: 0.6,
  },
  resistanceTrigger: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
  },
  resistanceTriggerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  aiCard: {
    width: '100%',
    maxWidth: 320,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
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
    fontSize: 13,
    fontWeight: '600',
  },
  aiContent: {
    fontSize: 15,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  completeButton: {
    width: '100%',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  reasonList: {
    gap: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reasonArrow: {
    fontSize: 20,
  },
  modalActionButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
});
