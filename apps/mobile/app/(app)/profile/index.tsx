import { type Href, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Group, Page, Row, SectionTitle } from '@/components/calm';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { useLogout, useUser } from '@/hooks/useAuth';
import { useUpdatePreferences, useUserPreferences } from '@/hooks/useUser';
import config from '@/lib/config';
import type { UpdatePreferencesInput, UserPreferences } from '@/services/user.service';
import { useTractionTheme } from '@/theme';

const AI_PERSONALITIES: { id: UserPreferences['aiPersonality']; label: string; hint: string }[] = [
  { id: 'GENTLE', label: 'Gentle', hint: 'Encouraging' },
  { id: 'BALANCED', label: 'Balanced', hint: 'Kind and clear' },
  { id: 'DIRECT', label: 'Direct', hint: 'To the point' },
];

const DEEP_WORK: UserPreferences['deepWorkMode'][] = ['INTENSE', 'MODERATE', 'RELAXED'];
const DENSITY: UserPreferences['notificationDensity'][] = ['LOW', 'MEDIUM', 'HIGH'];
const BREAK_INTERVALS = [45, 60, 90, 120];
const DAY_LABELS: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

const titleCase = (v: string) => v.charAt(0) + v.slice(1).toLowerCase();
const nextOf = <T,>(list: readonly T[], current: T) => list[(list.indexOf(current) + 1) % list.length];
const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;

function describeDays(workDays: string): string {
  const days = workDays
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);
  if (days.join(',') === 'mon,tue,wed,thu,fri') return 'Monday to Friday';
  if (days.length === 7) return 'Every day';
  return days.map((d) => DAY_LABELS[d] ?? d).join(', ');
}

export default function ProfileScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { data: user } = useUser();
  const { data: prefs } = useUserPreferences();
  const updatePrefs = useUpdatePreferences();
  const logout = useLogout();
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const savePrefs = useCallback(
    (patch: UpdatePreferencesInput) => {
      updatePrefs.mutate(patch, {
        onError: () => Alert.alert('Not saved', 'Your change was not saved. Please try again.'),
      });
    },
    [updatePrefs],
  );

  // Five quick taps on the version opens the hidden developer screen.
  const handleVersionTap = useCallback(() => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      router.push('/profile/developer' as Href);
    }
  }, [router]);

  const handleSignOut = () => {
    Alert.alert('Sign out?', "You can sign back in any time. Your data stays safe.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  };

  const name = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Your account' : '';
  const initials =
    user
      ? [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase() ||
        user.email?.[0]?.toUpperCase() ||
        '?'
      : '';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const personality = prefs?.aiPersonality ?? 'BALANCED';

  return (
    <Page title="You" back={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.colors.accentMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ ...theme.typography.headlineMd, color: theme.colors.accentText }}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...theme.typography.titleMd, color: theme.colors.text }}>{name}</Text>
          <Text style={{ ...theme.typography.bodyMd, color: theme.colors.textMuted }}>{user?.email ?? ''}</Text>
        </View>
      </View>

      <SectionTitle title="Coaching tone" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {AI_PERSONALITIES.map((p) => {
          const selected = p.id === personality;
          return (
            <Pressable
              key={p.id}
              onPress={() => savePrefs({ aiPersonality: p.id })}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderRadius: theme.radius.md,
                borderWidth: 1.5,
                borderColor: selected ? theme.colors.accent : theme.colors.border,
                backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surface,
              }}
            >
              <Text
                style={{
                  ...theme.typography.bodyMd,
                  fontWeight: '600',
                  color: selected ? theme.colors.accentText : theme.colors.text,
                }}
              >
                {p.label}
              </Text>
              <Text style={{ ...theme.typography.labelSm, fontSize: 12, color: theme.colors.textMuted }}>{p.hint}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle title="Your rhythm" detail="Tap to change" />
      <Group>
        <Row
          first
          icon="calendar-outline"
          title="Working hours"
          detail={describeDays(prefs?.workDays ?? 'mon,tue,wed,thu,fri')}
          value={`${hh(prefs?.workStartHour ?? 9)}–${hh(prefs?.workEndHour ?? 18)}`}
        />
        <Row
          icon="sunny-outline"
          iconTint="clay"
          title="Best energy"
          value={`${hh(prefs?.energyPeakStart ?? 10)}–${hh(prefs?.energyPeakEnd ?? 13)}`}
        />
        <Row
          icon="hourglass-outline"
          title="Deep work"
          value={titleCase(prefs?.deepWorkMode ?? 'MODERATE')}
          onPress={() => prefs && savePrefs({ deepWorkMode: nextOf(DEEP_WORK, prefs.deepWorkMode) })}
        />
        <Row
          icon="cafe-outline"
          iconTint="sage"
          title="Breaks"
          value={`Every ${prefs?.focusBreakInterval ?? 90} min`}
          onPress={() =>
            prefs &&
            savePrefs({
              focusBreakInterval: nextOf(
                BREAK_INTERVALS,
                BREAK_INTERVALS.includes(prefs.focusBreakInterval) ? prefs.focusBreakInterval : 90,
              ),
            })
          }
        />
        <Row
          icon="moon-outline"
          iconTint="sand"
          title="Sleep sync"
          value={prefs?.sleepSync ? 'On' : 'Off'}
          onPress={() => prefs && savePrefs({ sleepSync: !prefs.sleepSync })}
        />
      </Group>

      <SectionTitle title="Notifications and AI" />
      <Group>
        <Row
          first
          icon="notifications-outline"
          title="Reminders"
          value={titleCase(prefs?.notificationDensity ?? 'LOW')}
          onPress={() => prefs && savePrefs({ notificationDensity: nextOf(DENSITY, prefs.notificationDensity) })}
        />
        <Row
          icon="sparkles-outline"
          title="Plan my day automatically"
          value={prefs?.aiAutoScheduling === false ? 'Off' : 'On'}
          onPress={() => prefs && savePrefs({ aiAutoScheduling: !prefs.aiAutoScheduling })}
        />
        <Row icon="pie-chart-outline" iconTint="sand" title="AI usage" onPress={() => router.push('/profile/usage' as Href)} />
      </Group>

      <Group>
        <FeedbackWidget
          renderTrigger={(open) => (
            <Row first icon="chatbubble-ellipses-outline" iconTint="sage" title="Send feedback" onPress={open} />
          )}
        />
        {isAdmin ? (
          <>
            <Row icon="ticket-outline" iconTint="sand" title="Invites" onPress={() => router.push('/profile/invites' as Href)} />
            <Row icon="shield-outline" iconTint="sand" title="Admin" onPress={() => router.push('/(admin)' as Href)} />
          </>
        ) : null}
        <Row icon="log-out-outline" iconTint="clay" title={logout.isPending ? 'Signing out…' : 'Sign out'} destructive onPress={handleSignOut} />
      </Group>

      <Pressable onPress={handleVersionTap} style={{ alignItems: 'center', paddingVertical: 8 }}>
        <Text style={{ ...theme.typography.labelSm, color: theme.colors.textSubtle }}>
          Traction {config.appEnv === 'production' ? '1.0.0' : '1.0.0 (development)'}
        </Text>
      </Pressable>
    </Page>
  );
}
