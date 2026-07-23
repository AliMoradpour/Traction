import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { useRegister } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const registerMutation = useRegister();

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

  const onSubmit = (data: RegisterFormData) => {
    const [firstName, ...rest] = data.name.split(' ');
    const lastName = rest.join(' ') || undefined;

    registerMutation.mutate(
      {
        email: data.email,
        password: data.password,
        firstName,
        lastName,
      },
      {
        onError: (error: any) => {
          const message = error?.error?.message || error?.message || 'Registration failed';
          Alert.alert('Registration Failed', message);
        },
      }
    );
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
            loading={registerMutation.isPending}
            disabled={registerMutation.isPending}
            style={styles.registerButton}
          >
            Create Account
          </Button>

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
