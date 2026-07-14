import { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';

const MOCK_TASKS = [
  {
    id: '1',
    title: 'Review feedback from Design Team',
    duration: '20m',
    category: 'Design',
  },
  {
    id: '2',
    title: 'Prepare Weekly Sync Slides',
    duration: '45m',
    category: 'Ops',
  },
  {
    id: '3',
    title: 'Reply to Slack mentions',
    duration: '15m',
    category: 'Admin',
  },
];

export default function TodayScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 600,
    useNativeDriver: true,
  }).start();

  const handleStartSession = () => {
    router.push('/focus/1');
  };

  const handleTaskPress = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  const handleAddTask = () => {
    // TODO: Open add task modal
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceMuted }]}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>Good morning, Alex</Text>
            <Text style={[styles.date, { color: theme.colors.textMuted }]}>Monday, Oct 23</Text>
          </View>
        </View>
        <View style={styles.frictionContainer}>
          <Text style={[styles.frictionLabel, { color: theme.colors.text }]}>Friction: 24/100</Text>
          <View style={[styles.frictionTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
            <View style={[styles.frictionFill, { backgroundColor: theme.colors.primary, width: '24%' }]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>CURRENT FOCUS</Text>
          <View style={[styles.focusCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={[styles.focusAccent, { backgroundColor: theme.colors.primary }]} />
            <View style={styles.focusContent}>
              <View style={styles.focusMeta}>
                <View style={[styles.priorityBadge, { backgroundColor: theme.colors.accentMuted }]}>
                  <Text style={[styles.priorityText, { color: theme.colors.accent }]}>High Priority</Text>
                </View>
                <Text style={[styles.duration, { color: theme.colors.textMuted }]}>⏱ 90m</Text>
              </View>
              <Text style={[styles.focusTitle, { color: theme.colors.text }]}>
                Deep Work: Project Alpha
              </Text>
              <Text style={[styles.focusDescription, { color: theme.colors.textMuted }]}>
                Focus on the core architecture and finalizing the documentation for the stakeholder review.
              </Text>
            </View>
            <Button variant="primary" onPress={handleStartSession} style={styles.startButton}>
              ▶ START SESSION
            </Button>
          </View>
        </Animated.View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>NEXT TASKS</Text>
            <Pressable>
              <Text style={[styles.viewAll, { color: theme.colors.primary }]}>View all ›</Text>
            </Pressable>
          </View>
          <View style={styles.taskList}>
            {MOCK_TASKS.map((task) => (
              <Pressable
                key={task.id}
                style={[styles.taskCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                onPress={() => handleTaskPress(task.id)}
              >
                <View style={[styles.checkbox, { borderColor: theme.colors.border }]} />
                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{task.title}</Text>
                  <View style={styles.taskMeta}>
                    <Text style={[styles.taskMetaText, { color: theme.colors.textMuted }]}>
                      ⏱ {task.duration}
                    </Text>
                    <Text style={[styles.taskMetaText, { color: theme.colors.textMuted }]}>
                      📁 {task.category}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.moreIcon, { color: theme.colors.textSubtle }]}>⋮</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.insightCard, { backgroundColor: theme.colors.accentMuted }]}>
          <Text style={styles.insightIcon}>✨</Text>
          <Text style={[styles.insightText, { color: theme.colors.accentText }]}>
            Based on your focus patterns, you are most productive between 9:00 AM and 11:30 AM. You
            have one clear window for Project Alpha left today.
          </Text>
        </View>
      </ScrollView>

      <Pressable style={[styles.fab, { backgroundColor: theme.colors.primary }]} onPress={handleAddTask}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
  },
  date: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  frictionContainer: {
    alignItems: 'flex-end',
  },
  frictionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  frictionTrack: {
    width: 80,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  frictionFill: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '500',
  },
  focusCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  focusAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  focusContent: {
    padding: 16,
    paddingRight: 16,
    paddingLeft: 20,
  },
  focusMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  duration: {
    fontSize: 13,
    fontWeight: '500',
  },
  focusTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.01,
  },
  focusDescription: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 16,
  },
  startButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  taskList: {
    gap: 8,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  taskContent: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '500',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  taskMetaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreIcon: {
    fontSize: 20,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  insightIcon: {
    fontSize: 20,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
