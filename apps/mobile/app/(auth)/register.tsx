import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text } from 'react-native';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRegister } from '@/hooks/useAuth';
import { type RegisterFormData, registerSchema } from '@/lib/validations';
import { useTractionTheme } from '@/theme';

export default function RegisterScreen() {
  const theme = useTractionTheme();
  const registerMutation = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // The name is asked during onboarding, right after sign-up.
  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onError: (error: any) => {
          const message = error?.error?.message || error?.message || 'Please try again in a moment.';
          Alert.alert("Couldn't create your account", message);
        },
      }
    );
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>Already have an account? </Text>
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

      <Input
        control={control}
        name="password"
        label="Password"
        placeholder="At least 8 characters"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        error={errors.password?.message}
      />

      <Input
        control={control}
        name="confirmPassword"
        label="Confirm password"
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
        loading={registerMutation.isPending}
        disabled={registerMutation.isPending}
        style={styles.submit}
      >
        Create account
      </Button>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  link: { fontSize: 15, fontWeight: '600' },
  submit: { marginTop: 8 },
  footerText: { fontSize: 15 },
});
