import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Page, SectionTitle } from '@/components/calm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateGoal } from '@/hooks/useGoals';
import { GOAL_TYPES } from '@/lib/goalLabels';
import type { GoalType } from '@/services/goal.service';
import { useTractionTheme } from '@/theme';

const TIMEFRAMES = [
  { label: '1 month', months: 1 },
  { label: '3 months', months: 3 },
  { label: '6 months', months: 6 },
  { label: '1 year', months: 12 },
];

function addMonths(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

export default function GoalCreateScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const createGoal = useCreateGoal();

  const [type, setType] = useState<GoalType>('CUSTOM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [months, setMonths] = useState<number | null>(3);

  const handleCreate = async () => {
    try {
      await createGoal.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        targetDate: months ? addMonths(months) : undefined,
      });
      router.replace('/(app)/goals');
    } catch (error: any) {
      Alert.alert("Couldn't create your goal", error?.message || 'Please try again in a moment.');
    }
  };

  const chip = (selected: boolean) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: selected ? theme.colors.accent : theme.colors.border,
    backgroundColor: selected ? theme.colors.accentMuted : theme.colors.surface,
  });
  const chipText = (selected: boolean) => ({
    ...theme.typography.bodyMd,
    fontWeight: '600' as const,
    color: selected ? theme.colors.accentText : theme.colors.text,
  });

  return (
    <Page
      title="New goal"
      subtitle="Something you'd like to achieve. You can break it into steps later."
      footer={
        <Button
          variant="primary"
          size="lg"
          disabled={!title.trim() || createGoal.isPending}
          loading={createGoal.isPending}
          onPress={handleCreate}
        >
          Create goal
        </Button>
      }
    >
      <Input
        label="What's your goal?"
        placeholder="Reach B2 in Spanish"
        value={title}
        onChangeText={setTitle}
        autoFocus
        returnKeyType="next"
      />
      <Input
        label="Why does it matter to you? (optional)"
        placeholder="A sentence to come back to on hard days"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ minHeight: 80, paddingTop: 14, textAlignVertical: 'top' }}
      />

      <SectionTitle title="Kind of goal" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(Object.keys(GOAL_TYPES) as GoalType[]).map((key) => {
          const selected = key === type;
          return (
            <Pressable
              key={key}
              onPress={() => setType(key)}
              style={chip(selected)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Ionicons
                name={GOAL_TYPES[key].icon}
                size={16}
                color={selected ? theme.colors.accent : theme.colors.textMuted}
              />
              <Text style={chipText(selected)}>{GOAL_TYPES[key].label}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle title="When would you like to get there?" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {TIMEFRAMES.map((t) => {
          const selected = months === t.months;
          return (
            <Pressable
              key={t.label}
              onPress={() => setMonths(selected ? null : t.months)}
              style={chip(selected)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text style={chipText(selected)}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={{ ...theme.typography.labelSm, color: theme.colors.textSubtle, paddingHorizontal: 4 }}>
        {months ? 'You can change this any time.' : 'No deadline. That is fine too.'}
      </Text>
    </Page>
  );
}
