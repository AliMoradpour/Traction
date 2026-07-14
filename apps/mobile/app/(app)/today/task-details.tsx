import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function TaskDetailsScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const [title, setTitle] = useState('Review feedback from Design Team');
  const [description, setDescription] = useState('Review and address all comments from the latest design review session.');
  const [priority, setPriority] = useState('High');
  const [duration, setDuration] = useState('20m');

  const handleSave = () => {
    // TODO: Update task in store
    router.back();
  };

  const handleDelete = () => {
    // TODO: Delete task from store
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Task Details</Text>
        <Pressable onPress={handleDelete}>
          <Text style={[styles.deleteButton, { color: theme.colors.error }]}>Delete</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>TASK NAME</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Task name"
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
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>PRIORITY</Text>
          <View style={styles.chipGroup}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p}
                style={[
                  styles.chip,
                  {
                    backgroundColor: priority === p ? theme.colors.primary : theme.colors.surfaceElevated,
                    borderColor: priority === p ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: priority === p ? '#FFFFFF' : theme.colors.text },
                  ]}
                >
                  {p}
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
            placeholder="e.g. 30m, 1h"
            placeholderTextColor={theme.colors.textSubtle}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>RESISTANCE METER</Text>
          <View style={[styles.resistanceCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={styles.resistanceHeader}>
              <Text style={[styles.resistanceLabel, { color: theme.colors.text }]}>Friction Score</Text>
              <Text style={[styles.resistanceValue, { color: theme.colors.warning }]}>25</Text>
            </View>
            <View style={[styles.resistanceTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
              <View style={[styles.resistanceFill, { backgroundColor: theme.colors.warning, width: '25%' }]} />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="primary" onPress={handleSave}>
          Save Changes
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
  deleteButton: {
    fontSize: 15,
    fontWeight: '500',
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
  resistanceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  resistanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resistanceLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  resistanceValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  resistanceTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  resistanceFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
