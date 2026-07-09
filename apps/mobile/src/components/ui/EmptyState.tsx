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

export function EmptyGoalsState({ onAddGoal }: { onAddGoal: () => void }) {
  const theme = useTractionTheme();

  return (
    <EmptyState
      icon={<Text style={{ fontSize: 32 }}>🎯</Text>}
      title="No goals yet"
      description="Setting goals helps AI prioritize your daily tasks based on what matters most to you."
      action={{
        title: 'Create Your First Goal',
        onPress: onAddGoal,
        variant: 'primary',
      }}
    />
  );
}

export function EmptyTasksState({ onAddTask }: { onAddTask: () => void }) {
  const theme = useTractionTheme();

  return (
    <EmptyState
      icon={<Text style={{ fontSize: 32 }}>📋</Text>}
      title="No tasks for today"
      description="Add tasks to your day and let AI help you prioritize based on your energy and friction patterns."
      action={{
        title: 'Add a Task',
        onPress: onAddTask,
        variant: 'primary',
      }}
    />
  );
}

export function EmptyInsightsState() {
  const theme = useTractionTheme();

  return (
    <EmptyState
      icon={<Text style={{ fontSize: 32 }}>🧠</Text>}
      title="No insights yet"
      description="Keep using Traction and we'll start identifying patterns in your behavior to help you work smarter."
    />
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an unexpected error. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  const theme = useTractionTheme();

  return (
    <EmptyState
      icon={<Text style={{ fontSize: 32 }}>⚠️</Text>}
      title={title}
      description={description}
      action={
        onRetry
          ? {
              title: 'Try Again',
              onPress: onRetry,
              variant: 'primary',
            }
          : undefined
      }
    />
  );
}

export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="No connection"
      description="Please check your internet connection and try again."
      onRetry={onRetry}
    />
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
