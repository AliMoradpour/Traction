import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text } from 'react-native';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/hooks/useAuth';
import { type LoginFormData, loginSchema } from '@/lib/validations';
import { useTractionTheme } from '@/theme';

export default function LoginScreen() {
  const theme = useTractionTheme();
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onError: (error: any) => {
        const message = error?.error?.message || error?.message || 'Check your email and password and try again.';
        Alert.alert("Couldn't sign in", message);
      },
    });
  };

  const link = StyleSheet.flatten([styles.link, { color: theme.colors.primary }]);

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Good to see you again."
      footer={
        <>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>New to Traction? </Text>
          <Link href="/(auth)/register" asChild>
            <Text style={link}>Create an account</Text>
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
        placeholder="Your password"
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        error={errors.password?.message}
      />

      <Link href="/(auth)/forgot-password" asChild>
        <Text style={StyleSheet.flatten([link, styles.forgot])}>Forgot password?</Text>
      </Link>

      <Button
        variant="primary"
        size="lg"
        onPress={() => void handleSubmit(onSubmit)()}
        loading={loginMutation.isPending}
        disabled={loginMutation.isPending}
        style={styles.submit}
      >
        Sign in
      </Button>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  link: { fontSize: 15, fontWeight: '600' },
  forgot: { textAlign: 'right', fontSize: 14 },
  submit: { marginTop: 8 },
  footerText: { fontSize: 15 },
});
