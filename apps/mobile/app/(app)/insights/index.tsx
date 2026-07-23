import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useAIRecommendations } from '@/hooks/useAI';
import { useBehaviorIndicators } from '@/hooks/useBehavior';
import { useAcceptRecommendation, useDismissRecommendation } from '@/hooks/useAI';

export default function InsightsScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { data: recommendations, isLoading: loadingRecs } = useAIRecommendations();
  const { data: indicators } = useBehaviorIndicators();
  const acceptMutation = useAcceptRecommendation();
  const dismissMutation = useDismissRecommendation();

  const frictionScore = indicators
    ? Math.round(100 - ((indicators.executionScore + indicators.consistencyScore + indicators.momentumScore) / 3))
    : null;

  const filteredRecommendations = (recommendations ?? []).filter(
    (r) => !r.acceptedAt && !r.dismissedAt
  );

  const handleAccept = (id: string) => {
    acceptMutation.mutate(id);
  };

  const handleDismiss = (id: string) => {
    dismissMutation.mutate(id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Self-Awareness</Text>
        </View>
        {frictionScore !== null && (
          <View style={[styles.frictionBadge, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.frictionText, { color: theme.colors.text }]}>Friction: {frictionScore}/100</Text>
          </View>
        )}
      </View>

      {loadingRecs ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading insights...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pattern Recognition</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
              Turning observations into deliberate action.
            </Text>
          </View>

          {filteredRecommendations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyIcon, { color: theme.colors.textMuted }]}>✨</Text>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No insights yet</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                Complete more tasks and track behaviors to unlock personalized insights.
              </Text>
            </View>
          ) : (
            <View style={styles.insightsList}>
              {filteredRecommendations.map((rec) => (
                <View key={rec.id} style={[styles.insightCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                  <View style={styles.insightHeader}>
                    <Text style={styles.insightIcon}>💡</Text>
                    <Text style={[styles.insightLabel, { color: theme.colors.primary }]}>WHAT WE LEARNED</Text>
                  </View>
                  <Text style={[styles.insightLearned, { color: theme.colors.text }]}>{rec.title}</Text>
                  <Text style={[styles.insightBody, { color: theme.colors.textMuted }]}>{rec.body}</Text>
                  <View style={styles.insightActions}>
                    <Pressable
                      style={[styles.acceptButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => handleAccept(rec.id)}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.dismissButton, { borderColor: theme.colors.border }]}
                      onPress={() => handleDismiss(rec.id)}
                    >
                      <Text style={[styles.dismissButtonText, { color: theme.colors.textMuted }]}>Dismiss</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.quickLinks}>
            <Pressable
              style={[styles.quickLinkCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              onPress={() => router.push('/(app)/insights/weekly-review')}
            >
              <Text style={styles.quickLinkIcon}>📈</Text>
              <View style={styles.quickLinkContent}>
                <Text style={[styles.quickLinkTitle, { color: theme.colors.text }]}>Weekly Review</Text>
                <Text style={[styles.quickLinkSubtitle, { color: theme.colors.textMuted }]}>View your weekly patterns</Text>
              </View>
              <Text style={[styles.quickLinkArrow, { color: theme.colors.textSubtle }]}>›</Text>
            </Pressable>

            <Pressable
              style={[styles.quickLinkCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              onPress={() => router.push('/(app)/insights/behavioral-awareness')}
            >
              <Text style={styles.quickLinkIcon}>🧠</Text>
              <View style={styles.quickLinkContent}>
                <Text style={[styles.quickLinkTitle, { color: theme.colors.text }]}>Behavioral Awareness</Text>
                <Text style={[styles.quickLinkSubtitle, { color: theme.colors.textMuted }]}>Deep dive into your habits</Text>
              </View>
              <Text style={[styles.quickLinkArrow, { color: theme.colors.textSubtle }]}>›</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
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
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  frictionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  frictionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  insightsList: {
    gap: 16,
    marginBottom: 24,
  },
  insightCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 18,
  },
  insightLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
  },
  insightLearned: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 8,
  },
  insightBody: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
  },
  insightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dismissButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  dismissButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  quickLinks: {
    gap: 12,
  },
  quickLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  quickLinkIcon: {
    fontSize: 24,
  },
  quickLinkContent: {
    flex: 1,
    gap: 2,
  },
  quickLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickLinkSubtitle: {
    fontSize: 13,
  },
  quickLinkArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
});
