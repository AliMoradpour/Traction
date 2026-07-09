import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import Button from '@/components/ui/Button';

export default function GoalFeasibilityScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleAccept = () => {
    router.replace('/(app)/today');
  };

  const handleModify = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: theme.colors.accentMuted }]}>
            <Text style={styles.iconText}>🎯</Text>
          </View>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>ACTIVE FORECAST</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            IELTS 7.0 Certification
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            AI-generated projection based on historical energy patterns and cognitive load.
          </Text>
        </View>

        <View style={styles.analysisGrid}>
          <View style={[styles.analysisCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>PROBABILITY</Text>
            <Text style={[styles.cardValue, { color: theme.colors.text }]}>High</Text>
            <View style={styles.trendRow}>
              <Text style={[styles.trendText, { color: theme.colors.success }]}>↑ Confidence: 94%</Text>
            </View>
          </View>

          <View style={[styles.analysisCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>RISK PROFILE</Text>
            <Text style={[styles.cardValue, { color: theme.colors.text }]}>Low</Text>
            <View style={styles.riskMeter}>
              <View style={[styles.riskBar, { backgroundColor: theme.colors.success }]} />
              <View style={[styles.riskBar, { backgroundColor: theme.colors.border }]} />
              <View style={[styles.riskBar, { backgroundColor: theme.colors.border }]} />
            </View>
          </View>

          <View style={[styles.timelineCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={styles.timelineHeader}>
              <View>
                <Text style={[styles.cardLabel, { color: theme.colors.textMuted }]}>OPTIMIZED TIMELINE</Text>
                <Text style={[styles.cardValue, { color: theme.colors.text }]}>180 Days</Text>
              </View>
              <View style={[styles.targetBadge, { backgroundColor: theme.colors.accentMuted }]}>
                <Text style={[styles.targetText, { color: theme.colors.accent }]}>Target: Oct 24</Text>
              </View>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
              <View style={[styles.progressFill, { backgroundColor: theme.colors.primary, width: '33%' }]} />
            </View>
          </View>
        </View>

        <View style={[styles.readinessCard, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Text style={[styles.readinessTitle, { color: theme.colors.text }]}>
            Readiness Visualizer
          </Text>
          <View style={styles.chartContainer}>
            {[40, 60, 55, 85, 100, 70, 45].map((height, index) => (
              <View
                key={index}
                style={[
                  styles.chartBar,
                  {
                    height: `${height}%`,
                    backgroundColor: index === 4 ? theme.colors.primary : `${theme.colors.primary}${Math.round(height).toString(16).padStart(2, '0')}`,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.chartLabels}>
            <Text style={[styles.chartLabel, { color: theme.colors.textMuted }]}>Current Baseline</Text>
            <Text style={[styles.chartLabel, { color: theme.colors.text, fontWeight: '700' }]}>
              Peak Potential
            </Text>
            <Text style={[styles.chartLabel, { color: theme.colors.textMuted }]}>
              Burnout Threshold
            </Text>
          </View>
        </View>

        <View style={[styles.insightCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
          <View style={[styles.insightIcon, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.insightIconText}>✨</Text>
          </View>
          <Text style={[styles.insightText, { color: theme.colors.text }]}>
            "This is achievable based on your current energy patterns. Your cognitive stamina peaks
            between 08:00 and 10:30, aligning perfectly with intensive study requirements."
          </Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Button variant="primary" size="lg" onPress={handleAccept} style={styles.acceptButton}>
          Accept Path & Initialize →
        </Button>
        <Button variant="secondary" size="lg" onPress={handleModify}>
          Modify Constraints
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
    gap: 8,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.01,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  analysisGrid: {
    gap: 12,
    marginBottom: 16,
  },
  analysisCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '500',
  },
  riskMeter: {
    flexDirection: 'row',
    gap: 4,
  },
  riskBar: {
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  timelineCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  targetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  targetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  readinessCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  readinessTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: 8,
  },
  chartBar: {
    flex: 1,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightIconText: {
    fontSize: 16,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  acceptButton: {
    width: '100%',
  },
});
