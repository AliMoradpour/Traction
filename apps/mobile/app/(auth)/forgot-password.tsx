import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForgotPassword } from '@/hooks/useAuth';
import { type ForgotPasswordFormData, forgotPasswordSchema } from '@/lib/validations';
import { useTractionTheme } from '@/theme';

export default function ForgotPasswordScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const forgotPassword = useForgotPassword();
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
    forgotPassword.mutate(data, {
      onSuccess: () => setIsSuccess(true),
      onError: (error) => {
        Alert.alert("Couldn't send the link", getErrorMessage(error) || 'Please try again in a moment.');
      },
    });
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="If there's an account with that email, a reset link is on its way."
      >
        <Button variant="primary" size="lg" onPress={() => router.replace('/(auth)/login')}>
          Back to sign in
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="No problem. We'll email you a link to set a new one."
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
        name="email"
        label="Email"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="username"
        error={errors.email?.message}
      />

      <Button
        variant="primary"
        size="lg"
        onPress={() => void handleSubmit(onSubmit)()}
        loading={forgotPassword.isPending}
        style={styles.submit}
      >
        Send reset link
      </Button>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  link: { fontSize: 15, fontWeight: '600' },
  submit: { marginTop: 8 },
  footerText: { fontSize: 15 },
});
