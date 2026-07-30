import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useTractionTheme } from '@/theme';
import { useOnboardingStore } from '@/store/onboarding.store';
import { issueReporter } from '@/lib/issueReporter';
import { apiClient } from '@/api/client';
import config from '@/lib/config';

export default function DeveloperScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const [debugOverlay, setDebugOverlay] = useState(false);

  const handleResetLocalData = () => {
    Alert.alert(
      'Reset Local Data',
      'This will clear all locally stored data including authentication tokens. You will need to sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await SecureStore.deleteItemAsync('auth_token');
              await SecureStore.deleteItemAsync('refresh_token');
              Alert.alert('Success', 'Local data has been cleared.');
            } catch {
              Alert.alert('Error', 'Failed to clear local data.');
            }
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will reset the onboarding flow so you can go through it again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            Alert.alert('Success', 'Onboarding has been reset.');
          },
        },
      ]
    );
  };

  const handleResetAiCache = async () => {
    Alert.alert(
      'Reset AI Cache',
      'This will clear all cached AI data on the server.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.post('/ai/cache/cleanup');
              Alert.alert('Success', 'AI cache has been cleared.');
            } catch {
              Alert.alert('Error', 'Failed to clear AI cache.');
            }
          },
        },
      ]
    );
  };

  const handleResetBehaviorMetrics = () => {
    Alert.alert(
      'Reset Behavior Metrics',
      'This feature will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleSeedDemoAccount = async () => {
    Alert.alert(
      'Seed Demo Account',
      'This will create a demo account with test data. Existing data may be overwritten.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.post('/dev/seed');
              Alert.alert('Success', 'Demo account has been seeded.');
            } catch {
              Alert.alert('Error', 'Failed to seed demo account.');
            }
          },
        },
      ]
    );
  };

  const handleExportLogs = async () => {
    try {
      const report = await issueReporter.exportReport('Manual log export from developer settings');
      await Share.share({
        message: report,
        title: 'Traction Debug Logs',
      });
    } catch {
      Alert.alert('Error', 'Failed to export logs.');
    }
  };

  const handleToggleDebugOverlay = () => {
    const newValue = !debugOverlay;
    setDebugOverlay(newValue);
    AsyncStorage.setItem('debug_overlay', JSON.stringify(newValue));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>DATA MANAGEMENT</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Pressable
              style={styles.actionItem}
              onPress={handleResetLocalData}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>🗑️</Text>
                <View>
                  <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Reset Local Data</Text>
                  <Text style={[styles.actionDescription, { color: theme.colors.textMuted }]}>Clear AsyncStorage and SecureStore</Text>
                </View>
              </View>
              <Text style={[styles.chevron, { color: theme.colors.textSubtle }]}>›</Text>
            </Pressable>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <Pressable
              style={styles.actionItem}
              onPress={handleResetOnboarding}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>🔄</Text>
                <View>
                  <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Reset Onboarding</Text>
                  <Text style={[styles.actionDescription, { color: theme.colors.textMuted }]}>Reset onboarding to incomplete state</Text>
                </View>
              </View>
              <Text style={[styles.chevron, { color: theme.colors.textSubtle }]}>›</Text>
            </Pressable>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <Pressable
              style={styles.actionItem}
              onPress={handleResetAiCache}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>🧠</Text>
                <View>
                  <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Reset AI Cache</Text>
                  <Text style={[styles.actionDescription, { color: theme.colors.textMuted }]}>Clear cached AI data on server</Text>
                </View>
              </View>
              <Text style={[styles.chevron, { color: theme.colors.textSubtle }]}>›</Text>
            </Pressable>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <Pressable
              style={styles.actionItem}
              onPress={handleResetBehaviorMetrics}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>📊</Text>
                <View>
                  <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Reset Behavior Metrics</Text>
                  <Text style={[styles.actionDescription, { color: theme.colors.textMuted }]}>Placeholder — coming soon</Text>
                </View>
              </View>
              <Text style={[styles.chevron, { color: theme.colors.textSubtle }]}>›</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>DEVELOPMENT</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Pressable
              style={styles.actionItem}
              onPress={handleSeedDemoAccount}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>🌱</Text>
                <View>
                  <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Seed Demo Account</Text>
                  <Text style={[styles.actionDescription, { color: theme.colors.textMuted }]}>Create demo account with test data</Text>
                </View>
              </View>
              <Text style={[styles.chevron, { color: theme.colors.textSubtle }]}>›</Text>
            </Pressable>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <Pressable
              style={styles.actionItem}
              onPress={handleExportLogs}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>📤</Text>
                <View>
                  <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Export Logs</Text>
                  <Text style={[styles.actionDescription, { color: theme.colors.textMuted }]}>Share debug logs and system info</Text>
                </View>
              </View>
              <Text style={[styles.chevron, { color: theme.colors.textSubtle }]}>›</Text>
            </Pressable>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <Pressable style={styles.actionItem}>
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>🌐</Text>
                <View>
                  <Text style={[styles.actionLabel, { color: theme.colors.text }]}>API Environment</Text>
                  <Text style={[styles.actionDescription, { color: theme.colors.textMuted }]}>{config.apiUrl}</Text>
                </View>
              </View>
            </Pressable>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <Pressable
              style={styles.actionItem}
              onPress={handleToggleDebugOverlay}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>🔧</Text>
                <View>
                  <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Debug Overlay</Text>
                  <Text style={[styles.actionDescription, { color: theme.colors.textMuted }]}>
                    {debugOverlay ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <View style={[styles.toggle, { backgroundColor: debugOverlay ? theme.colors.accent : theme.colors.surfaceMuted }]}>
                <View style={[styles.toggleThumb, { transform: [{ translateX: debugOverlay ? 20 : 0 }] }]} />
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSubtle }]}>
            Traction v{config.appEnv === 'production' ? '1.0.0' : '1.0.0-dev'}
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textSubtle }]}>
            {Platform.OS} {Platform.Version}
          </Text>
        </View>
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
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  actionLabel: {
    fontSize: 17,
    fontWeight: '500',
  },
  actionDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    marginLeft: 56,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
  },
});
