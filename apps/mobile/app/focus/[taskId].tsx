import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams,useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo,useRef, useState } from 'react';
import { Alert,Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { Button } from '@/components/ui/Button';
import { useBehaviorIndicators } from '@/hooks/useBehavior';
import { useReadinessScore } from '@/hooks/useExecution';
import {
  useActiveFocusSession,
  useCancelFocusSession,
  useCompleteFocusSession,
  usePauseFocusSession,
  useResumeFocusSession,
  useStartFocusSession,
} from '@/hooks/useFocus';
import { useTask } from '@/hooks/useTasks';
import { useCompleteTask } from '@/hooks/useTasks';
import { behaviorService } from '@/services';
import { type TractionTheme, useTractionTheme } from '@/theme';

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
  const completeTask = useCompleteTask();

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

  // Offer recovery only for a session that was already stale when this screen
  // opened; later refetches (pause/resume, polling) must not kick the user out.
  const recoveryChecked = useRef(false);

  useEffect(() => {
    if (activeSession && activeSession.taskId === taskId) {
      const firstCheck = !recoveryChecked.current;
      recoveryChecked.current = true;
      if (firstCheck && (activeSession.status === 'PAUSED' || activeSession.status === 'ACTIVE')) {
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
    let interval: ReturnType<typeof setInterval>;
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
      if (taskId) {
        completeTask.mutate(taskId);
      }
      Alert.alert('Nice work', 'You finished this session. Take a short break.', [
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

  const openHelp = (screen: 'simplify' | 'resistance') => {
    setShowResistanceModal(false);
    router.push(`/focus/${taskId}/${screen}`);
  };

  const taskTitle = task?.title ?? 'Loading...';
  const styles = createStyles(theme);
  const ringSize = 240;
  const stroke = 14;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const readinessNote =
    readiness && readiness.score > 80
      ? "You're well rested, so a longer session suits you."
      : readiness && readiness.score > 60
        ? 'A medium-length session suits you right now.'
        : readiness && readiness.score > 40
          ? 'A shorter session will feel easier to start.'
          : "Let's keep it short and gentle today.";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
        >
          <Ionicons name="close" size={22} color={theme.colors.text} />
        </Pressable>
        <View style={[styles.badge, sessionId && isActive ? styles.badgeActive : null]}>
          <Text style={[styles.badgeText, sessionId && isActive ? styles.badgeTextActive : null]}>
            {!sessionId ? 'Ready when you are' : isActive ? 'Focusing' : 'Paused'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.objective}>
          <Text style={styles.objectiveLabel}>Working on</Text>
          <Text style={styles.objectiveTitle}>{taskTitle}</Text>
        </View>

        {!sessionId ? (
          showDurationConfirm ? (
            <View style={styles.confirm}>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Session length</Text>
                <View style={styles.durationRow}>
                  <Pressable
                    style={styles.stepper}
                    onPress={() => setConfirmedDuration((prev) => Math.max(10, prev - 5))}
                    accessibilityRole="button"
                    accessibilityLabel="Five minutes less"
                  >
                    <Ionicons name="remove" size={22} color={theme.colors.text} />
                  </Pressable>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.durationValue}>{confirmedDuration}</Text>
                    <Text style={styles.durationUnit}>minutes</Text>
                  </View>
                  <Pressable
                    style={styles.stepper}
                    onPress={() => setConfirmedDuration((prev) => Math.min(60, prev + 5))}
                    accessibilityRole="button"
                    accessibilityLabel="Five minutes more"
                  >
                    <Ionicons name="add" size={22} color={theme.colors.text} />
                  </Pressable>
                </View>
                <Text style={styles.cardNote}>{readinessNote}</Text>
              </View>
              <View style={styles.footer}>
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleConfirmDuration}
                  loading={startSession.isPending}
                  disabled={startSession.isPending}
                >
                  {`Start ${confirmedDuration} minutes`}
                </Button>
                <Button variant="ghost" onPress={() => setShowDurationConfirm(false)}>
                  Not yet
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.confirm}>
              <View style={styles.startHint}>
                <View style={styles.startHintIcon}>
                  <Ionicons name="timer-outline" size={34} color={theme.colors.accent} />
                </View>
                <Text style={styles.cardNote}>Silence notifications, take a breath, and begin.</Text>
              </View>
              <View style={styles.footer}>
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleStartSession}
                  loading={startSession.isPending}
                  disabled={startSession.isPending}
                >
                  Start focusing
                </Button>
              </View>
            </View>
          )
        ) : (
          <>
            <Animated.View style={[styles.timer, { transform: [{ scale: pulseAnim }] }]}>
              <Svg width={ringSize} height={ringSize}>
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke={theme.colors.surfaceMuted}
                  strokeWidth={stroke}
                  fill="none"
                />
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke={isActive ? theme.colors.accent : theme.colors.textSubtle}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - getProgress())}
                  transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                />
              </Svg>
              <View style={styles.timerCenter}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                <Text style={styles.timerLabel}>of {confirmedDuration} minutes</Text>
              </View>
            </Animated.View>

            {aiInsight ? (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>A small suggestion</Text>
                <Text style={styles.insight}>{aiInsight}</Text>
                {selectedReason === 'Task feels too large' ? (
                  <Pressable onPress={() => openHelp('simplify')} accessibilityRole="button">
                    <Text style={styles.link}>Break it into steps</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            <View style={styles.footer}>
              <View style={styles.row}>
                <Button
                  variant="secondary"
                  size="lg"
                  style={{ flex: 1 }}
                  onPress={isActive ? handlePause : handleResume}
                  disabled={pauseSession.isPending || resumeSession.isPending}
                >
                  {isActive ? 'Pause' : 'Resume'}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  style={{ flex: 1 }}
                  onPress={handleComplete}
                  loading={completeSession.isPending}
                  disabled={completeSession.isPending}
                >
                  I&apos;m done
                </Button>
              </View>
              <Button variant="ghost" onPress={() => setShowResistanceModal(true)}>
                Feeling stuck?
              </Button>
            </View>
          </>
        )}
      </Animated.View>

      <Modal visible={showResistanceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>What&apos;s getting in the way?</Text>
            <Text style={styles.sheetSubtitle}>It&apos;s normal to get stuck. Pick what feels closest.</Text>
            <View style={styles.reasons}>
              {RESISTANCE_REASONS.map((reason) => (
                <Pressable
                  key={reason}
                  style={({ pressed }) => [styles.reason, pressed && { opacity: 0.7 }]}
                  onPress={() => handleResistance(reason)}
                  accessibilityRole="button"
                >
                  <Text style={styles.reasonText}>{reason}</Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textSubtle} />
                </Pressable>
              ))}
            </View>
            <View style={styles.sheetLinks}>
              <Pressable onPress={() => openHelp('simplify')} accessibilityRole="button">
                <Text style={styles.link}>Break this task into steps</Text>
              </Pressable>
              <Pressable onPress={() => openHelp('resistance')} accessibilityRole="button">
                <Text style={styles.link}>Get a plan for getting unstuck</Text>
              </Pressable>
            </View>
            {selectedReason ? (
              <Button
                variant="secondary"
                onPress={handleCancelSession}
                disabled={cancelSession.isPending}
                textStyle={{ color: theme.colors.dangerText }}
              >
                End this session
              </Button>
            ) : null}
            <Button variant="ghost" onPress={() => setShowResistanceModal(false)}>
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(theme: TractionTheme) {
  const card =
    theme.mode === 'light' ? theme.shadows.card : { borderWidth: 1, borderColor: theme.colors.border };
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surfaceSoft,
    },
    badgeActive: { backgroundColor: theme.colors.successSurface },
    badgeText: { ...theme.typography.labelSm, fontWeight: '600', color: theme.colors.textMuted },
    badgeTextActive: { color: theme.colors.successText },
    content: { flex: 1, paddingHorizontal: 24 },
    objective: { alignItems: 'center', marginTop: 28 },
    objectiveLabel: { ...theme.typography.labelSm, fontWeight: '600', color: theme.colors.textSubtle },
    objectiveTitle: {
      ...theme.typography.headlineMd,
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: 6,
    },
    confirm: { flex: 1, justifyContent: 'space-between', marginTop: 32 },
    card: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      padding: 20,
      marginTop: 24,
      ...card,
    },
    cardLabel: { ...theme.typography.labelSm, fontWeight: '600', color: theme.colors.textSubtle },
    cardNote: { ...theme.typography.bodyMd, color: theme.colors.textMuted, textAlign: 'center', marginTop: 12 },
    durationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
    stepper: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    durationValue: { ...theme.typography.displayLg, fontSize: 48, lineHeight: 54, color: theme.colors.text },
    durationUnit: { ...theme.typography.labelSm, color: theme.colors.textMuted },
    startHint: { alignItems: 'center', marginTop: 24 },
    startHintIcon: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timer: { alignSelf: 'center', marginTop: 32, alignItems: 'center', justifyContent: 'center' },
    timerCenter: { position: 'absolute', alignItems: 'center' },
    timerText: { ...theme.typography.timer, fontSize: 52, lineHeight: 58, color: theme.colors.text },
    timerLabel: { ...theme.typography.labelSm, color: theme.colors.textSubtle, marginTop: 2 },
    insight: { ...theme.typography.bodyMd, color: theme.colors.text, marginTop: 6, lineHeight: 21 },
    link: { ...theme.typography.bodyMd, fontWeight: '600', color: theme.colors.accent, marginTop: 10 },
    footer: { marginTop: 'auto', paddingBottom: 12, gap: 6 },
    row: { flexDirection: 'row', gap: 10 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.scrim },
    sheet: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.radius.sheet,
      borderTopRightRadius: theme.radius.sheet,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 32,
      gap: 4,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 40,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.colors.surfaceMuted,
      marginBottom: 16,
    },
    sheetTitle: { ...theme.typography.headlineMd, color: theme.colors.text },
    sheetSubtitle: { ...theme.typography.bodyMd, color: theme.colors.textMuted, marginBottom: 12 },
    reasons: { gap: 8 },
    reason: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      paddingHorizontal: 16,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      ...card,
    },
    reasonText: { ...theme.typography.bodyMd, fontWeight: '600', color: theme.colors.text },
    sheetLinks: { gap: 2, marginVertical: 10 },
  });
}
