import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import Button from '@/components/ui/Button';

const MOCK_WINS = [
  'Closed the quarterly projection ahead of schedule.',
  'Maintained a 4-day deep work streak before 10 AM.',
];

const MOCK_PATTERNS = [
  { type: 'Timing Insight', text: 'Most missed tasks occurred after 6 PM.' },
  { type: 'Contextual Drift', text: 'Administrative tasks take 40% longer when started on Mondays.' },
];

const MOCK_CHART_DATA = [20, 35, 30, 25, 85, 95, 15];

export default function WeeklyReviewScreen() {
  const theme = useTractionTheme();
  const router = useRouter();

  const handleApplyToCalendar = () => {
    // TODO: Apply AI recommendation to calendar
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerSection}>
          <Text style={[styles.dateRange, { color: theme.colors.primary }]}>MARCH 11 – MARCH 17</Text>
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
            <View style={styles.winsList}>
              {MOCK_WINS.map((win, index) => (
                <View key={index} style={styles.winItem}>
                  <View style={[styles.winDot, { backgroundColor: theme.colors.primary }]} />
                  <Text style={[styles.winText, { color: theme.colors.textMuted }]}>{win}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.commitmentsCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.cardIcon}>📋</Text>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Commitments</Text>
              </View>
              <View style={[styles.successBadge, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Text style={[styles.successText, { color: theme.colors.textMuted }]}>74% Success</Text>
              </View>
            </View>
            <Text style={[styles.commitmentsSummary, { color: theme.colors.textMuted }]}>
              This week you completed 14 of 19 planned tasks.
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
              <View style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: '74%' }]} />
            </View>
          </View>

          <View style={[styles.patternsCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🧠</Text>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Behavior Patterns</Text>
            </View>
            <View style={styles.patternsContent}>
              <View style={styles.patternsList}>
                {MOCK_PATTERNS.map((pattern, index) => (
                  <View key={index} style={[styles.patternItem, { borderLeftColor: index === 0 ? theme.colors.primary : theme.colors.border }]}>
                    <Text style={[styles.patternType, { color: theme.colors.primary }]}>{pattern.type}</Text>
                    <Text style={[styles.patternText, { color: theme.colors.text }]}>{pattern.text}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.chart}>
                {MOCK_CHART_DATA.map((value, index) => (
                  <View key={index} style={styles.chartBar}>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor: index >= 4 ? theme.colors.primary : theme.colors.surfaceMuted,
                          height: `${value}%`,
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.aiCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiIcon}>✨</Text>
              <Text style={[styles.aiLabel, { color: theme.colors.onPrimaryContainer }]}>AI SYNTHESIS</Text>
            </View>
            <Text style={[styles.aiTitle, { color: theme.colors.onPrimaryContainer }]}>Optimal Shift</Text>
            <Text style={[styles.aiContent, { color: theme.colors.onPrimaryContainer }]}>
              Based on your cognitive energy patterns, schedule difficult work before lunch to increase task completion by 32%.
            </Text>
            <Button variant="secondary" onPress={handleApplyToCalendar} style={styles.applyButton}>
              Apply to Calendar
            </Button>
          </View>
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
  headerSection: {
    marginBottom: 24,
  },
  dateRange: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
    marginBottom: 8,
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
    minHeight: 160,
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
  patternsContent: {
    gap: 16,
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
  patternType: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: 4,
  },
  patternText: {
    fontSize: 15,
    lineHeight: 20,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 16,
  },
  chartBar: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderRadius: 4,
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
