import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTractionTheme, type TractionTheme } from '../../theme';

export interface MetricPillProps {
  label: string;
  value?: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export function MetricPill({ label, value, tone = 'neutral', style }: MetricPillProps) {
  const theme = useTractionTheme();
  const styles = createStyles(theme, tone);

  return (
    <View style={[styles.container, style]}>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function createStyles(theme: TractionTheme, tone: NonNullable<MetricPillProps['tone']>) {
  const paletteByTone = {
    neutral: { backgroundColor: theme.colors.surfaceSoft, color: theme.colors.textMuted },
    accent: { backgroundColor: theme.colors.accentMuted, color: theme.colors.accentText },
    success: { backgroundColor: theme.colors.successSurface, color: theme.colors.successText },
    warning: { backgroundColor: theme.colors.warningSurface, color: theme.colors.warningText },
    danger: { backgroundColor: theme.colors.dangerSurface, color: theme.colors.dangerText },
  }[tone];

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: paletteByTone.backgroundColor,
      borderRadius: theme.radius.full,
      flexDirection: 'row',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    value: {
      ...theme.typography.labelXs,
      color: paletteByTone.color,
    },
    label: {
      ...theme.typography.labelXs,
      color: paletteByTone.color,
    },
  });
}

