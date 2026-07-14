import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations';

export default function ForgotPasswordScreen() {
  const theme = useTractionTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call actual auth service
      // For now, simulate sending reset email
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSuccess(true);
    } catch (error) {
      console.error('Forgot password failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <View style={[styles.successIcon, { backgroundColor: theme.colors.successSurface }]}>
            <Text style={{ fontSize: 32 }}>✉️</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Check Your Email</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            We've sent a password reset link to your email address.
          </Text>
          <Link href="/(auth)/login" asChild>
            <Button variant="primary" size="lg" style={styles.backButton}>
              Back to Sign In
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Enter your email and we'll send you a link to reset your password
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              control={control}
              name="email"
              label="Email"
              placeholder="alex@traction.ai"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />
          </View>

          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.sendButton}
          >
            Send Reset Link
          </Button>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              Remember your password?{' '}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    lineHeight: 20,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  sendButton: {
    marginBottom: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginTop: 24,
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
