// Calm design kit: the building blocks every inner screen shares.
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type TractionTheme, useTractionTheme } from '../../theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

function cardSurface(theme: TractionTheme): ViewStyle {
  return {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    ...(theme.mode === 'light' ? theme.shadows.card : { borderWidth: 1, borderColor: theme.colors.border }),
  };
}

interface PageProps {
  title: string;
  subtitle?: string;
  /** Show a back button (default true for inner screens). */
  back?: boolean;
  /** Element shown at the right of the header, e.g. an IconButton. */
  action?: ReactNode;
  children: ReactNode;
  /** Pinned at the bottom, outside the scroll area (e.g. a primary button). */
  footer?: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function Page({
  title,
  subtitle,
  back = true,
  action,
  children,
  footer,
  scroll = true,
  refreshing,
  onRefresh,
}: PageProps) {
  const theme = useTractionTheme();
  const router = useRouter();
  const styles = pageStyles(theme);

  const header = (
    <View>
      {back || action ? (
        <View style={styles.topRow}>
          {back ? (
            <IconButton
              icon="chevron-back"
              label="Go back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(app)/today'))}
            />
          ) : (
            <View />
          )}
          {action ?? null}
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />
            ) : undefined
          }
        >
          {header}
          <View style={styles.body}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }]}>
          {header}
          <View style={[styles.body, { flex: 1 }]}>{children}</View>
        </View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

function pageStyles(theme: TractionTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    title: { ...theme.typography.displayLgMobile, color: theme.colors.text },
    subtitle: { ...theme.typography.bodyMd, color: theme.colors.textMuted, marginTop: 4 },
    body: { marginTop: 20, gap: 16 },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 12,
      backgroundColor: theme.colors.background,
    },
  });
}

export function IconButton({
  icon,
  label,
  onPress,
  tone = 'soft',
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  tone?: 'soft' | 'primary';
}) {
  const theme = useTractionTheme();
  const primary = tone === 'primary';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: primary ? theme.colors.primary : theme.colors.surfaceSoft,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Ionicons name={icon} size={22} color={primary ? theme.colors.textInverse : theme.colors.text} />
    </Pressable>
  );
}

export function Card({
  children,
  style,
  onPress,
  tint,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  /** Use a soft tinted background instead of the white card. */
  tint?: 'blue' | 'sage' | 'clay' | 'sand';
}) {
  const theme = useTractionTheme();
  const tints = {
    blue: theme.colors.accentMuted,
    sage: theme.colors.successSurface,
    clay: theme.colors.warningSurface,
    sand: theme.colors.surfaceSoft,
  };
  const base: ViewStyle = tint
    ? { backgroundColor: tints[tint], borderRadius: theme.radius.lg }
    : cardSurface(theme);
  const inner = [base, { padding: 16 }, style];
  if (!onPress) return <View style={inner}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [...inner, pressed && { opacity: 0.85 }]}
    >
      {children}
    </Pressable>
  );
}

export function SectionTitle({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  const theme = useTractionTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 4 }}>
      <Text style={{ ...theme.typography.titleMd, color: theme.colors.text }}>{title}</Text>
      {action ?? (detail ? <Text style={{ ...theme.typography.labelSm, color: theme.colors.textSubtle }}>{detail}</Text> : null)}
    </View>
  );
}

/** A grouped list like iOS Settings. Pass Row elements as children. */
export function Group({ children }: { children: ReactNode }) {
  const theme = useTractionTheme();
  return <View style={[cardSurface(theme), { overflow: 'hidden' }]}>{children}</View>;
}

export function Row({
  title,
  detail,
  value,
  icon,
  iconTint = 'blue',
  onPress,
  right,
  first,
  destructive,
}: {
  title: string;
  detail?: string;
  value?: string;
  icon?: IconName;
  iconTint?: 'blue' | 'sage' | 'clay' | 'sand';
  onPress?: () => void;
  right?: ReactNode;
  /** The first row in a Group has no divider above it. */
  first?: boolean;
  destructive?: boolean;
}) {
  const theme = useTractionTheme();
  const tints = {
    blue: [theme.colors.accentMuted, theme.colors.accent],
    sage: [theme.colors.successSurface, theme.colors.success],
    clay: [theme.colors.warningSurface, theme.colors.warning],
    sand: [theme.colors.surfaceSoft, theme.colors.textMuted],
  } as const;
  const content = (
    <>
      {icon ? (
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 11,
            backgroundColor: tints[iconTint][0],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={19} color={tints[iconTint][1]} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            ...theme.typography.bodyLg,
            fontSize: 16,
            fontWeight: '500',
            color: destructive ? theme.colors.dangerText : theme.colors.text,
          }}
        >
          {title}
        </Text>
        {detail ? (
          <Text style={{ ...theme.typography.labelSm, color: theme.colors.textMuted, marginTop: 1 }}>{detail}</Text>
        ) : null}
      </View>
      {value ? <Text style={{ ...theme.typography.bodyMd, color: theme.colors.textMuted }}>{value}</Text> : null}
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={theme.colors.textSubtle} /> : null)}
    </>
  );
  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderTopWidth: first ? 0 : StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  };
  if (!onPress) return <View style={rowStyle}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [rowStyle, pressed && { backgroundColor: theme.colors.surfaceSoft }]}
    >
      {content}
    </Pressable>
  );
}

export function Pill({ label, tone = 'blue' }: { label: string; tone?: 'blue' | 'sage' | 'clay' | 'sand' | 'red' }) {
  const theme = useTractionTheme();
  const tones = {
    blue: [theme.colors.accentMuted, theme.colors.accentText],
    sage: [theme.colors.successSurface, theme.colors.successText],
    clay: [theme.colors.warningSurface, theme.colors.warningText],
    sand: [theme.colors.surfaceSoft, theme.colors.textMuted],
    red: [theme.colors.dangerSurface, theme.colors.dangerText],
  } as const;
  return (
    <Text
      style={{
        ...theme.typography.labelSm,
        fontSize: 12,
        fontWeight: '600',
        color: tones[tone][1],
        backgroundColor: tones[tone][0],
        paddingVertical: 3,
        paddingHorizontal: 9,
        borderRadius: theme.radius.full,
        overflow: 'hidden',
        alignSelf: 'flex-start',
      }}
    >
      {label}
    </Text>
  );
}

export function StatTiles({
  items,
}: {
  items: { label: string; value: string; tint?: 'blue' | 'sage' | 'clay' | 'sand' }[];
}) {
  const theme = useTractionTheme();
  const tints = {
    blue: theme.colors.accentMuted,
    sage: theme.colors.successSurface,
    clay: theme.colors.warningSurface,
    sand: theme.colors.surfaceSoft,
  };
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {items.map((item) => (
        <View
          key={item.label}
          style={{
            flex: 1,
            borderRadius: theme.radius.lg,
            paddingVertical: 14,
            paddingHorizontal: 12,
            backgroundColor: tints[item.tint ?? 'sand'],
          }}
        >
          <Text style={{ ...theme.typography.headlineMd, color: theme.colors.text }}>{item.value}</Text>
          <Text style={{ ...theme.typography.labelSm, color: theme.colors.textMuted, marginTop: 2 }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function ProgressBar({ value, tone = 'blue' }: { value: number; tone?: 'blue' | 'sage' | 'clay' }) {
  const theme = useTractionTheme();
  const color = { blue: theme.colors.accent, sage: theme.colors.success, clay: theme.colors.warning }[tone];
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.colors.surfaceMuted, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

export function EmptyHint({
  icon,
  title,
  text,
  children,
}: {
  icon: IconName;
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  const theme = useTractionTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: theme.colors.successSurface,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        <Ionicons name={icon} size={28} color={theme.colors.success} />
      </View>
      <Text style={{ ...theme.typography.titleMd, color: theme.colors.text, textAlign: 'center' }}>{title}</Text>
      {text ? (
        <Text style={{ ...theme.typography.bodyMd, color: theme.colors.textMuted, textAlign: 'center', marginTop: 4 }}>
          {text}
        </Text>
      ) : null}
      {children ? <View style={{ marginTop: 16 }}>{children}</View> : null}
    </View>
  );
}

/** A wrapping row of pill-shaped choices; tap to select. */
export function ChoiceChips<T>({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; value: T }[];
  selected: T | null | undefined;
  onSelect: (value: T) => void;
}) {
  const theme = useTractionTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const isSelected = o.value === selected;
        return (
          <Pressable
            key={o.label}
            onPress={() => onSelect(o.value)}
            style={chipStyle(theme, isSelected)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={chipTextStyle(theme, isSelected)}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Horizontal strip of the next two weeks for picking a day. */
export function DayPicker({ value, onChange, days = 14 }: { value: Date; onChange: (day: Date) => void; days?: number }) {
  const theme = useTractionTheme();
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const list = Array.from({ length: days }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  // A day chosen from the month calendar may lie outside the strip; show it first.
  if (!list.some((d) => sameDay(d, value))) list.unshift(value);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
      {list.map((d, i) => {
        const isSelected = sameDay(d, value);
        const offset = Math.round((d.getTime() - start.getTime()) / 86400000);
        const top = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
        const bottom = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return (
          <Pressable
            key={`${d.toDateString()}-${i}`}
            onPress={() => onChange(d)}
            style={[chipStyle(theme, isSelected), { alignItems: 'center', minWidth: 64, paddingVertical: 8 }]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${top}, ${bottom}`}
          >
            <Text style={chipTextStyle(theme, isSelected)}>{top}</Text>
            <Text
              style={{
                ...theme.typography.labelSm,
                fontSize: 12,
                color: isSelected ? theme.colors.accentText : theme.colors.textMuted,
              }}
            >
              {bottom}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function chipStyle(theme: TractionTheme, selected: boolean): ViewStyle {
  return {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: selected ? theme.colors.accent : theme.colors.border,
    backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surface,
  };
}

function chipTextStyle(theme: TractionTheme, selected: boolean) {
  return {
    ...theme.typography.bodyMd,
    fontWeight: '600' as const,
    color: selected ? theme.colors.accentText : theme.colors.text,
  };
}

export function BodyText({ children, muted }: { children: ReactNode; muted?: boolean }) {
  const theme = useTractionTheme();
  return (
    <Text style={{ ...theme.typography.bodyMd, lineHeight: 21, color: muted ? theme.colors.textMuted : theme.colors.text }}>
      {children}
    </Text>
  );
}
