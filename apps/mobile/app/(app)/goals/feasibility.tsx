import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Glyph } from '@/components/calm/Glyph';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useGoal, useGoalFeasibility } from '@/hooks/useGoals';
import { useTractionTheme } from '@/theme';

const READINESS_LABEL = { high: 'High', medium: 'Medium', low: 'Low' } as const;
const CONFIDENCE_NOTE = {
  low: 'Less than a week of history, so this is a rough early estimate.',
  medium: 'A few weeks of history. The estimate will firm up as you go.',
  high: 'Based on several weeks of your progress.',
} as const;

function formatDate(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function GoalFeasibilityScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const { data: goal, isLoading: goalLoading } = useGoal(goalId || '');
  const { data: feasibility, isLoading: feasibilityLoading } = useGoalFeasibility(goalId || '');

  const header = (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} hitSlop={8}>
        <Text style={[styles.backBtn, { color: theme.colors.primary }]}>Back</Text>
      </Pressable>
      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Feasibility</Text>
      <View style={{ width: 50 }} />
    </View>
  );

  if (goalLoading || feasibilityLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {header}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!goal || !feasibility) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {header}
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {!goal ? 'Goal not found.' : "Couldn't load the forecast. Try again in a moment."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const f = feasibility;
  const readinessColor =
    f.readiness === 'high'
      ? theme.colors.success
      : f.readiness === 'medium'
        ? theme.colors.warning
        : theme.colors.danger;
  const filledBars = f.readiness === 'high' ? 1 : f.readiness === 'medium' ? 2 : 3;
  const riskColor = filledBars === 1 ? theme.colors.success : filledBars === 2 ? theme.colors.warning : theme.colors.danger;
  const card = { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {header}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Forecast</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>{goal.title}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            {CONFIDENCE_NOTE[f.confidence]}
          </Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.half, card]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>On-time chance</Text>
            <Text style={[styles.cardValue, { color: theme.colors.text }]}>
              {f.probability === null ? '—' : `${Math.round(f.probability * 100)}%`}
            </Text>
            <Text style={[styles.cardNote, { color: readinessColor }]}>
              {f.probability === null ? 'No target date' : `${READINESS_LABEL[f.readiness]} likelihood`}
            </Text>
          </View>

          <View style={[styles.card, styles.half, card]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>Risk</Text>
            <Text style={[styles.cardValue, { color: theme.colors.text }]}>
              {f.onTrack === null ? '—' : f.onTrack ? 'On pace' : 'Behind'}
            </Text>
            <View style={styles.riskMeter}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.riskBar,
                    { backgroundColor: i <= filledBars && f.onTrack !== null ? riskColor : theme.colors.border },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.card, card]}>
          <View style={styles.timelineHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>Timeline</Text>
              <Text style={[styles.cardValue, { color: theme.colors.text }]}>
                {f.daysRemaining === null
                  ? 'No deadline'
                  : f.daysRemaining > 0
                    ? `${f.daysRemaining} days left`
                    : 'Deadline passed'}
              </Text>
            </View>
            {goal.targetDate ? (
              <View style={[styles.targetBadge, { backgroundColor: theme.colors.accentMuted }]}>
                <Text style={[styles.targetText, { color: theme.colors.accent }]}>
                  Target: {formatDate(goal.targetDate)}
                </Text>
              </View>
            ) : null}
          </View>
          <ProgressBar value={f.progress} height={6} />
          <Text style={[styles.timelineText, { color: theme.colors.textMuted }]}>{f.timeline}</Text>
        </View>

        <View style={[styles.card, card]}>
          <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>Pace</Text>
          <View style={styles.paceRow}>
            <Text style={[styles.paceLabel, { color: theme.colors.textMuted }]}>Your pace</Text>
            <Text style={[styles.paceValue, { color: theme.colors.text }]}>
              {f.currentPace > 0 ? `${(f.currentPace * 7).toFixed(1)}% / week` : '—'}
            </Text>
          </View>
          <View style={styles.paceRow}>
            <Text style={[styles.paceLabel, { color: theme.colors.textMuted }]}>Needed</Text>
            <Text style={[styles.paceValue, { color: theme.colors.text }]}>
              {f.requiredPace !== null && f.requiredPace > 0 ? `${(f.requiredPace * 7).toFixed(1)}% / week` : '—'}
            </Text>
          </View>
          <View style={styles.paceRow}>
            <Text style={[styles.paceLabel, { color: theme.colors.textMuted }]}>Projected finish</Text>
            <Text style={[styles.paceValue, { color: theme.colors.text }]}>
              {formatDate(f.projectedCompletionDate)}
            </Text>
          </View>
        </View>

        <View style={[styles.insightCard, card]}>
          <View style={[styles.insightIcon, { backgroundColor: theme.colors.primary }]}>
            <Glyph emoji="✨" style={styles.insightIconText} />
          </View>
          <Text style={[styles.insightText, { color: theme.colors.text }]}>{f.recommendation}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push(`/(app)/goals/${goal.id}/projection` as any)}
            title="View Projection"
          />
          <Button
            variant="secondary"
            size="lg"
            onPress={() => router.push(`/(app)/goals/${goal.id}/edit` as any)}
            title="Adjust Goal"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { fontSize: 16, fontWeight: '500', width: 50 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyText: { fontSize: 15, textAlign: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  intro: { gap: 6, marginBottom: 8 },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 15, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  cardLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  cardValue: { fontSize: 24, fontWeight: '700' },
  cardNote: { fontSize: 13, fontWeight: '500' },
  riskMeter: { flexDirection: 'row', gap: 4 },
  riskBar: { width: 16, height: 4, borderRadius: 2 },
  timelineHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  targetBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  targetText: { fontSize: 11, fontWeight: '600' },
  timelineText: { fontSize: 14, lineHeight: 20 },
  paceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  paceLabel: { fontSize: 15 },
  paceValue: { fontSize: 15, fontWeight: '600' },
  insightCard: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  insightIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  insightIconText: { fontSize: 16 },
  insightText: { flex: 1, fontSize: 15, lineHeight: 20 },
  actions: { gap: 12, marginTop: 8 },
});
