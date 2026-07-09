import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTractionTheme, type TractionTheme } from '../../theme';

export interface FrictionBadgeProps {
  score: number;
  max?: number;
  style?: StyleProp<ViewStyle>;
}

export function FrictionBadge({ score, max = 100, style }: FrictionBadgeProps) {
  const theme = useTractionTheme();
  const tone = score <= 30 ? 'success' : score <= 65 ? 'warning' : 'danger';
  const styles = createStyles(theme, tone);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.dot} />
      <Text style={styles.text}>Friction: {score}/{max}</Text>
    </View>
  );
}

function createStyles(theme: TractionTheme, tone: 'success' | 'warning' | 'danger') {
  const toneColor = {
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  }[tone];

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    dot: {
      backgroundColor: toneColor,
      borderRadius: theme.radius.full,
      height: 8,
      width: 8,
    },
    text: {
      ...theme.typography.labelSm,
      color: theme.colors.textMuted,
    },
  });
}

