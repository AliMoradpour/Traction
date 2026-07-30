import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTractionTheme } from '@/theme';
import { useAdminDashboard, useAdminUsers, useUpdateUserRole } from '@/hooks/useAdmin';

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', color: '#EF4444' },
  { value: 'ADMIN', label: 'Admin', color: '#3B82F6' },
  { value: 'BETA_TESTER', label: 'Beta Tester', color: '#22C55E' },
  { value: 'PREMIUM_USER', label: 'Premium User', color: '#A855F7' },
  { value: 'USER', label: 'User', color: '#6B7280' },
];

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const theme = useTractionTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function RoleBadge({ role }: { role: string }) {
  const roleConfig = ROLES.find((r) => r.value === role) || ROLES[4];
  return (
    <View style={[styles.roleBadge, { backgroundColor: roleConfig.color + '20' }]}>
      <Text style={[styles.roleBadgeText, { color: roleConfig.color }]}>{roleConfig.label}</Text>
    </View>
  );
}

function RolePickerModal({
  visible,
  onClose,
  onSelect,
  currentRole,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (role: string) => void;
  currentRole: string;
}) {
  const theme = useTractionTheme();
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surfaceElevated }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Role</Text>
          {ROLES.map((role) => (
            <Pressable
              key={role.value}
              style={[
                styles.modalOption,
                currentRole === role.value && { backgroundColor: theme.colors.surfaceMuted },
              ]}
              onPress={() => {
                onSelect(role.value);
                onClose();
              }}
            >
              <View style={[styles.modalOptionDot, { backgroundColor: role.color }]} />
              <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>{role.label}</Text>
              {currentRole === role.value && <Text style={[styles.modalCheck, { color: theme.colors.primary }]}>✓</Text>}
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

export default function AdminDashboardScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<{ id: string; role: string } | null>(null);

  const dashboard = useAdminDashboard();
  const users = useAdminUsers(page);
  const updateRole = useUpdateUserRole();

  const stats = dashboard.data?.data || dashboard.data || {};
  const usersList = users.data?.data?.users || users.data?.users || [];
  const totalPages = users.data?.data?.totalPages || users.data?.totalPages || 1;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([dashboard.refetch(), users.refetch()]);
    setRefreshing(false);
  }, [dashboard, users]);

  const handleRoleChange = (role: string) => {
    if (selectedUser) {
      updateRole.mutate(
        { userId: selectedUser.id, role },
        {
          onSuccess: () => {
            Alert.alert('Success', 'User role updated');
            setSelectedUser(null);
          },
          onError: () => {
            Alert.alert('Error', 'Failed to update user role');
          },
        }
      );
    }
  };

  if (dashboard.isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (dashboard.isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>Failed to load admin data</Text>
          <Pressable style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Admin Dashboard</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textMuted }]}>System Overview</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Users" value={stats.totalUsers || 0} color={theme.colors.primary} />
          <StatCard label="Tasks" value={stats.totalTasks || 0} color={theme.colors.success} />
          <StatCard label="Goals" value={stats.totalGoals || 0} color={theme.colors.accent} />
          <StatCard label="Focus Sessions" value={stats.totalFocusSessions || 0} color={theme.colors.warning} />
        </View>

        <Pressable
          style={[styles.analyticsButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/(admin)/analytics' as any)}
        >
          <Text style={styles.analyticsButtonText}>View Analytics</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Users</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>Manage user roles</Text>
        </View>

        {users.isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
        ) : (
          <View style={[styles.usersList, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            {usersList.map((user: any, index: number) => (
              <View key={user.id}>
                <Pressable
                  style={styles.userItem}
                  onPress={() => setSelectedUser({ id: user.id, role: user.role })}
                >
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.colors.text }]}>{user.name || user.email}</Text>
                    <Text style={[styles.userEmail, { color: theme.colors.textMuted }]}>{user.email}</Text>
                  </View>
                  <RoleBadge role={user.role} />
                </Pressable>
                {index < usersList.length - 1 && <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />}
              </View>
            ))}
            {usersList.length === 0 && (
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No users found</Text>
            )}
          </View>
        )}

        {totalPages > 1 && (
          <View style={styles.pagination}>
            <Pressable
              style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <Text style={[styles.pageButtonText, { color: page === 1 ? theme.colors.textSubtle : theme.colors.primary }]}>← Prev</Text>
            </Pressable>
            <Text style={[styles.pageInfo, { color: theme.colors.textMuted }]}>Page {page} of {totalPages}</Text>
            <Pressable
              style={[styles.pageButton, page === totalPages && styles.pageButtonDisabled]}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <Text style={[styles.pageButtonText, { color: page === totalPages ? theme.colors.textSubtle : theme.colors.primary }]}>Next →</Text>
            </Pressable>
          </View>
        )}

        {stats.recentActivity && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Activity</Text>
            <View style={[styles.activityCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <Text style={[styles.activityText, { color: theme.colors.textMuted }]}>{stats.recentActivity}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <RolePickerModal
        visible={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onSelect={handleRoleChange}
        currentRole={selectedUser?.role || 'USER'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  loader: {
    marginVertical: 24,
  },
  usersList: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  emptyText: {
    textAlign: 'center',
    padding: 24,
    fontSize: 15,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  pageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 14,
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  activityText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  analyticsButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  analyticsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  modalOptionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  modalOptionText: {
    fontSize: 16,
    flex: 1,
  },
  modalCheck: {
    fontSize: 18,
    fontWeight: '600',
  },
});
