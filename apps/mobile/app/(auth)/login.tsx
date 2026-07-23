import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { useLogin } from '@/hooks/useAuth';

export default function LoginScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
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
        const message = error?.error?.message || error?.message || 'Login failed';
        Alert.alert('Login Failed', message);
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              Reduce the noise. Reclaim your focus.
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

            <Input
              control={control}
              name="password"
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              error={errors.password?.message}
            />

            <Link href="/(auth)/forgot-password" asChild>
              <Text style={[styles.forgotPassword, { color: theme.colors.primary }]}>
                Forgot Password?
              </Text>
            </Link>
          </View>

          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit(onSubmit)}
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending}
            style={styles.loginButton}
          >
            Sign In
          </Button>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              Don't have an account?{' '}
            </Text>
            <Link href="/(auth)/register" asChild>
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>Sign Up</Text>
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
  forgotPassword: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 4,
  },
  loginButton: {
    marginBottom: 32,
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
