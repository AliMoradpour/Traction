import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTractionTheme, type TractionTheme } from '../../theme';
import { Button, type ButtonProps } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: Pick<ButtonProps, 'title' | 'onPress' | 'variant'>;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({ title, description, icon, action, style }: EmptyStateProps) {
  const theme = useTractionTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, style]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {action ? <Button fullWidth={false} variant={action.variant ?? 'secondary'} title={action.title} onPress={action.onPress} /> : null}
    </View>
  );
}

function createStyles(theme: TractionTheme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: theme.spacing.lg,
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    icon: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceSoft,
      borderRadius: theme.radius.full,
      height: 56,
      justifyContent: 'center',
      width: 56,
    },
    copy: {
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    title: {
      ...theme.typography.headlineMd,
      color: theme.colors.text,
      textAlign: 'center',
    },
    description: {
      ...theme.typography.bodyMd,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
  });
}

