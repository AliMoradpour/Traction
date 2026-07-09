import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTractionTheme, type TractionTheme } from '../../theme';
import { MetricPill } from '../ui/MetricPill';

export interface InsightCardProps {
  title: string;
  body: string;
  eyebrow?: string;
  metric?: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  icon?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function InsightCard({
  title,
  body,
  eyebrow,
  metric,
  tone = 'neutral',
  icon,
  onPress,
  style,
}: InsightCardProps) {
  const theme = useTractionTheme();
  const styles = createStyles(theme);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed, style]}
    >
      <View style={styles.header}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <View style={styles.heading}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
        {metric ? <MetricPill label={metric} tone={tone} /> : null}
      </View>
      <Text style={styles.body}>{body}</Text>
    </Pressable>
  );
}

function createStyles(theme: TractionTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.borderMuted,
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
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    icon: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceSoft,
      borderRadius: theme.radius.full,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    heading: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    eyebrow: {
      ...theme.typography.labelXs,
      color: theme.colors.textSubtle,
    },
    title: {
      ...theme.typography.titleMd,
      color: theme.colors.text,
    },
    body: {
      ...theme.typography.bodyMd,
      color: theme.colors.textMuted,
    },
  });
}

