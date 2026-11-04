import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUpdatePreferences, useUpdateProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/auth.store';
import { type TractionTheme, useTractionTheme } from '@/theme';

const GOALS = ['Productivity', 'Focus', 'Health', 'Learning', 'Career', 'Personal', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TIME_OPTIONS = ['30 min', '1 hour', '2 hours', '3+ hours'];

export default function OnboardingScreen() {
  const theme = useTractionTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdatePreferences();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [dailyTime, setDailyTime] = useState('');

  // Sign-up only asks for email and password; the name is the first onboarding step.
  const lastStep = 3;
  const canProceed =
    step === 0 ? firstName.trim().length > 0 : step === 1 ? !!goal : step === 2 ? !!level : !!dailyTime;
  const isSaving = updateProfile.isPending || updatePreferences.isPending;

  const handleComplete = async () => {
    try {
      await updateProfile.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await updatePreferences.mutateAsync({
        primaryGoal: goal,
        experienceLevel: level,
        dailyTimeBudget: dailyTime,
        onboardingComplete: true,
      });
    } catch {
      // Don't trap a new user on this screen; the answers can be changed later from Profile.
      Alert.alert("Couldn't save your answers", 'You can update them later from your profile.');
    }
    router.replace('/(auth)/welcome-intro' as Href);
  };

  const renderOptions = (options: string[], selected: string, onSelect: (value: string) => void) => (
    <View style={styles.options}>
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[styles.option, isSelected && styles.optionSelected]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
            {isSelected ? <Ionicons name="checkmark-circle" size={22} color={theme.colors.accent} /> : null}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          {step > 0 ? (
            <Pressable
              onPress={() => setStep(step - 1)}
              style={styles.back}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={22} color={theme.colors.text} />
            </Pressable>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((step + 1) / (lastStep + 1)) * 100}%` }]} />
          </View>
          <Text style={styles.stepCount}>
            {step + 1}/{lastStep + 1}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <>
              <Text style={styles.title}>What should we call you?</Text>
              <Text style={styles.subtitle}>Just so Traction can greet you properly.</Text>
              <View style={styles.fields}>
                <Input
                  label="First name"
                  placeholder="Your first name"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoComplete="given-name"
                  textContentType="givenName"
                  returnKeyType="next"
                  autoFocus
                />
                <Input
                  label="Last name (optional)"
                  placeholder="Your last name"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoComplete="family-name"
                  textContentType="familyName"
                  returnKeyType="done"
                />
              </View>
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.title}>What do you mainly want to use Traction for?</Text>
              <Text style={styles.subtitle}>Pick the one that matters most right now.</Text>
              {renderOptions(GOALS, goal, setGoal)}
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.title}>How experienced are you with planning your work?</Text>
              <Text style={styles.subtitle}>There&apos;s no wrong answer. We&apos;ll adjust how much guidance you get.</Text>
              {renderOptions(LEVELS, level, setLevel)}
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.title}>How much focused time do you have on a typical day?</Text>
              <Text style={styles.subtitle}>
                Across all your work, not one task. We use it to keep each day&apos;s plan realistic.
              </Text>
              {renderOptions(TIME_OPTIONS, dailyTime, setDailyTime)}
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            variant="primary"
            size="lg"
            disabled={!canProceed || isSaving}
            loading={isSaving}
            onPress={() => (step < lastStep ? setStep(step + 1) : handleComplete())}
          >
            {step < lastStep ? 'Continue' : 'Finish'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: TractionTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    flex: { flex: 1 },
    topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 8 },
    back: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backPlaceholder: { width: 40, height: 40 },
    progressTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: theme.colors.surfaceMuted, overflow: 'hidden' },
    progressFill: { height: 6, borderRadius: 3, backgroundColor: theme.colors.accent },
    stepCount: { ...theme.typography.labelSm, color: theme.colors.textSubtle, width: 32, textAlign: 'right' },
    content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
    title: { ...theme.typography.displayLgMobile, color: theme.colors.text },
    subtitle: { ...theme.typography.bodyLg, color: theme.colors.textMuted, marginTop: 8, marginBottom: 28 },
    fields: { gap: 16 },
    options: { gap: 10 },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 58,
      paddingHorizontal: 18,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    optionSelected: { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentMuted },
    optionText: { ...theme.typography.bodyLg, fontWeight: '600', color: theme.colors.text },
    optionTextSelected: { color: theme.colors.accentText },
    footer: { paddingHorizontal: 24, paddingBottom: 12, paddingTop: 8 },
  });
}
