import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import Button from '@/components/ui/Button';

const GOAL_TYPES = [
  {
    id: 'ielts',
    icon: '📝',
    title: 'IELTS Preparation',
    description: 'Track your study bands and test date.',
  },
  {
    id: 'programming',
    icon: '💻',
    title: 'Programming Project',
    description: 'Manage milestones for your next big build.',
  },
  {
    id: 'fitness',
    icon: '💪',
    title: 'Fitness',
    description: 'Consistent habits and performance targets.',
  },
  {
    id: 'savings',
    icon: '💰',
    title: 'Saving Money',
    description: 'Build your emergency fund or big purchase.',
  },
  {
    id: 'custom',
    icon: '➕',
    title: 'Custom Goal',
    description: 'Define your own path and success metrics.',
  },
];

export default function GoalTypeScreen() {
  const theme = useTractionTheme();
  const router = useRouter();

  const handleSelect = (goalId: string) => {
    router.push('/(app)/goals/select');
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.textMuted }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>New Goal</Text>
        <Pressable onPress={handleSkip}>
          <Text style={[styles.skipText, { color: theme.colors.textSubtle }]}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            What are you working toward?
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Goals are optional. You can add them later.
          </Text>
        </View>

        <View style={styles.goalList}>
          {GOAL_TYPES.map((goal) => (
            <Pressable
              key={goal.id}
              style={[styles.goalCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              onPress={() => handleSelect(goal.id)}
            >
              <View style={styles.goalContent}>
                <View style={[styles.goalIcon, { backgroundColor: theme.colors.accentMuted }]}>
                  <Text style={styles.goalIconText}>{goal.icon}</Text>
                </View>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalTitle, { color: theme.colors.text }]}>{goal.title}</Text>
                  <Text style={[styles.goalDescription, { color: theme.colors.textMuted }]}>
                    {goal.description}
                  </Text>
                </View>
              </View>
              <Text style={[styles.chevron, { color: theme.colors.textSubtle }]}>›</Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.infoTitle}>Why set goals?</Text>
          <Text style={styles.infoDescription}>
            AI analysis helps prioritize your daily tasks based on how they impact your long-term
            ambitions.
          </Text>
          <Button variant="secondary" size="sm" style={styles.learnMoreButton}>
            Learn more
          </Button>
        </View>
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
    height: 56,
  },
  backButton: {
    width: 40,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  skipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.01,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
  },
  goalList: {
    gap: 12,
    marginBottom: 24,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalIconText: {
    fontSize: 24,
  },
  goalInfo: {
    flex: 1,
    gap: 4,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  goalDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.8)',
    maxWidth: '80%',
  },
  learnMoreButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
});
