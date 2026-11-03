import { type Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useUpdatePreferences, useUpdateProfile } from '../../src/hooks/useProfile';
import { useAuthStore } from '../../src/store/auth.store';

const GOALS = ['Productivity', 'Focus', 'Health', 'Learning', 'Career', 'Personal', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TIME_OPTIONS = ['30 min', '1 hour', '2 hours', '3+ hours'];

export default function OnboardingScreen() {
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
    step === 0
      ? firstName.trim().length > 0
      : step === 1
        ? !!goal
        : step === 2
          ? !!level
          : !!dailyTime;
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

  const stepIndicator = (
    <View style={styles.stepIndicator}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {stepIndicator}

        {step === 0 && (
          <>
            <Text style={styles.title}>What should we call you?</Text>
            <Text style={styles.label}>First name</Text>
            <TextInput
              style={styles.input}
              placeholder="Ali"
              placeholderTextColor="#555"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              returnKeyType="next"
              autoFocus
            />
            <Text style={styles.label}>Last name (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Moradpour"
              placeholderTextColor="#555"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              returnKeyType="done"
            />
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.title}>What do you mainly want to use Traction for?</Text>
            <View style={styles.optionsGrid}>
              {GOALS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.option, goal === g && styles.optionSelected]}
                  onPress={() => setGoal(g)}
                >
                  <Text style={[styles.optionText, goal === g && styles.optionTextSelected]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.title}>How experienced are you with planning your work?</Text>
            <View style={styles.optionsGrid}>
              {LEVELS.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.option, level === l && styles.optionSelected]}
                  onPress={() => setLevel(l)}
                >
                  <Text style={[styles.optionText, level === l && styles.optionTextSelected]}>
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.title}>How much focused time do you have on a typical day?</Text>
            <Text style={styles.subtitle}>
              Across all your work, not one task. We use it to keep each day&apos;s plan realistic.
            </Text>
            <View style={styles.optionsGrid}>
              {TIME_OPTIONS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.option, dailyTime === t && styles.optionSelected]}
                  onPress={() => setDailyTime(t)}
                >
                  <Text style={[styles.optionText, dailyTime === t && styles.optionTextSelected]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={styles.buttonRow}>
          {step > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
            disabled={!canProceed || isSaving}
            onPress={() => (step < lastStep ? setStep(step + 1) : handleComplete())}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>
                {step < lastStep ? 'Continue' : "Let's Go!"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  stepIndicator: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 48 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2a2a3e' },
  dotActive: { backgroundColor: '#6c63ff' },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 32,
    textAlign: 'center',
  },
  label: { fontSize: 14, fontWeight: '600', color: '#c8c8d0', marginBottom: 8 },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginTop: -20,
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 21,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#f5f5f5',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    minWidth: '45%',
  },
  optionSelected: { backgroundColor: '#6c63ff20', borderColor: '#6c63ff' },
  optionText: { fontSize: 15, color: '#888', textAlign: 'center' },
  optionTextSelected: { color: '#6c63ff', fontWeight: '600' },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 48 },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  backButtonText: { fontSize: 16, color: '#888' },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#6c63ff',
    minWidth: 140,
    alignItems: 'center',
  },
  nextButtonDisabled: { opacity: 0.4 },
  nextButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
