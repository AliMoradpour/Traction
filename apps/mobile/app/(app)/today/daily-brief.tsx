import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useDailyBrief } from '@/hooks/useAI';

export default function DailyBriefScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { data: brief, isLoading, error } = useDailyBrief();

  const focusWindow = brief?.focusWindow ?? '';
  const frictionSummary = brief?.frictionSummary ?? '';
  const prioritizedTasks = brief?.prioritizedTasks ?? [];
  const energyLevel = brief?.energyLevel ?? 0;
  const recommendations = brief?.recommendations ?? [];

  const getEnergyColor = (level: number) => {
    if (level >= 7) return theme.colors.success;
    if (level >= 4) return theme.colors.warning;
    return theme.colors.error;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Daily Brief</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Generating your brief...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Daily Brief</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.loadingState}>
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Failed to load daily brief.</Text>
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Daily Brief</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Overview</Text>
        </View>

        {focusWindow ? (
          <View style={[styles.energyCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={styles.energyHeader}>
              <Text style={styles.energyIcon}>⚡</Text>
              <Text style={[styles.energyTitle, { color: theme.colors.text }]}>Focus Window</Text>
            </View>
            <Text style={[styles.focusWindowText, { color: theme.colors.text }]}>{focusWindow}</Text>
            {energyLevel > 0 && (
              <View style={styles.energyRow}>
                <View style={styles.energyItem}>
                  <Text style={[styles.energyLabel, { color: theme.colors.textMuted }]}>Energy Level</Text>
                  <Text style={[styles.energyValue, { color: getEnergyColor(energyLevel) }]}>
                    {energyLevel}/10
                  </Text>
                </View>
              </View>
            )}
            {frictionSummary ? (
              <Text style={[styles.energyTip, { color: theme.colors.textMuted }]}>{frictionSummary}</Text>
            ) : null}
          </View>
        ) : null}

        {prioritizedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Prioritized Tasks</Text>
            <View style={styles.taskList}>
              {prioritizedTasks.map((task: string, index: number) => (
                <View
                  key={index}
                  style={[styles.taskCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                >
                  <View style={styles.taskHeader}>
                    <Text style={[styles.taskNumber, { color: theme.colors.primary }]}>{index + 1}</Text>
                    <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{task}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {recommendations.length > 0 && (
          <View style={[styles.aiInsightCard, { backgroundColor: theme.colors.accentMuted }]}>
            <Text style={styles.aiIcon}>✨</Text>
            <View style={styles.aiContent}>
              <Text style={[styles.aiTitle, { color: theme.colors.accentText }]}>AI Recommendations</Text>
              {recommendations.map((rec: string, index: number) => (
                <Text key={index} style={[styles.aiText, { color: theme.colors.accentText }]}>
                  • {rec}
                </Text>
              ))}
            </View>
          </View>
        )}

        {!focusWindow && prioritizedTasks.length === 0 && recommendations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              No daily brief available yet. Complete more tasks to generate your personalized brief.
            </Text>
          </View>
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
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  energyCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  energyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  energyIcon: {
    fontSize: 20,
  },
  energyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  focusWindowText: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 12,
  },
  energyRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  energyItem: {
    flex: 1,
  },
  energyLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: 4,
  },
  energyValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  energyTip: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  taskList: {
    gap: 8,
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskNumber: {
    fontSize: 15,
    fontWeight: '700',
    width: 24,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  aiInsightCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  aiIcon: {
    fontSize: 20,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  aiText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
