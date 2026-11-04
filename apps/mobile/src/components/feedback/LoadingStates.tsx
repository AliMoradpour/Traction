import { ActivityIndicator, StyleSheet,Text, View } from 'react-native';

import { useTractionTheme } from '@/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}

export function LoadingSpinner({ size = 'large', color: colorProp, message }: LoadingSpinnerProps) {
  const theme = useTractionTheme();
  const color = colorProp ?? theme.colors.accent;
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={[styles.message, { color }]}>{message}</Text>}
    </View>
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  const theme = useTractionTheme();
  return (
    <View style={[styles.overlay, { backgroundColor: theme.colors.scrim }]}>
      <View style={[styles.overlayContent, { backgroundColor: theme.colors.surface }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={[styles.overlayMessage, { color: theme.colors.text }]}>{message}</Text>
      </View>
    </View>
  );
}

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: string;
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      {icon && <Text style={styles.emptyIcon}>{icon}</Text>}
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={styles.emptyMessage}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  overlayMessage: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
  },
});
