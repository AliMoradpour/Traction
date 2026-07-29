import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useProcrastinationProfile } from '@/hooks/useBehavior';
import { Button } from '@/components/ui/Button';

function getRecommendation(patterns: string[]): string[] {
  const recs: string[] = [];
  const hasLateStart = patterns.some((p) => p.toLowerCase().includes('late start'));
  const hasReschedule = patterns.some((p) => p.toLowerCase().includes('reschedul'));
  const hasSnooze = patterns.some((p) => p.toLowerCase().includes('snooze'));
  const hasNone = patterns.some((p) => p.toLowerCase().includes('no procrastination'));

  if (hasNone) return ['Keep up the great work! No procrastination patterns detected.'];
  if (hasLateStart) recs.push('Try starting with the hardest task first to build momentum.');
  if (hasReschedule) recs.push('Commit to a deadline and set reminders to stay on track.');
  if (hasSnooze) recs.push('Reduce snooze duration. Try 5-minute timers instead of 15+.');
  if (recs.length === 0) recs.push('Reflect on what triggers delays and plan around them.');
  return recs;
}

function ScoreColor(theme: any, score: number): string {
  if (score > 75) return theme.colors.danger;
  if (score > 50) return theme.colors.warning;
  if (score > 25) return theme.colors.warning;
  return theme.colors.success;
}

export default function ProcrastinationScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { data: profile, isLoading, isError, refetch } = useProcrastinationProfile();

  const recommendations = useMemo(() => {
    return getRecommendation(profile?.patterns ?? []);
  }, [profile?.patterns]);

  const scoreColor = ScoreColor(theme, profile?.score ?? 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backArrow, { color: theme.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Procrastination Profile</Text>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>
            Failed to load data
          </Text>
          <Button variant="secondary" onPress={() => refetch()} style={{ marginTop: 12 }}>
            Retry
          </Button>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Score Gauge */}
          <View style={[styles.gaugeCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={[styles.gaugeCircle, { borderColor: scoreColor }]}>
              <Text style={[styles.gaugeScore, { color: scoreColor }]}>{profile?.score ?? 0}</Text>
              <Text style={[styles.gaugeLabel, { color: theme.colors.textMuted }]}>procrastination score</Text>
            </View>
            <Text style={[styles.frequencyText, { color: theme.colors.text }]}>
              {profile?.frequency?.toFixed(1) ?? '0.0'} times per week
            </Text>
            {profile?.peakProcrastinationTime && profile.peakProcrastinationTime !== 'No data' && (
              <Text style={[styles.peakText, { color: theme.colors.textMuted }]}>
                Peak time: {profile.peakProcrastinationTime}
              </Text>
            )}
          </View>

          {/* Patterns */}
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>DETECTED PATTERNS</Text>
            {profile?.patterns && profile.patterns.length > 0 ? (
              <View style={styles.patternsList}>
                {profile.patterns.map((pattern, i) => (
                  <View key={i} style={[styles.patternItem, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <Text style={[styles.patternDot, { color: theme.colors.warning }]}>●</Text>
                    <Text style={[styles.patternText, { color: theme.colors.text }]}>{pattern}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.noPatternsText, { color: theme.colors.textMuted }]}>
                No procrastination patterns detected.
              </Text>
            )}
          </View>

          {/* Common Reasons */}
          {profile?.commonReasons && profile.commonReasons.length > 0 && !profile.commonReasons.includes('None identified') && (
            <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>COMMON REASONS</Text>
              <View style={styles.patternsList}>
                {profile.commonReasons.map((reason, i) => (
                  <View key={i} style={[styles.patternItem, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <Text style={[styles.patternDot, { color: theme.colors.danger }]}>●</Text>
                    <Text style={[styles.patternText, { color: theme.colors.text }]}>{reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recommendations */}
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>RECOMMENDATIONS</Text>
            <View style={styles.recsList}>
              {recommendations.map((rec, i) => (
                <View key={i} style={styles.recItem}>
                  <Text style={[styles.recBullet, { color: theme.colors.success }]}>✓</Text>
                  <Text style={[styles.recText, { color: theme.colors.text }]}>{rec}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Disclaimer */}
          <Text style={[styles.disclaimer, { color: theme.colors.textSubtle }]}>
            These insights reflect behavioral patterns to help you build better habits.
          </Text>
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
    paddingBottom: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '300',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  gaugeCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  gaugeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeScore: {
    fontSize: 36,
    fontWeight: '700',
  },
  gaugeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  frequencyText: {
    fontSize: 17,
    fontWeight: '600',
  },
  peakText: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 12,
  },
  patternsList: {
    gap: 8,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  patternDot: {
    fontSize: 10,
  },
  patternText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  noPatternsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  recsList: {
    gap: 12,
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  recBullet: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 1,
  },
  recText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  disclaimer: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
