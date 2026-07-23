import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useCreateTask } from '@/hooks/useTasks';

const CATEGORIES = ['Design', 'Dev', 'Ops', 'Admin', 'Personal', 'Learning'];
const PRIORITIES: { label: string; value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }[] = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

function parseDuration(input: string): number | undefined {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return undefined;
  const match = trimmed.match(/^(\d+)(m|h)?$/);
  if (!match) return undefined;
  const num = parseInt(match[1], 10);
  if (match[2] === 'h') return num * 60;
  return num;
}

export default function AddTaskScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [duration, setDuration] = useState('');
  const createTask = useCreateTask();

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Task name is required');
      return;
    }

    createTask.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        priority,
        duration: parseDuration(duration),
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setCategory('');
          setPriority('MEDIUM');
          setDuration('');
          router.back();
        },
        onError: (error: any) => {
          Alert.alert('Error', error?.message || 'Failed to create task');
        },
      }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.colors.primary }]}>Cancel</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Add Task</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>TASK NAME *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="What do you need to do?"
            placeholderTextColor={theme.colors.textSubtle}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
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
          <View style={styles.chipGroup}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.chip,
                  {
                    backgroundColor: category === cat ? theme.colors.primary : theme.colors.surfaceElevated,
                    borderColor: category === cat ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: category === cat ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>PRIORITY</Text>
          <View style={styles.chipGroup}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: priority === p.value ? theme.colors.primary : theme.colors.surfaceElevated,
                    borderColor: priority === p.value ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: priority === p.value ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>ESTIMATED DURATION</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
            value={duration}
            onChangeText={setDuration}
            placeholder="e.g. 30m, 1h, 2h"
            placeholderTextColor={theme.colors.textSubtle}
            keyboardType="default"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="primary"
          onPress={handleSubmit}
          disabled={!title.trim() || createTask.isPending}
          loading={createTask.isPending}
        >
          {createTask.isPending ? 'Creating...' : 'Add Task'}
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
