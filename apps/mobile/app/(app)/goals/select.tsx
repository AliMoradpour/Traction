import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { goalSchema, type GoalFormData } from '@/lib/validations';

export default function GoalSetupScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      category: '',
      targetDate: '',
    },
  });

  const onSubmit = async (data: GoalFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call actual goal service
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/(app)/goals/feasibility');
    } catch (error) {
      console.error('Goal creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Goal Setup</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Define your goal and we'll create a personalized roadmap
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              control={control}
              name="title"
              label="Goal Title"
              placeholder="e.g., Learn Spanish to B2 level"
              error={errors.title?.message}
            />

            <Input
              control={control}
              name="category"
              label="Category"
              placeholder="e.g., Language, Fitness, Career"
              error={errors.category?.message}
            />

            <Input
              control={control}
              name="targetDate"
              label="Target Date (optional)"
              placeholder="e.g., December 2026"
              error={errors.targetDate?.message}
            />
          </View>

          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.continueButton}
          >
            Analyze Feasibility
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.01,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  continueButton: {
    marginBottom: 32,
  },
});
