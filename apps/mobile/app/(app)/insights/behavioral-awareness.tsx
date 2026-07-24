import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useBehaviorIndicators, useBurnoutRisk, useProcrastinationProfile } from '@/hooks/useBehavior';

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.scoreTrack}>
        <View style={[styles.scoreFill, { width: `${Math.min(score, 100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.scoreValue}>{score}%</Text>
    </View>
  );
}

const BURNOUT_COLORS: Record<string, string> = {
  low: '#10B981',
  moderate: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

export default function BehavioralAwarenessScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { data: indicators, isLoading: loadingIndicators, error: errorIndicators } = useBehaviorIndicators();
  const { data: burnout, isLoading: loadingBurnout, error: errorBurnout } = useBurnoutRisk();
  const { data: procrastination, isLoading: loadingProcrastination, error: errorProcrastination } = useProcrastinationProfile();

  const isLoading = loadingIndicators || loadingBurnout || loadingProcrastination;
  const error = errorIndicators || errorBurnout || errorProcrastination;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Analyzing behavior...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>Failed to load behavior data.</Text>
          <Button variant="primary" onPress={() => router.back()} style={{ marginTop: 16 }}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const hasData = indicators || burnout || procrastination;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Behavioral Awareness</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Understanding your patterns helps you build momentum.
          </Text>
        </View>

        {!hasData ? (
          <View style={styles.centered}>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              No behavior data yet. Complete tasks and focus sessions to generate insights.
            </Text>
          </View>
        ) : (
          <>
            {indicators ? (
              <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Behavior Scores</Text>
                <ScoreBar label="Consistency" score={indicators.consistencyScore} color={theme.colors.primary} />
                <ScoreBar label="Execution" score={indicators.executionScore} color="#3B82F6" />
                <ScoreBar label="Reliability" score={indicators.reliabilityScore} color="#10B981" />
                <ScoreBar label="Planning" score={indicators.planningAccuracy} color="#8B5CF6" />
                <ScoreBar label="Momentum" score={indicators.momentumScore} color="#F59E0B" />
                <ScoreBar label="Recovery" score={indicators.recoveryScore} color="#EC4899" />
              </View>
            ) : null}

            {burnout ? (
              <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Burnout Risk</Text>
                  <View style={[styles.riskBadge, { backgroundColor: BURNOUT_COLORS[burnout.level] + '20' }]}>
                    <Text style={[styles.riskText, { color: BURNOUT_COLORS[burnout.level] }]}>
                      {burnout.level.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>
                  Score: {burnout.score} · Trend: {burnout.trend}
                </Text>
                {burnout.signals.length > 0 ? (
                  <View style={styles.signalList}>
                    {burnout.signals.map((signal, i) => (
                      <Text key={i} style={[styles.signalText, { color: theme.colors.textMuted }]}>
                        · {signal}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}

            {procrastination ? (
              <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Procrastination Profile</Text>
                <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>
                  Score: {procrastination.score} · Frequency: {procrastination.frequency}%
                </Text>
                {procrastination.peakProcrastinationTime ? (
                  <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>
                    Peak time: {procrastination.peakProcrastinationTime}
                  </Text>
                ) : null}
                {procrastination.patterns.length > 0 ? (
                  <View style={styles.signalList}>
                    {procrastination.patterns.map((pattern, i) => (
                      <Text key={i} style={[styles.signalText, { color: theme.colors.textMuted }]}>
                        · {pattern}
                      </Text>
                    ))}
                  </View>
                ) : null}
                {procrastination.commonReasons.length > 0 ? (
                  <View style={styles.signalList}>
                    {procrastination.commonReasons.map((reason, i) => (
                      <Text key={i} style={[styles.signalText, { color: theme.colors.textMuted }]}>
                        Reason: {reason}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
          </>
        )}

        <Button variant="secondary" onPress={() => router.back()} style={styles.backButton}>
          Back
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 17, lineHeight: 24 },
  loadingText: { marginTop: 16, fontSize: 15 },
  emptyText: { fontSize: 15, textAlign: 'center' },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  cardLabel: { fontSize: 14, marginBottom: 4 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  scoreLabel: { width: 100, fontSize: 13, color: '#9CA3AF' },
  scoreTrack: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, marginHorizontal: 8 },
  scoreFill: { height: '100%', borderRadius: 4 },
  scoreValue: { width: 40, fontSize: 13, fontWeight: '600', color: '#9CA3AF', textAlign: 'right' },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  riskText: { fontSize: 11, fontWeight: '700' },
  signalList: { marginTop: 8, gap: 4 },
  signalText: { fontSize: 14, lineHeight: 20 },
  backButton: { marginTop: 8 },
});
