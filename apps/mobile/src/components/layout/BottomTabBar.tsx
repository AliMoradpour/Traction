import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTractionTheme, type TractionTheme } from '../../theme';

export interface BottomTabItem {
  key: string;
  label: string;
  accessibilityLabel?: string;
  icon?: (state: { focused: boolean; color: string; size: number }) => ReactNode;
  badgeCount?: number;
}

export interface BottomTabBarProps {
  items: BottomTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function BottomTabBar({ items, activeKey, onChange, style }: BottomTabBarProps) {
  const theme = useTractionTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom);

  return (
    <View style={[styles.container, style]}>
      {items.map((item) => {
        const focused = item.key === activeKey;
        const color = focused ? theme.colors.accent : theme.colors.textSubtle;

        return (
          <Pressable
            key={item.key}
            accessibilityLabel={item.accessibilityLabel ?? item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            onPress={() => onChange(item.key)}
            style={styles.item}
          >
            <View style={styles.iconWrap}>
              {item.icon ? item.icon({ focused, color, size: 24 }) : <View style={[styles.fallbackIcon, { backgroundColor: color }]} />}
              {item.badgeCount ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badgeCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, { color }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(theme: TractionTheme, bottomInset: number) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceOverlay,
      borderColor: theme.colors.borderMuted,
      borderTopWidth: 1,
      flexDirection: 'row',
      gap: theme.spacing.xs,
      justifyContent: 'space-around',
      minHeight: theme.spacing.bottomTabHeight + bottomInset,
      paddingBottom: Math.max(bottomInset, theme.spacing.sm),
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      ...theme.shadows.hairline,
    },
    item: {
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.xs,
      justifyContent: 'center',
      minHeight: 48,
    },
    iconWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 24,
      minWidth: 24,
    },
    fallbackIcon: {
      borderRadius: theme.radius.full,
      height: 6,
      width: 6,
    },
    label: {
      ...theme.typography.labelXs,
      textAlign: 'center',
    },
    badge: {
      alignItems: 'center',
      backgroundColor: theme.colors.danger,
      borderRadius: theme.radius.full,
      minWidth: 16,
      paddingHorizontal: 4,
      position: 'absolute',
      right: -10,
      top: -6,
    },
    badgeText: {
      color: theme.colors.textInverse,
      fontSize: 10,
      fontWeight: '700',
      lineHeight: 14,
    },
  });
}

