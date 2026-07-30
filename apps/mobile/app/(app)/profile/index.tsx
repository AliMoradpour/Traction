import { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useLogout, useUser } from '@/hooks/useAuth';
import config from '@/lib/config';

const AI_PERSONALITIES = [
  { id: 'direct', label: 'Direct', icon: '⚡' },
  { id: 'balanced', label: 'Balanced', icon: '⚖️' },
  { id: 'gentle', label: 'Gentle', icon: '🧘' },
];

const PREFERENCES = [
  { id: 'deep-work', label: 'Deep Work Mode', value: 'Intense', icon: '🧠' },
  { id: 'notifications', label: 'Notification Density', value: 'Low', icon: '🔔' },
  { id: 'auto-schedule', label: 'AI Auto-Scheduling', value: 'Enabled', icon: '✨' },
];

const ENERGY_SETTINGS = [
  { id: 'sleep', label: 'Sleep Sync', value: null, icon: '🌙' },
  { id: 'breaks', label: 'Focus Breaks', value: 'Every 90m', icon: '☕' },
];

const AI_SETTINGS = [
  { id: 'usage', label: 'AI Usage', value: null, icon: '📊', route: '/profile/usage' },
];

export default function ProfileScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const [selectedPersonality, setSelectedPersonality] = useState('balanced');
  const logout = useLogout();
  const { data: user } = useUser();
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleVersionTap = useCallback(() => {
    tapCountRef.current += 1;

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);

    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
      router.push('/profile/developer');
    }
  }, [router]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  };

  const userName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email : 'User';
  const userInitials = user ? [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase() || user.email?.[0]?.toUpperCase() || 'U' : 'U';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceMuted }]}>
              <Text style={[styles.avatarText, { color: theme.colors.text }]}>{userInitials}</Text>
            </View>
            <View style={[styles.editBadge, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text style={styles.editIcon}>✏️</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.colors.text }]}>{userName}</Text>
            <Text style={[styles.profileRole, { color: theme.colors.textMuted }]}>{user?.email || ''}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>AI PERSONALITY</Text>
          <View style={[styles.personalitySelector, { backgroundColor: theme.colors.surfaceMuted }]}>
            {AI_PERSONALITIES.map((personality) => (
              <Pressable
                key={personality.id}
                style={[
                  styles.personalityButton,
                  selectedPersonality === personality.id && {
                    backgroundColor: theme.colors.surfaceElevated,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                  },
                ]}
                onPress={() => setSelectedPersonality(personality.id)}
              >
                <Text style={styles.personalityIcon}>{personality.icon}</Text>
                <Text
                  style={[
                    styles.personalityLabel,
                    {
                      color: selectedPersonality === personality.id ? theme.colors.text : theme.colors.textMuted,
                      fontWeight: selectedPersonality === personality.id ? '600' : '500',
                    },
                  ]}
                >
                  {personality.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>PRODUCTIVITY PREFERENCES</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            {PREFERENCES.map((pref, index) => (
              <View key={pref.id}>
                <Pressable style={styles.settingsItem}>
                  <View style={styles.settingsLeft}>
                    <Text style={styles.settingsIcon}>{pref.icon}</Text>
                    <Text style={[styles.settingsLabel, { color: theme.colors.text }]}>{pref.label}</Text>
                  </View>
                  <View style={styles.settingsRight}>
                    <Text style={[styles.settingsValue, { color: theme.colors.textMuted }]}>{pref.value}</Text>
                    <Text style={[styles.chevron, { color: theme.colors.textSubtle }]}>›</Text>
                  </View>
                </Pressable>
                {index < PREFERENCES.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>WORKING HOURS & ENERGY</Text>
          <View style={styles.energyGrid}>
            <View style={[styles.energyCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <View style={styles.energyHeader}>
                <Text style={styles.energyIcon}>📅</Text>
                <Text style={[styles.energyTitle, { color: theme.colors.primary }]}>Working Hours</Text>
              </View>
              <View style={styles.energyContent}>
                <View style={styles.energyRow}>
                  <Text style={[styles.energyLabel, { color: theme.colors.textMuted }]}>Monday - Friday</Text>
                  <Text style={[styles.energyValue, { color: theme.colors.primary }]}>09:00 — 18:00</Text>
                </View>
                <View style={[styles.energyTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
                  <View style={[styles.energyFill, { backgroundColor: theme.colors.primaryContainer, width: '65%' }]} />
                </View>
              </View>
            </View>

            <View style={[styles.energyCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <View style={styles.energyHeader}>
                <Text style={styles.energyIcon}>⚡</Text>
                <Text style={[styles.energyTitle, { color: theme.colors.primary }]}>Energy Peak</Text>
              </View>
              <View style={styles.energyContent}>
                <View style={styles.energyRow}>
                  <Text style={[styles.energyLabel, { color: theme.colors.textMuted }]}>Daily Window</Text>
                  <Text style={[styles.energyValue, { color: theme.colors.primary }]}>10:00 — 13:00</Text>
                </View>
                <View style={styles.miniChart}>
                  {[20, 40, 90, 100, 80, 50, 30].map((value, index) => (
                    <View
                      key={index}
                      style={[
                        styles.miniBar,
                        {
                          backgroundColor: index >= 2 && index <= 4 ? theme.colors.primaryContainer : theme.colors.surfaceMuted,
                          height: `${value}%`,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>ENERGY SETTINGS</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            {ENERGY_SETTINGS.map((setting, index) => (
              <View key={setting.id}>
                <Pressable style={styles.settingsItem}>
                  <View style={styles.settingsLeft}>
                    <Text style={styles.settingsIcon}>{setting.icon}</Text>
                    <Text style={[styles.settingsLabel, { color: theme.colors.text }]}>{setting.label}</Text>
                  </View>
                  <View style={styles.settingsRight}>
                    {setting.value && (
                      <Text style={[styles.settingsValue, { color: theme.colors.textMuted }]}>{setting.value}</Text>
                    )}
                    <Text style={[styles.chevron, { color: theme.colors.textSubtle }]}>›</Text>
                  </View>
                </Pressable>
                {index < ENERGY_SETTINGS.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>AI SETTINGS</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            {AI_SETTINGS.map((setting, index) => (
              <View key={setting.id}>
                <Pressable
                  style={styles.settingsItem}
                  onPress={() => router.push(setting.route as any)}
                >
                  <View style={styles.settingsLeft}>
                    <Text style={styles.settingsIcon}>{setting.icon}</Text>
                    <Text style={[styles.settingsLabel, { color: theme.colors.text }]}>{setting.label}</Text>
                  </View>
                  <View style={styles.settingsRight}>
                    {setting.value && (
                      <Text style={[styles.settingsValue, { color: theme.colors.textMuted }]}>{setting.value}</Text>
                    )}
                    <Text style={[styles.chevron, { color: theme.colors.textSubtle }]}>›</Text>
                  </View>
                </Pressable>
                {index < AI_SETTINGS.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        <Pressable
          style={[styles.signOutButton, { backgroundColor: theme.colors.errorMuted, borderColor: theme.colors.error }]}
          onPress={handleSignOut}
          disabled={logout.isPending}
        >
          <Text style={[styles.signOutText, { color: theme.colors.error }]}>
            {logout.isPending ? 'Signing Out...' : 'Sign Out'}
          </Text>
        </Pressable>

        <Pressable style={styles.versionContainer} onPress={handleVersionTap}>
          <Text style={[styles.versionText, { color: theme.colors.textSubtle }]}>
            Traction v{config.appEnv === 'production' ? '1.0.0' : '1.0.0-dev'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editIcon: {
    fontSize: 14,
  },
  profileInfo: {
    alignItems: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
  },
  profileRole: {
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  personalitySelector: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
  },
  personalityButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  personalityIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  personalityLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  settingsCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIcon: {
    fontSize: 20,
  },
  settingsLabel: {
    fontSize: 17,
    fontWeight: '500',
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsValue: {
    fontSize: 15,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },
  energyGrid: {
    gap: 12,
  },
  energyCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  energyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  energyIcon: {
    fontSize: 18,
  },
  energyTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  energyContent: {
    gap: 8,
  },
  energyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  energyLabel: {
    fontSize: 15,
  },
  energyValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  energyTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    borderRadius: 2,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 24,
  },
  miniBar: {
    flex: 1,
    borderRadius: 2,
  },
  signOutButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    fontSize: 17,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 13,
  },
});
