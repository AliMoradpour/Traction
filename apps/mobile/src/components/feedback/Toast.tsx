import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTractionTheme } from '@/theme';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onDismiss?: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onDismiss }: ToastProps) {
  const theme = useTractionTheme();
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  }, [duration, onDismiss, opacity]);

  const backgroundColor = {
    success: theme.colors.successSurface,
    error: theme.colors.dangerSurface,
    warning: theme.colors.warningSurface,
    info: theme.colors.accentMuted,
  }[type];

  const textColor = {
    success: theme.colors.successText,
    error: theme.colors.dangerText,
    warning: theme.colors.warningText,
    info: theme.colors.accentText,
  }[type];

  return (
    <Animated.View style={[styles.container, { backgroundColor, opacity }]}>
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    zIndex: 1000,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
