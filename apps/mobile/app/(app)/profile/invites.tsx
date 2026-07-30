import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  RefreshControl,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import {
  useMyInvites,
  useInviteStats,
  useCreateInvite,
  type Invite,
} from '@/hooks/useInvites';

function getStatusColor(status: string, theme: any) {
  switch (status) {
    case 'used':
      return theme.colors.success;
    case 'expired':
      return theme.colors.error;
    default:
      return theme.colors.primary;
  }
}

function getStatusLabel(invite: Invite) {
  if (invite.usedAt) return 'Used';
  if (new Date(invite.expiresAt) < new Date()) return 'Expired';
  return 'Pending';
}

function InviteCard({ invite, theme }: { invite: Invite; theme: any }) {
  const status = getStatusLabel(invite);
  const statusColor = getStatusColor(status.toLowerCase(), theme);

  const handleCopyCode = async () => {
    try {
      await Share.share({
        message: `Join Traction Beta! Use invite code: ${invite.code}`,
      });
    } catch {
      // Fallback - user cancelled
    }
  };

  return (
    <View style={[styles.inviteCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
      <View style={styles.inviteHeader}>
        <Text style={[styles.inviteEmail, { color: theme.colors.text }]}>{invite.email}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
        </View>
      </View>

      <View style={styles.inviteDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Code</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{invite.code}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Role</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{invite.role}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Expires</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {new Date(invite.expiresAt).toLocaleDateString()}
          </Text>
        </View>
        {invite.usedBy && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Accepted by</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {[invite.usedBy.firstName, invite.usedBy.lastName].filter(Boolean).join(' ') || invite.usedBy.email}
            </Text>
          </View>
        )}
      </View>

      {status === 'Pending' && (
        <Pressable
          style={[styles.copyButton, { backgroundColor: theme.colors.primaryContainer }]}
          onPress={handleCopyCode}
        >
          <Text style={[styles.copyButtonText, { color: theme.colors.primary }]}>Share Invite Code</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function InvitesScreen() {
  const theme = useTractionTheme();
  const [email, setEmail] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: invites, isLoading: invitesLoading, refetch: refetchInvites } = useMyInvites();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useInviteStats();
  const createInvite = useCreateInvite();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchInvites(), refetchStats()]);
    setRefreshing(false);
  }, [refetchInvites, refetchStats]);

  const handleSendInvite = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await createInvite.mutateAsync({ email: email.trim() });
      setEmail('');
      Alert.alert('Success', 'Invite sent successfully!');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to send invite');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Invite Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats?.total || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Sent</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>{stats?.used || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Used</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats?.pending || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Send Invite Form */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>SEND INVITE</Text>
          <View style={[styles.inputCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="Enter email address"
              placeholderTextColor={theme.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Pressable
              style={[
                styles.sendButton,
                { backgroundColor: theme.colors.primary },
                createInvite.isPending && styles.sendButtonDisabled,
              ]}
              onPress={handleSendInvite}
              disabled={createInvite.isPending}
            >
              <Text style={styles.sendButtonText}>
                {createInvite.isPending ? 'Sending...' : 'Send Invite'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Invites List */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>SENT INVITES</Text>
          {invitesLoading ? (
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>Loading invites...</Text>
          ) : !invites || invites.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No invites sent yet</Text>
          ) : (
            <View style={styles.invitesList}>
              {invites.map((invite) => (
                <InviteCard key={invite.id} invite={invite} theme={theme} />
              ))}
            </View>
          )}
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
  statsCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
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
  inputCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  input: {
    fontSize: 17,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  sendButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 32,
  },
  invitesList: {
    gap: 12,
  },
  inviteCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inviteEmail: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inviteDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  copyButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
