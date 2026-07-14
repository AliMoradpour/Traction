import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTractionTheme } from '@/theme';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerSchema, type RegisterFormData } from '@/lib/validations';

export default function RegisterScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call actual auth service
      // For now, simulate successful registration
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAuth({ id: '1', email: data.email, name: data.name }, 'mock-token', 'mock-refresh-token');
      router.replace('/(onboarding)/introduction');
    } catch (error) {
      console.error('Registration failed:', error);
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
            <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Start your journey to consistent progress
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              control={control}
              name="name"
              label="Name"
              placeholder="Enter your name"
              autoCapitalize="words"
              error={errors.name?.message}
            />

            <Input
              control={control}
              name="email"
              label="Email"
              placeholder="alex@traction.ai"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />

            <Input
              control={control}
              name="password"
              label="Password"
              placeholder="Create a password"
              secureTextEntry
              error={errors.password?.message}
            />

            <Input
              control={control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
              secureTextEntry
              error={errors.confirmPassword?.message}
            />
          </View>

          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.registerButton}
          >
            Create Account
          </Button>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textSubtle }]}>
              or continue with
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          <View style={styles.socialButtons}>
            <Button variant="secondary" size="lg" style={styles.socialButton}>
              Apple
            </Button>
            <Button variant="secondary" size="lg" style={styles.socialButton}>
              Google
            </Button>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>Sign In</Text>
            </Link>
          </View>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.01,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  registerButton: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 15,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '600',
  },
});
