import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTractionTheme, type TractionTheme } from '../../theme';
import { FrictionBadge } from '../ui/FrictionBadge';
import { MetricPill } from '../ui/MetricPill';

export type TaskStatus = 'pending' | 'inProgress' | 'completed' | 'delayed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskCardProps {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  durationMinutes?: number;
  category?: string;
  frictionScore?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function TaskCard({
  title,
  description,
  status = 'pending',
  priority = 'medium',
  durationMinutes,
  category,
  frictionScore,
  onPress,
  style,
}: TaskCardProps) {
  const theme = useTractionTheme();
  const styles = createStyles(theme, status);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed, style]}
    >
      <View style={styles.topRow}>
        <View style={styles.checkbox}>{status === 'completed' ? <View style={styles.checkboxInner} /> : null}</View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text numberOfLines={2} style={styles.title}>
              {title}
            </Text>
            <MetricPill label={priority} tone={priority === 'high' ? 'danger' : priority === 'medium' ? 'warning' : 'neutral'} />
          </View>
          {description ? (
            <Text numberOfLines={2} style={styles.description}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.metaRow}>
        {durationMinutes ? <Text style={styles.meta}>{durationMinutes}m</Text> : null}
        {category ? <Text style={styles.meta}>{category}</Text> : null}
        {typeof frictionScore === 'number' ? <FrictionBadge score={frictionScore} /> : null}
      </View>
    </Pressable>
  );
}

function createStyles(theme: TractionTheme, status: TaskStatus) {
  const statusStyle = {
    pending: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.borderMuted,
      leftBorder: theme.colors.borderMuted,
      opacity: 1,
    },
    inProgress: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.borderMuted,
      leftBorder: theme.colors.accent,
      opacity: 1,
    },
    completed: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.borderMuted,
      leftBorder: theme.colors.success,
      opacity: 0.6,
    },
    delayed: {
      backgroundColor: theme.colors.warningSurface,
      borderColor: theme.colors.warning,
      leftBorder: theme.colors.warning,
      opacity: 1,
    },
  }[status];

  return StyleSheet.create({
    card: {
      backgroundColor: statusStyle.backgroundColor,
      borderColor: statusStyle.borderColor,
      borderLeftColor: statusStyle.leftBorder,
      borderLeftWidth: status === 'inProgress' || status === 'delayed' || status === 'completed' ? 3 : 1,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      gap: theme.spacing.md,
      opacity: statusStyle.opacity,
      padding: theme.spacing.md,
      ...theme.shadows.card,
    },
    pressed: {
      transform: [{ scale: 0.99 }],
    },
    topRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    checkbox: {
      alignItems: 'center',
      borderColor: status === 'completed' ? theme.colors.success : theme.colors.borderStrong,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      height: 22,
      justifyContent: 'center',
      marginTop: 2,
      width: 22,
    },
    checkboxInner: {
      backgroundColor: theme.colors.success,
      borderRadius: theme.radius.full,
      height: 12,
      width: 12,
    },
    content: {
      flex: 1,
      gap: theme.spacing.sm,
    },
    titleRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'space-between',
    },
    title: {
      ...theme.typography.titleMd,
      color: theme.colors.text,
      flex: 1,
    },
    description: {
      ...theme.typography.bodyMd,
      color: theme.colors.textMuted,
    },
    metaRow: {
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      paddingLeft: 38,
    },
    meta: {
      ...theme.typography.labelSm,
      color: theme.colors.textSubtle,
    },
  });
}

