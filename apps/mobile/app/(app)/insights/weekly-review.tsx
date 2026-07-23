import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useWeeklyReview } from '@/hooks/useAI';

export default function WeeklyReviewScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { data: review, isLoading, error } = useWeeklyReview();

  const wins = review?.wins ?? [];
  const commitments = review?.commitments ?? [];
  const patterns = review?.missedPatterns ?? [];
  const nextShift = review?.nextShift ?? '';

  const successRate = commitments.length > 0
    ? Math.round((wins.length / (wins.length + patterns.length)) * 100) || 0
    : 0;

  const handleApplyToCalendar = () => {};

  const handleClose = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Generating weekly review...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingState}>
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Failed to load weekly review.</Text>
          <Button variant="primary" onPress={handleClose} style={{ marginTop: 16 }}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerSection}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Weekly Review</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Reflecting on your behavioral patterns helps align your actions with your long-term goals.
          </Text>
        </View>

        <View style={styles.bentoGrid}>
          <View style={[styles.winsCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🏆</Text>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Significant Wins</Text>
            </View>
            {wins.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No wins recorded this week.</Text>
            ) : (
              <View style={styles.winsList}>
                {wins.map((win: string, index: number) => (
                  <View key={index} style={styles.winItem}>
                    <View style={[styles.winDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={[styles.winText, { color: theme.colors.textMuted }]}>{win}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={[styles.commitmentsCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.cardIcon}>📋</Text>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Commitments</Text>
              </View>
              {commitments.length > 0 && (
                <View style={[styles.successBadge, { backgroundColor: theme.colors.surfaceMuted }]}>
                  <Text style={[styles.successText, { color: theme.colors.textMuted }]}>{successRate}% Success</Text>
                </View>
              )}
            </View>
            {commitments.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No commitments this week.</Text>
            ) : (
              <>
                <Text style={[styles.commitmentsSummary, { color: theme.colors.textMuted }]}>
                  This week you completed {wins.length} of {wins.length + patterns.length} planned tasks.
                </Text>
                <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
                  <View style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: `${successRate}%` }]} />
                </View>
              </>
            )}
          </View>

          <View style={[styles.patternsCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🧠</Text>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Behavior Patterns</Text>
            </View>
            {patterns.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No patterns detected yet.</Text>
            ) : (
              <View style={styles.patternsList}>
                {patterns.map((pattern: string, index: number) => (
                  <View key={index} style={[styles.patternItem, { borderLeftColor: index === 0 ? theme.colors.primary : theme.colors.border }]}>
                    <Text style={[styles.patternText, { color: theme.colors.text }]}>{pattern}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {nextShift ? (
            <View style={[styles.aiCard, { backgroundColor: theme.colors.primaryContainer }]}>
              <View style={styles.aiHeader}>
                <Text style={styles.aiIcon}>✨</Text>
                <Text style={[styles.aiLabel, { color: theme.colors.onPrimaryContainer }]}>AI SYNTHESIS</Text>
              </View>
              <Text style={[styles.aiTitle, { color: theme.colors.onPrimaryContainer }]}>Optimal Shift</Text>
              <Text style={[styles.aiContent, { color: theme.colors.onPrimaryContainer }]}>
                {nextShift}
              </Text>
              <Button variant="secondary" onPress={handleApplyToCalendar} style={styles.applyButton}>
                Apply to Calendar
              </Button>
            </View>
          ) : null}
        </View>

        <View style={styles.completeSection}>
          <View style={[styles.completeIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Text style={styles.completeIconText}>✓</Text>
          </View>
          <Text style={[styles.completeTitle, { color: theme.colors.text }]}>Review Complete</Text>
          <Text style={[styles.completeSubtitle, { color: theme.colors.textMuted }]}>
            You're focused and ready for next week.
          </Text>
          <Button variant="primary" onPress={handleClose}>
            Close Review
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
  },
  bentoGrid: {
    gap: 16,
  },
  winsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 120,
  },
  commitmentsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  patternsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  aiCard: {
    padding: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  successBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  successText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  winsList: {
    gap: 12,
  },
  winItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  winDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  winText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  commitmentsSummary: {
    fontSize: 17,
    marginBottom: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  patternsList: {
    gap: 12,
  },
  patternItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderLeftWidth: 4,
  },
  patternText: {
    fontSize: 15,
    lineHeight: 20,
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
  aiLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  aiTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  aiContent: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 16,
  },
  applyButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  completeSection: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 32,
  },
  completeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  completeIconText: {
    fontSize: 28,
    color: '#000000',
  },
  completeTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
});
