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
import { useBurnoutRisk } from '@/hooks/useBehavior';
import { Button } from '@/components/ui/Button';

const SIGNAL_LABELS = [
  'Completion decline',
  'Focus abandonment',
  'Task snoozing',
  'Decreasing focus duration',
  'Inactivity gaps',
];

function getRecommendation(level: string): string {
  switch (level) {
    case 'low':
      return "You're doing great. Keep it up.";
    case 'moderate':
      return 'Consider taking short breaks between tasks.';
    case 'high':
      return 'Your workload may be unsustainable. Review your goals.';
    case 'critical':
      return 'Strong signs of burnout. Consider pausing non-essential goals.';
    default:
      return '';
  }
}

function getRiskColor(theme: any, level: string): string {
  switch (level) {
    case 'low':
      return theme.colors.success;
    case 'moderate':
      return theme.colors.warning;
    case 'high':
      return '#F97316';
    case 'critical':
      return theme.colors.danger;
    default:
      return theme.colors.textMuted;
  }
}

function TrendArrow({ trend, theme }: { trend: string; theme: any }) {
  let symbol = '→';
  let color = theme.colors.textMuted;
  let label = 'Stable';
  if (trend === 'improving') {
    symbol = '↑';
    color = theme.colors.success;
    label = 'Improving';
  } else if (trend === 'worsening') {
    symbol = '↓';
    color = theme.colors.danger;
    label = 'Worsening';
  }
  return (
    <View style={styles.trendContainer}>
      <Text style={[styles.trendArrow, { color }]}>{symbol}</Text>
      <Text style={[styles.trendLabel, { color }]}>{label}</Text>
    </View>
  );
}

export default function BurnoutScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { data: burnout, isLoading, isError, refetch } = useBurnoutRisk();

  const signalScores = useMemo(() => {
    if (!burnout) return [0, 0, 0, 0, 0];
    const totalScore = burnout.score;
    const signalCount = burnout.signals.length;
    if (signalCount === 0) return [0, 0, 0, 0, 0];
    const perSignal = Math.round(totalScore / signalCount);
    const scores = [0, 0, 0, 0, 0];
    for (let i = 0; i < Math.min(signalCount, 5); i++) {
      scores[i] = perSignal;
    }
    if (signalCount < 5) {
      scores[0] = totalScore - perSignal * (signalCount - 1);
    }
    return scores;
  }, [burnout]);

  const riskColor = getRiskColor(theme, burnout?.level ?? 'low');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backArrow, { color: theme.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Burnout Risk</Text>
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
          {/* Risk Gauge */}
          <View style={[styles.gaugeCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={[styles.gaugeCircle, { borderColor: riskColor }]}>
              <Text style={[styles.gaugeScore, { color: riskColor }]}>{burnout?.score ?? 0}</Text>
              <Text style={[styles.gaugeLabel, { color: theme.colors.textMuted }]}>out of 100</Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: riskColor + '20' }]}>
              <Text style={[styles.levelText, { color: riskColor }]}>{burnout?.level ?? 'low'}</Text>
            </View>
            <TrendArrow trend={burnout?.trend ?? 'stable'} theme={theme} />
          </View>

          {/* Signal Breakdown */}
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>RISK SIGNALS</Text>
            <View style={styles.signalsList}>
              {SIGNAL_LABELS.map((label, i) => (
                <View key={i} style={styles.signalItem}>
                  <View style={styles.signalHeader}>
                    <Text style={[styles.signalLabel, { color: theme.colors.text }]}>{label}</Text>
                    <Text style={[styles.signalScore, { color: theme.colors.textMuted }]}>{signalScores[i]}/20</Text>
                  </View>
                  <View style={[styles.signalBarBg, { backgroundColor: theme.colors.surfaceMuted }]}>
                    <View
                      style={[
                        styles.signalBarFill,
                        {
                          backgroundColor: riskColor,
                          width: `${Math.min(100, (signalScores[i] / 20) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Recommendation */}
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>RECOMMENDATION</Text>
            <Text style={[styles.recommendationText, { color: theme.colors.text }]}>
              {getRecommendation(burnout?.level ?? 'low')}
            </Text>
          </View>

          {/* Disclaimer */}
          <Text style={[styles.disclaimer, { color: theme.colors.textSubtle }]}>
            This reflects behavioral trends only and is not a medical diagnosis.
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
    gap: 16,
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
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendArrow: {
    fontSize: 20,
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: 15,
    fontWeight: '600',
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
  signalsList: {
    gap: 14,
  },
  signalItem: {
    gap: 6,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  signalScore: {
    fontSize: 13,
    fontWeight: '500',
  },
  signalBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  signalBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
