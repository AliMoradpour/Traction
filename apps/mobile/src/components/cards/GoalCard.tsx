import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTractionTheme, type TractionTheme } from '../../theme';
import { MetricPill } from '../ui/MetricPill';
import { ProgressBar } from '../ui/ProgressBar';

export type GoalRiskLevel = 'low' | 'medium' | 'high';

export interface GoalCardProps {
  title: string;
  subtitle?: string;
  progress: number;
  riskLevel?: GoalRiskLevel;
  dueLabel?: string;
  aiSuggestion?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function GoalCard({
  title,
  subtitle,
  progress,
  riskLevel = 'low',
  dueLabel,
  aiSuggestion,
  onPress,
  style,
}: GoalCardProps) {
  const theme = useTractionTheme();
  const styles = createStyles(theme, riskLevel);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed, style]}
    >
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <RiskMeter riskLevel={riskLevel} />
      </View>
      <View style={styles.metaRow}>
        {dueLabel ? <MetricPill label={dueLabel} /> : null}
        <MetricPill label={`${Math.round(progress)}%`} tone={riskLevel === 'high' ? 'danger' : riskLevel === 'medium' ? 'warning' : 'success'} />
      </View>
      {aiSuggestion ? (
        <View style={styles.suggestion}>
          <Text style={styles.suggestionText}>{aiSuggestion}</Text>
        </View>
      ) : null}
      <ProgressBar value={progress} tone={riskLevel === 'high' ? 'danger' : riskLevel === 'medium' ? 'warning' : 'success'} />
    </Pressable>
  );
}

function RiskMeter({ riskLevel }: { riskLevel: GoalRiskLevel }) {
  const theme = useTractionTheme();
  const activeSegments = riskLevel === 'low' ? 1 : riskLevel === 'medium' ? 2 : 3;
  const tone = riskLevel === 'low' ? theme.colors.success : riskLevel === 'medium' ? theme.colors.warning : theme.colors.danger;

  return (
    <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={{
            backgroundColor: index < activeSegments ? tone : theme.colors.surfaceMuted,
            borderRadius: theme.radius.full,
            height: 16,
            width: 4,
          }}
        />
      ))}
    </View>
  );
}

function createStyles(theme: TractionTheme, riskLevel: GoalRiskLevel) {
  const riskBorder = riskLevel === 'high' ? theme.colors.danger : riskLevel === 'medium' ? theme.colors.warning : theme.colors.borderMuted;

  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: riskBorder,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      ...theme.shadows.card,
    },
    pressed: {
      transform: [{ scale: 0.99 }],
    },
    header: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    titleGroup: {
      flex: 1,
      gap: theme.spacing.xs,
      paddingRight: theme.spacing.md,
    },
    title: {
      ...theme.typography.titleMd,
      color: theme.colors.text,
    },
    subtitle: {
      ...theme.typography.bodySm,
      color: theme.colors.textMuted,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    suggestion: {
      backgroundColor: theme.colors.surfaceSoft,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
    },
    suggestionText: {
      ...theme.typography.bodySm,
      color: theme.colors.textMuted,
    },
  });
}

