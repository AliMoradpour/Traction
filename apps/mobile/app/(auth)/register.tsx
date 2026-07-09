import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterScreen() {
  const theme = useTractionTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Start your journey to consistent progress
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Name"
            placeholder="Enter your name"
            autoCapitalize="words"
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Create a password"
            secureTextEntry
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
          />
        </View>

        <View style={styles.actions}>
          <Button variant="primary" size="lg" style={styles.registerButton}>
            Create Account
          </Button>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.textSubtle }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>

          <Button variant="secondary" size="lg" style={styles.socialButton}>
            Sign up with Apple
          </Button>

          <Button variant="secondary" size="lg" style={styles.socialButton}>
            Sign up with Google
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Text style={[styles.footerLink, { color: theme.colors.accent }]}>Sign In</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 48,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  actions: {
    gap: 12,
  },
  registerButton: {
    marginBottom: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
  },
  socialButton: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '600',
  },
});
