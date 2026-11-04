import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useResetPassword } from '@/hooks/useAuth';
import { type ResetPasswordFormData, resetPasswordSchema } from '@/lib/validations';
import { useTractionTheme } from '@/theme';

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
      Alert.alert('This link has expired', 'Ask for a new reset link and try again.');
      return;
    }
    resetPassword.mutate(
      { token, newPassword: data.password },
      {
        onSuccess: () => setIsSuccess(true),
        onError: (error) => {
          Alert.alert("Couldn't set your password", getErrorMessage(error) || 'Please try again in a moment.');
        },
      }
    );
  };

  if (isSuccess) {
    return (
      <AuthLayout title="You're all set" subtitle="Your new password is ready. Sign in to pick up where you left off.">
        <Button variant="primary" size="lg" onPress={() => router.replace('/(auth)/login')}>
          Sign in
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose something you'll remember."
      footer={
        <>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>Remembered it? </Text>
          <Link href="/(auth)/login" asChild>
            <Text style={StyleSheet.flatten([styles.link, { color: theme.colors.primary }])}>Sign in</Text>
          </Link>
        </>
      }
    >
      <Input
        control={control}
        name="password"
        label="New password"
        placeholder="At least 8 characters"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        error={errors.password?.message}
      />

      <Input
        control={control}
        name="confirmPassword"
        label="Confirm new password"
        placeholder="Type it once more"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        error={errors.confirmPassword?.message}
      />

      <Button
        variant="primary"
        size="lg"
        onPress={() => void handleSubmit(onSubmit)()}
        loading={resetPassword.isPending}
        style={styles.submit}
      >
        Save new password
      </Button>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  link: { fontSize: 15, fontWeight: '600' },
  submit: { marginTop: 8 },
  footerText: { fontSize: 15 },
});
