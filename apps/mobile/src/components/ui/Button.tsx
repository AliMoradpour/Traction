import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTractionTheme, type TractionTheme } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title?: string;
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: (event: GestureResponderEvent) => void;
}

export function Button({
  title,
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
  accessibilityLabel,
  ...pressableProps
}: ButtonProps) {
  const theme = useTractionTheme();
  const styles = createStyles(theme);
  const isDisabled = disabled || loading;
  const contentColor = getContentColor(theme, variant, isDisabled);
  const variantTextStyle = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    ghost: styles.ghostText,
    danger: styles.dangerText,
  }[variant];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      {...pressableProps}
    >
      {loading ? <ActivityIndicator color={contentColor} size="small" /> : iconLeft}
      {title ? <Text style={[styles.text, variantTextStyle, textStyle]}>{title}</Text> : children}
      {!loading ? iconRight : null}
    </Pressable>
  );
}

function getContentColor(theme: TractionTheme, variant: ButtonVariant, disabled: boolean) {
  if (disabled) return theme.colors.textSubtle;
  if (variant === 'primary' || variant === 'danger') return theme.colors.textInverse;
  if (variant === 'secondary') return theme.colors.text;
  return theme.colors.textMuted;
}

function createStyles(theme: TractionTheme) {
  return StyleSheet.create({
    base: {
      alignItems: 'center',
      borderRadius: theme.radius.md,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    fullWidth: {
      width: '100%',
    },
    sm: {
      minHeight: theme.spacing.controlHeightSm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    md: {
      minHeight: theme.spacing.controlHeightMd,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: 14,
    },
    lg: {
      minHeight: theme.spacing.controlHeightLg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
    secondary: {
      backgroundColor: theme.colors.surfaceSoft,
      borderColor: theme.colors.borderMuted,
      borderWidth: 1,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 1,
    },
    danger: {
      backgroundColor: theme.colors.danger,
      borderColor: theme.colors.danger,
      borderWidth: 1,
    },
    disabled: {
      backgroundColor: theme.colors.disabled,
      borderColor: theme.colors.borderMuted,
      opacity: 0.72,
    },
    pressed: {
      transform: [{ scale: 0.98 }],
    },
    text: {
      ...theme.typography.labelSm,
      textAlign: 'center',
    },
    primaryText: {
      color: theme.colors.textInverse,
    },
    secondaryText: {
      color: theme.colors.text,
    },
    ghostText: {
      color: theme.colors.textMuted,
    },
    dangerText: {
      color: theme.colors.textInverse,
    },
  });
}
