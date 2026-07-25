import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useTask } from '@/hooks/useTasks';
import { useActiveFocusSession, useResumeFocusSession, useCancelFocusSession } from '@/hooks/useFocus';
import { behaviorService } from '@/services';

type RecoveryChoice = 'continue' | 'pause' | 'switch';

export default function RecoveryScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const theme = useTractionTheme();
  const router = useRouter();

  const { data: task } = useTask(taskId ?? '');
  const { data: session, isLoading: loadingSession } = useActiveFocusSession();
  const resumeSession = useResumeFocusSession();
  const cancelSession = useCancelFocusSession();

  const [choice, setChoice] = useState<RecoveryChoice | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const isActive = session && session.taskId === taskId && session.status === 'ACTIVE';
  const isPaused = session && session.taskId === taskId && session.status === 'PAUSED';
  const showRecovery = isActive || isPaused;

  const timeAway = (() => {
    if (!session) return 'a few minutes';
    const started = new Date(session.startedAt).getTime();
    const now = Date.now();
    const diffMs = now - started;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'less than a minute';
    if (mins === 1) return '1 minute';
    if (mins < 60) return `${mins} minutes`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  })();

  const handleContinue = async () => {
    if (!session) return;
    try {
      await resumeSession.mutateAsync(session.id);
      behaviorService.track({ type: 'FOCUS_PAUSED', taskId, focusSessionId: session.id });
      router.replace(`/focus/${taskId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to resume focus session');
    }
  };

  const handleSwitch = async () => {
    if (!session) return;
    try {
      await cancelSession.mutateAsync(session.id);
      behaviorService.track({ type: 'FOCUS_ABANDONED', taskId, focusSessionId: session.id });
      router.replace('/(app)/today/smart-start' as Href);
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel focus session');
    }
  };

  if (loadingSession) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!showRecovery) {
    router.replace(`/focus/${taskId}`);
    return null;
  }

  const taskTitle = task?.title ?? 'Unknown task';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeIcon, { color: theme.colors.primary }]}>↻</Text>
          <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>Welcome back</Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.colors.textMuted }]}>
            You were away for {timeAway}
          </Text>
        </View>

        <View style={[styles.taskCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
          <Text style={[styles.taskLabel, { color: theme.colors.textMuted }]}>YOU WERE WORKING ON</Text>
          <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{taskTitle}</Text>
        </View>

        {choice === null ? (
          <View style={styles.choiceSection}>
            <Text style={[styles.choiceLabel, { color: theme.colors.textMuted }]}>Where did you stop?</Text>

            <Pressable
              style={[styles.choiceButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setChoice('continue')}
            >
              <Text style={styles.choiceButtonText}>I'm ready to continue</Text>
            </Pressable>

            <Pressable
              style={[styles.choiceButton, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              onPress={() => setChoice('pause')}
            >
              <Text style={[styles.choiceButtonText, { color: theme.colors.text }]}>I need a moment</Text>
            </Pressable>

            <Pressable
              style={[styles.choiceButton, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              onPress={() => setChoice('switch')}
            >
              <Text style={[styles.choiceButtonText, { color: theme.colors.text }]}>I'm switching tasks</Text>
            </Pressable>
          </View>
        ) : choice === 'continue' ? (
          <View style={styles.actionSection}>
            <Text style={[styles.actionText, { color: theme.colors.textMuted }]}>
              Your session is paused. Ready to pick up where you left off?
            </Text>
            <Button
              variant="primary"
              onPress={handleContinue}
              style={{ width: '100%' }}
              disabled={resumeSession.isPending}
            >
              {resumeSession.isPending ? 'Resuming...' : '▶ CONTINUE SESSION'}
            </Button>
            <Pressable onPress={() => setChoice(null)}>
              <Text style={[styles.backLink, { color: theme.colors.textMuted }]}>Go back</Text>
            </Pressable>
          </View>
        ) : choice === 'pause' ? (
          <View style={styles.actionSection}>
            <Text style={[styles.actionText, { color: theme.colors.textMuted }]}>
              No problem. Take your time. Your session is paused and waiting.
            </Text>
            <Button
              variant="secondary"
              onPress={() => router.back()}
              style={{ width: '100%' }}
            >
              Return Later
            </Button>
            <Pressable onPress={() => setChoice(null)}>
              <Text style={[styles.backLink, { color: theme.colors.textMuted }]}>Go back</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.actionSection}>
            <Text style={[styles.actionText, { color: theme.colors.textMuted }]}>
              This session will be cancelled and you'll be taken to Smart Start to pick a new task.
            </Text>
            <Button
              variant="primary"
              onPress={handleSwitch}
              style={{ width: '100%' }}
              disabled={cancelSession.isPending}
            >
              {cancelSession.isPending ? 'Cancelling...' : 'SWITCH TASKS'}
            </Button>
            <Pressable onPress={() => setChoice(null)}>
              <Text style={[styles.backLink, { color: theme.colors.textMuted }]}>Go back</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
  },
  taskCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  taskLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  choiceSection: {
    width: '100%',
    gap: 12,
  },
  choiceLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  choiceButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  choiceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  actionText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  backLink: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
});
