import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import Button from '@/components/ui/Button';

export default function WelcomeScreen() {
  const theme = useTractionTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Traction</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Turn intent into consistent progress
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={[styles.featureIcon, { color: theme.colors.accent }]}>🎯</Text>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>Focus</Text>
            <Text style={[styles.featureDescription, { color: theme.colors.textMuted }]}>
              Identify friction and pick the highest-leverage next action
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={[styles.featureIcon, { color: theme.colors.accent }]}>📊</Text>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>Insights</Text>
            <Text style={[styles.featureDescription, { color: theme.colors.textMuted }]}>
              Turn behavior data into practical insights
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={[styles.featureIcon, { color: theme.colors.accent }]}>🚀</Text>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>Goals</Text>
            <Text style={[styles.featureDescription, { color: theme.colors.textMuted }]}>
              Maintain momentum toward long-term goals
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Link href="/(auth)/register" asChild>
            <Button variant="primary" size="lg" style={styles.getStartedButton}>
              Get Started
            </Button>
          </Link>

          <Link href="/(auth)/login" asChild>
            <Button variant="secondary" size="lg" style={styles.signInButton}>
              Sign In
            </Button>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
  },
  features: {
    gap: 24,
    marginBottom: 48,
  },
  feature: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
  getStartedButton: {
    marginBottom: 8,
  },
  signInButton: {
    marginBottom: 8,
  },
});
