import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTractionTheme, type TractionTheme } from '../../theme';

export interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({ value, max = 100, tone = 'accent', height = 4, style }: ProgressBarProps) {
  const theme = useTractionTheme();
  const styles = createStyles(theme, height);
  const percent = Math.max(0, Math.min(1, value / max));

  return (
    <View accessibilityRole="progressbar" style={[styles.track, style]}>
      <View style={[styles.fill, { width: `${percent * 100}%`, backgroundColor: getToneColor(theme, tone) }]} />
    </View>
  );
}

function getToneColor(theme: TractionTheme, tone: NonNullable<ProgressBarProps['tone']>) {
  return {
    accent: theme.colors.accent,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  }[tone];
}

function createStyles(theme: TractionTheme, height: number) {
  return StyleSheet.create({
    track: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: theme.radius.full,
      height,
      overflow: 'hidden',
      width: '100%',
    },
    fill: {
      borderRadius: theme.radius.full,
      height: '100%',
    },
  });
}

