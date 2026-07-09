import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTractionTheme, type TractionTheme } from '../../theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Header({ title, subtitle, leading, trailing, compact = false, style }: HeaderProps) {
  const theme = useTractionTheme();
  const styles = createStyles(theme, compact);

  return (
    <View style={[styles.container, style]}>
      {leading ? <View style={styles.side}>{leading}</View> : null}
      <View style={styles.copy}>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
      </View>
      {trailing ? <View style={styles.side}>{trailing}</View> : null}
    </View>
  );
}

function createStyles(theme: TractionTheme, compact: boolean) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.md,
      minHeight: compact ? 48 : 64,
    },
    side: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 40,
    },
    copy: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.labelSm,
      color: theme.colors.textMuted,
    },
    title: {
      ...(compact ? theme.typography.headlineMd : theme.typography.displayLgMobile),
      color: theme.colors.text,
    },
  });
}

