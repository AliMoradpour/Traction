import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useCreateGoal } from '@/hooks/useGoals';
import type { GoalType } from '@/services/goal.service';

const GOAL_TYPES: { key: GoalType; label: string; color: string }[] = [
  { key: 'IELTS', label: 'IELTS', color: '#8B5CF6' },
  { key: 'PROGRAMMING', label: 'Programming', color: '#3B82F6' },
  { key: 'FITNESS', label: 'Fitness', color: '#10B981' },
  { key: 'SAVINGS', label: 'Savings', color: '#F59E0B' },
  { key: 'CUSTOM', label: 'Custom', color: '#6B7280' },
];

const CATEGORIES = ['Design', 'Dev', 'Ops', 'Admin', 'Personal', 'Learning'];

const TOTAL_STEPS = 4;

export default function GoalCreateScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const createGoal = useCreateGoal();

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<GoalType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('');

  const canNextStep1 = !!selectedType && title.trim().length > 0;

  const handleCreate = async () => {
    if (!selectedType) return;
    try {
      await createGoal.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        type: selectedType,
        category: category || undefined,
        targetDate: targetDate || undefined,
      });
      router.replace('/(app)/goals');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create goal. Please try again.');
    }
  };

  const renderDots = () => (
    <View style={styles.dotsRow}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor:
                i + 1 <= step ? theme.colors.primary : theme.colors.surfaceMuted,
            },
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Choose Goal Type
      </Text>
      <View style={styles.typeGrid}>
        {GOAL_TYPES.map((gt) => (
          <Pressable
            key={gt.key}
            style={[
              styles.typeCard,
              {
                backgroundColor:
                  selectedType === gt.key ? gt.color : theme.colors.surfaceElevated,
                borderColor:
                  selectedType === gt.key ? gt.color : theme.colors.border,
              },
            ]}
            onPress={() => setSelectedType(gt.key)}
          >
            <Text
              style={[
                styles.typeLabel,
                {
                  color:
                    selectedType === gt.key ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              {gt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Goal Title
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="e.g., Learn Spanish to B2 level"
        placeholderTextColor={theme.colors.textSubtle}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Description (optional)
      </Text>
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="Add more details about your goal..."
        placeholderTextColor={theme.colors.textSubtle}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Target Date
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={theme.colors.textSubtle}
        value={targetDate}
        onChangeText={setTargetDate}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Category
      </Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            style={[
              styles.chip,
              {
                backgroundColor:
                  category === c ? theme.colors.primary : theme.colors.surfaceElevated,
                borderColor:
                  category === c ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => setCategory(category === c ? '' : c)}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    category === c ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              {c}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Current Level
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="e.g., Beginner, Band 5"
        placeholderTextColor={theme.colors.textSubtle}
        value={currentLevel}
        onChangeText={setCurrentLevel}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Target Level
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="e.g., Band 7, 70kg"
        placeholderTextColor={theme.colors.textSubtle}
        value={targetLevel}
        onChangeText={setTargetLevel}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Weekly Available Hours
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="e.g., 10"
        placeholderTextColor={theme.colors.textSubtle}
        value={weeklyHours}
        onChangeText={setWeeklyHours}
        keyboardType="numeric"
      />
    </>
  );

  const renderStep4 = () => {
    const typeObj = GOAL_TYPES.find((gt) => gt.key === selectedType);
    return (
      <>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Review Your Goal
        </Text>
        <View
          style={[
            styles.reviewCard,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.colors.textMuted }]}>
              Type
            </Text>
            <View style={[styles.reviewBadge, { backgroundColor: typeObj?.color }]}>
              <Text style={styles.reviewBadgeText}>{typeObj?.label}</Text>
            </View>
          </View>

          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.colors.textMuted }]}>
              Title
            </Text>
            <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
              {title}
            </Text>
          </View>

          {description ? (
            <View style={styles.reviewRow}>
              <Text style={[styles.reviewLabel, { color: theme.colors.textMuted }]}>
                Description
              </Text>
              <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
                {description}
              </Text>
            </View>
          ) : null}

          {targetDate ? (
            <View style={styles.reviewRow}>
              <Text style={[styles.reviewLabel, { color: theme.colors.textMuted }]}>
                Target Date
              </Text>
              <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
                {targetDate}
              </Text>
            </View>
          ) : null}

          {category ? (
            <View style={styles.reviewRow}>
              <Text style={[styles.reviewLabel, { color: theme.colors.textMuted }]}>
                Category
              </Text>
              <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
                {category}
              </Text>
            </View>
          ) : null}

          {currentLevel ? (
            <View style={styles.reviewRow}>
              <Text style={[styles.reviewLabel, { color: theme.colors.textMuted }]}>
                Current Level
              </Text>
              <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
                {currentLevel}
              </Text>
            </View>
          ) : null}

          {targetLevel ? (
            <View style={styles.reviewRow}>
              <Text style={[styles.reviewLabel, { color: theme.colors.textMuted }]}>
                Target Level
              </Text>
              <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
                {targetLevel}
              </Text>
            </View>
          ) : null}

          {weeklyHours ? (
            <View style={styles.reviewRow}>
              <Text style={[styles.reviewLabel, { color: theme.colors.textMuted }]}>
                Weekly Hours
              </Text>
              <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
                {weeklyHours}h
              </Text>
            </View>
          ) : null}
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderDots()}

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        {step > 1 && (
          <Pressable
            style={[styles.footerBtn, styles.backBtn]}
            onPress={() => setStep((s) => s - 1)}
          >
            <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Back</Text>
          </Pressable>
        )}

        <Pressable
          style={[
            styles.footerBtn,
            styles.nextBtn,
            {
              backgroundColor:
                step === 4 ? theme.colors.primary : theme.colors.primary,
              opacity:
                step === 1 && !canNextStep1 ? 0.5 : 1,
            },
          ]}
          onPress={() => {
            if (step === 1 && !canNextStep1) return;
            if (step < TOTAL_STEPS) {
              setStep((s) => s + 1);
            } else {
              handleCreate();
            }
          }}
          disabled={step === 1 && !canNextStep1}
        >
          {step === 4 && createGoal.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.nextBtnText}>
              {step === 4 ? 'Create Goal' : 'Next'}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeCard: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 90,
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 20,
  },
  textArea: {
    height: 80,
    paddingTop: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  reviewBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reviewBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    backgroundColor: 'transparent',
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  nextBtn: {},
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
