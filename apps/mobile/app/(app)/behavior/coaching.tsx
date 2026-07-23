import { useRef, useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import {
  useBehaviorIndicators,
  useBurnoutRisk,
  useProcrastinationProfile,
} from '@/hooks/useBehavior';

interface CoachingSection {
  title: string;
  icon: string;
  items: CoachingItem[];
}

interface CoachingItem {
  label: string;
  detail: string;
  metric?: string;
  why: string;
}

function ScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Needs attention';
  return 'Critical';
}

function RiskBadge({ level, theme }: { level: string; theme: any }) {
  const colors: Record<string, { bg: string; text: string }> = {
    low: { bg: '#ECFDF5', text: '#047857' },
    moderate: { bg: '#FEF3C7', text: '#B45309' },
    high: { bg: '#FFF7ED', text: '#C2410C' },
    critical: { bg: '#FEE2E2', text: '#B91C1C' },
  };
  const c = colors[level] || colors.low;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{level}</Text>
    </View>
  );
}

function CoachingItemCard({ item, theme }: { item: CoachingItem; theme: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={[styles.coachingItem, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <View style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemLabel, { color: theme.colors.text }]}>{item.label}</Text>
            {item.metric ? (
              <Text style={[styles.itemMetric, { color: theme.colors.textMuted }]}>{item.metric}</Text>
            ) : null}
          </View>
          <Text style={[styles.expandIcon, { color: theme.colors.textMuted }]}>{expanded ? '▲' : '▼'}</Text>
        </View>
        <Text style={[styles.itemDetail, { color: theme.colors.text }]}>{item.detail}</Text>
      </Pressable>
      {expanded && (
        <View style={[styles.whySection, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.whyLabel, { color: theme.colors.primary }]}>Why this recommendation?</Text>
          <Text style={[styles.whyText, { color: theme.colors.textMuted }]}>{item.why}</Text>
        </View>
      )}
    </View>
  );
}

function CoachingSectionCard({ section, theme }: { section: CoachingSection; theme: any }) {
  if (section.items.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{section.icon}</Text>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
      </View>
      {section.items.map((item, i) => (
        <CoachingItemCard key={`${section.title}-${i}`} item={item} theme={theme} />
      ))}
    </View>
  );
}

export default function CoachingScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: indicators, isLoading: loadingIndicators, refetch: refetchIndicators } = useBehaviorIndicators();
  const { data: burnout, isLoading: loadingBurnout, refetch: refetchBurnout } = useBurnoutRisk();
  const { data: procrastination, isLoading: loadingProcrastination, refetch: refetchProcrastination } = useProcrastinationProfile();

  const isLoading = loadingIndicators || loadingBurnout || loadingProcrastination;

  const handleRefresh = useCallback(() => {
    refetchIndicators();
    refetchBurnout();
    refetchProcrastination();
  }, [refetchIndicators, refetchBurnout, refetchProcrastination]);

  const coachingSections = useMemo<CoachingSection[]>(() => {
    const strengths: CoachingItem[] = [];
    const improvements: CoachingItem[] = [];

    if (indicators) {
      const indicatorMap: Record<string, { label: string; value: number; desc: string }> = {
        consistency: { label: 'Consistency', value: indicators.consistencyScore, desc: 'How reliably you stick to your schedule' },
        execution: { label: 'Execution', value: indicators.executionScore, desc: 'How well you follow through on plans' },
        reliability: { label: 'Reliability', value: indicators.reliabilityScore, desc: 'How dependable you are with commitments' },
        planning: { label: 'Planning Accuracy', value: indicators.planningAccuracy, desc: 'How realistic your plans are' },
        momentum: { label: 'Momentum', value: indicators.momentumScore, desc: 'How well you maintain forward progress' },
        recovery: { label: 'Recovery', value: indicators.recoveryScore, desc: 'How you bounce back from setbacks' },
      };

      Object.values(indicatorMap).forEach(({ label, value, desc }) => {
        if (value >= 60) {
          strengths.push({
            label: `Strong ${label}`,
            detail: `You're doing great — your ${label.toLowerCase()} score is ${value}/100. ${desc}.`,
            metric: `${value}/100 — ${ScoreLabel(value)}`,
            why: `A ${label.toLowerCase()} score above 60 indicates this is an area of strength. This means ${desc.toLowerCase()} is working well for you right now. Keep maintaining this habit.`,
          });
        } else {
          improvements.push({
            label: `Improve ${label}`,
            detail: `Your ${label.toLowerCase()} is at ${value}/100. Consider ${getImprovementSuggestion(label.toLowerCase())}.`,
            metric: `${value}/100 — ${ScoreLabel(value)}`,
            why: `A ${label.toLowerCase()} score below 60 suggests there's room for growth. ${getWhyExplanation(label.toLowerCase())}`,
          });
        }
      });
    }

    const procrastinationItems: CoachingItem[] = [];
    if (procrastination) {
      const score = procrastination.score ?? 0;
      const freq = procrastination.frequency ?? 0;
      const patterns = procrastination.patterns ?? [];

      if (score < 30) {
        procrastinationItems.push({
          label: 'Low Procrastination Risk',
          detail: `Your procrastination score is low at ${score}/100. You tend to start tasks promptly.`,
          metric: `${score}/100 — Low risk`,
          why: 'A low procrastination score means you generally engage with tasks rather than avoiding them. This is a strong habit to maintain.',
        });
      } else {
        procrastinationItems.push({
          label: 'Procrastination Patterns Detected',
          detail: `You procrastinate about ${freq.toFixed(1)} times per week. Score: ${score}/100.`,
          metric: `${score}/100 — ${freq.toFixed(1)}x per week`,
          why: 'Understanding your procrastination frequency helps you plan around it. Try breaking tasks into smaller steps and setting earlier internal deadlines.',
        });
      }

      if (patterns.length > 0) {
        procrastinationItems.push({
          label: 'Pattern Insights',
          detail: `Common patterns: ${patterns.join(', ')}. Consider counter-strategies for each.`,
          why: 'Recognizing specific patterns is the first step to changing them. Each pattern has a targeted counter-strategy that can help you stay on track.',
        });
      }
    }

    const burnoutItems: CoachingItem[] = [];
    if (burnout) {
      const level = burnout.level ?? 'low';
      const score = burnout.score ?? 0;

      burnoutItems.push({
        label: `Burnout Risk: ${level}`,
        detail: getBurnoutDetail(level, score),
        metric: `Risk score: ${score}/100`,
        why: getBurnoutWhy(level),
      });

      if (level !== 'low') {
        burnoutItems.push({
          label: 'Preventive Actions',
          detail: getBurnoutPrevention(level),
          why: 'Taking preventive action before burnout escalates is key to maintaining long-term productivity. Small changes now prevent bigger problems later.',
        });
      }
    }

    const weeklyFocus = getWeeklyFocus(indicators, burnout, procrastination);

    return [
      { title: 'Your Strengths', icon: '💪', items: strengths },
      { title: 'Areas for Improvement', icon: '🎯', items: improvements },
      { title: 'Procrastination Insights', icon: '🧠', items: procrastinationItems },
      { title: 'Burnout Prevention', icon: '🛡️', items: burnoutItems },
      { title: 'Weekly Focus', icon: '📅', items: weeklyFocus },
    ];
  }, [indicators, burnout, procrastination]);

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 500,
    useNativeDriver: true,
  }).start();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backArrow, { color: theme.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Behavior Coaching</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Analyzing your behavior...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={theme.colors.primary} />}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {burnout ? (
              <View style={[styles.statusCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.textMuted }]}>OVERALL STATUS</Text>
                <View style={styles.statusRow}>
                  <RiskBadge level={burnout.level ?? 'low'} theme={theme} />
                  {burnout.trend ? (
                    <Text style={[styles.trendText, { color: theme.colors.textMuted }]}>
                      Trend: {burnout.trend}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            {coachingSections.map((section) => (
              <CoachingSectionCard key={section.title} section={section} theme={theme} />
            ))}

            <Pressable
              style={[styles.refreshButton, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
              onPress={handleRefresh}
            >
              <Text style={[styles.refreshButtonText, { color: theme.colors.primary }]}>↻ Refresh Analysis</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function getImprovementSuggestion(indicator: string): string {
  const suggestions: Record<string, string> = {
    consistency: 'setting smaller daily commitments and building gradually',
    execution: 'breaking tasks into smaller, actionable steps',
    reliability: 'tracking deadlines more carefully and setting reminders',
    planning: 'estimating task durations more conservatively',
    momentum: 'celebrating small wins and maintaining daily progress rituals',
    recovery: 'building in rest periods and developing a setback routine',
  };
  return suggestions[indicator] || 'reviewing your approach and adjusting habits';
}

function getWhyExplanation(indicator: string): string {
  const explanations: Record<string, string> = {
    consistency: 'Consistency builds momentum. Try committing to one small daily habit and expanding from there.',
    execution: 'Execution improves when tasks are broken down. Start with the smallest possible action for each task.',
    reliability: 'Reliability is about setting realistic commitments. Only promise what you can deliver, then exceed expectations.',
    planning: 'Planning accuracy improves with practice. Track your actual vs. estimated times to calibrate better.',
    momentum: 'Momentum requires regular checkpoints. Review your progress weekly and adjust course as needed.',
    recovery: 'Recovery is a skill. After a setback, acknowledge it, learn from it, and take one small step forward.',
  };
  return explanations[indicator] || 'Focus on small, consistent improvements in this area.';
}

function getBurnoutDetail(level: string, score: number): string {
  if (level === 'low') return `Your burnout risk is low (score: ${score}/100). You're managing your energy well.`;
  if (level === 'moderate') return `Moderate burnout risk detected (score: ${score}/100). Consider reducing your load this week.`;
  if (level === 'high') return `High burnout risk (score: ${score}/100). It's time to prioritize rest and recovery.`;
  return `Critical burnout risk (score: ${score}/100). Please consider taking time off and speaking with someone you trust.`;
}

function getBurnoutWhy(level: string): string {
  if (level === 'low') return 'Your current balance looks sustainable. Keep listening to your body and maintaining healthy boundaries.';
  return 'Burnout builds gradually. Addressing it early prevents long-term damage to your health and productivity. Small changes now — like adding breaks, delegating, or saying no — can make a significant difference.';
}

function getBurnoutPrevention(level: string): string {
  if (level === 'moderate') {
    return 'Try scheduling short breaks between tasks, setting a firm end-of-day time, and reducing non-essential commitments this week.';
  }
  if (level === 'high') {
    return 'Consider taking a day off, delegating tasks, and focusing only on the essentials. Talk to someone about how you\'re feeling.';
  }
  return 'Please prioritize rest. Consider taking time off, disconnecting from work, and reaching out for support. Your health comes first.';
}

function getWeeklyFocus(
  indicators: any,
  burnout: any,
  procrastination: any
): CoachingItem[] {
  const items: CoachingItem[] = [];

  if (burnout && (burnout.level === 'high' || burnout.level === 'critical')) {
    items.push({
      label: 'Priority: Rest & Recovery',
      detail: 'This week, focus on reducing your load. Aim for 7-8 hours of sleep and schedule at least one full rest day.',
      why: 'When burnout risk is high, recovery takes priority over productivity. Sustainable performance requires rest.',
    });
  }

  if (indicators) {
    const lowest = findLowestIndicator(indicators);
    if (lowest) {
      items.push({
        label: `Focus: Improve ${lowest.name}`,
        detail: `Your ${lowest.name.toLowerCase()} is your lowest score at ${lowest.value}/100. One small change: ${getImprovementSuggestion(lowest.name.toLowerCase())}.`,
        why: `Improving your weakest area gives the biggest return. Small, focused effort here will lift your overall performance.`,
      });
    }
  }

  if (procrastination && procrastination.score >= 40) {
    items.push({
      label: 'Focus: Beat Procrastination',
      detail: 'Try the 2-minute rule: if a task takes less than 2 minutes, do it now. For bigger tasks, commit to just 5 minutes of work.',
      why: 'Procrastination often comes from overwhelm. Starting small bypasses resistance and builds momentum.',
    });
  }

  if (items.length === 0) {
    items.push({
      label: 'Keep Going',
      detail: 'Your metrics look solid. Focus on maintaining your current habits and looking for small optimizations.',
      why: 'When things are going well, the goal is consistency. Don\'t fix what isn\'t broken.',
    });
  }

  return items;
}

function findLowestIndicator(indicators: any): { name: string; value: number } | null {
  const map = [
    { name: 'Consistency', value: indicators.consistencyScore },
    { name: 'Execution', value: indicators.executionScore },
    { name: 'Reliability', value: indicators.reliabilityScore },
    { name: 'Planning', value: indicators.planningAccuracy },
    { name: 'Momentum', value: indicators.momentumScore },
    { name: 'Recovery', value: indicators.recoveryScore },
  ];
  map.sort((a, b) => a.value - b.value);
  return map[0] ?? null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '300',
    marginTop: -4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  trendText: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  coachingItem: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemMetric: {
    fontSize: 12,
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 12,
    marginLeft: 8,
  },
  itemDetail: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  whySection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  whyLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  whyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  refreshButton: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
