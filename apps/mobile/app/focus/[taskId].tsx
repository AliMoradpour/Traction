import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';

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

const AI_INSIGHTS = [
  'Focus levels are high. Completing this now will clear 15% of your weekly cognitive load.',
  'You tend to be most productive during this time. Keep the momentum going!',
  'Breaking this into smaller steps could reduce friction by 40%.',
];

export default function FocusSessionScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const theme = useTractionTheme();
  const router = useRouter();
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(true);
  const [showResistanceModal, setShowResistanceModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState(AI_INSIGHTS[0]);
  
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
    const total = 25 * 60;
    return (total - timeLeft) / total;
  };

  const handleComplete = () => {
    setIsActive(false);
    // Show success overlay
  };

  const handleResistance = (reason: string) => {
    setSelectedReason(reason);
    setShowResistanceModal(false);
    setAiInsight(RESISTANCE_RECOMMENDATIONS[reason] || AI_INSIGHTS[0]);
  };

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
        <View style={styles.objectiveSection}>
          <Text style={[styles.objectiveLabel, { color: theme.colors.textMuted }]}>CURRENT OBJECTIVE</Text>
          <Text style={[styles.objectiveTitle, { color: theme.colors.text }]}>Design System Polish</Text>
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

        <View style={[styles.aiCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiIcon}>✨</Text>
            <Text style={[styles.aiTitle, { color: theme.colors.text }]}>
              {selectedReason ? 'Intervention Recommendation' : 'AI Assistant'}
            </Text>
          </View>
          <Text style={[styles.aiContent, { color: theme.colors.textMuted }]}>{aiInsight}</Text>
        </View>

        <View style={styles.actions}>
          <Button variant="primary" onPress={handleComplete} style={styles.completeButton}>
            ✓ COMPLETE
          </Button>
          <View style={styles.secondaryActions}>
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              onPress={() => setIsActive(!isActive)}
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
