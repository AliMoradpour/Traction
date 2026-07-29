import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useGoal, useUpdateGoal } from '@/hooks/useGoals';
import { Button } from '@/components/ui/Button';

const STATUSES = ['ACTIVE', 'COMPLETED', 'PAUSED', 'ARCHIVED'] as const;
const HEALTHS = ['ON_TRACK', 'SLIGHTLY_BEHIND', 'BEHIND_SCHEDULE', 'RECOVERY_NEEDED', 'AT_RISK'] as const;

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function GoalEditScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const { data: goal, isLoading } = useGoal(goalId || '');
  const updateGoal = useUpdateGoal();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [progress, setProgress] = useState('');
  const [status, setStatus] = useState<string>('ACTIVE');
  const [health, setHealth] = useState<string>('ON_TRACK');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (goal && !initialized) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setCategory(goal.category || '');
      setTargetDate(goal.targetDate ? goal.targetDate.split('T')[0] : '');
      setProgress(String(goal.progress));
      setStatus(goal.status);
      setHealth(goal.health);
      setInitialized(true);
    }
  }, [goal, initialized]);

  const handleSave = () => {
    if (!goalId) return;
    if (!title.trim()) {
      Alert.alert('Validation', 'Goal title is required');
      return;
    }

    const progressNum = parseInt(progress, 10);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      Alert.alert('Validation', 'Progress must be a number between 0 and 100');
      return;
    }

    updateGoal.mutate(
      {
        id: goalId,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          category: category.trim() || undefined,
          targetDate: targetDate || undefined,
          progress: progressNum,
          status: status as any,
          health: health as any,
        },
      },
      {
        onSuccess: () => router.back(),
        onError: (error: any) => {
          Alert.alert('Error', error?.message || 'Failed to save goal');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Cancel</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Edit Goal</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>TITLE</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Goal title"
            placeholderTextColor={theme.colors.textSubtle}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>DESCRIPTION</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details..."
            placeholderTextColor={theme.colors.textSubtle}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>CATEGORY</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Education, Health"
            placeholderTextColor={theme.colors.textSubtle}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>TARGET DATE (YYYY-MM-DD)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={targetDate}
            onChangeText={setTargetDate}
            placeholder="2025-12-31"
            placeholderTextColor={theme.colors.textSubtle}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>PROGRESS (0-100)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceElevated,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={progress}
            onChangeText={setProgress}
            placeholder="0"
            placeholderTextColor={theme.colors.textSubtle}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>STATUS</Text>
          <View style={styles.chipGroup}>
            {STATUSES.map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.chip,
                  {
                    backgroundColor: status === s ? theme.colors.primary : theme.colors.surfaceElevated,
                    borderColor: status === s ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.chipText, { color: status === s ? '#FFFFFF' : theme.colors.text }]}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>HEALTH</Text>
          <View style={styles.chipGroup}>
            {HEALTHS.map((h) => (
              <Pressable
                key={h}
                style={[
                  styles.chip,
                  {
                    backgroundColor: health === h ? theme.colors.primary : theme.colors.surfaceElevated,
                    borderColor: health === h ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setHealth(h)}
              >
                <Text style={[styles.chipText, { color: health === h ? '#FFFFFF' : theme.colors.text }]}>
                  {h.replace(/_/g, ' ')}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="primary" onPress={handleSave} loading={updateGoal.isPending} disabled={updateGoal.isPending}>
          {updateGoal.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
