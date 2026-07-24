import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations';
import { useResetPassword } from '@/hooks/useAuth';

export default function ResetPasswordScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const resetPassword = useResetPassword();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      Alert.alert('Error', 'Invalid or missing reset token.');
      return;
    }
    resetPassword.mutate(
      { token, newPassword: data.password },
      {
        onSuccess: () => setIsSuccess(true),
        onError: (error) => {
          Alert.alert('Error', error instanceof Error ? error.message : 'Failed to reset password. Please try again.');
        },
      }
    );
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <View style={[styles.successIcon, { backgroundColor: theme.colors.successSurface }]}>
            <Text style={{ fontSize: 32 }}>✅</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Password Reset</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Your password has been successfully reset. You can now sign in with your new password.
          </Text>
          <Button
            variant="primary"
            size="lg"
            style={styles.signInButton}
            onPress={() => router.replace('/(auth)/login')}
          >
            Sign In
          </Button>
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
            <Text style={[styles.title, { color: theme.colors.text }]}>New Password</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Enter your new password below
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              control={control}
              name="password"
              label="New Password"
              placeholder="Create a new password"
              secureTextEntry
              error={errors.password?.message}
            />

            <Input
              control={control}
              name="confirmPassword"
              label="Confirm New Password"
              placeholder="Confirm your new password"
              secureTextEntry
              error={errors.confirmPassword?.message}
            />
          </View>

          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit(onSubmit)}
            loading={resetPassword.isPending}
            style={styles.resetButton}
          >
            Reset Password
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
  resetButton: {
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
  signInButton: {
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
