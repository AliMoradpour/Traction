import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useResistance } from '@/hooks/useExecution';
import { Button } from '@/components/ui/Button';

function ResistanceScore({ score, theme }: { score: number; theme: any }) {
  const color =
    score <= 30 ? theme.colors.success : score <= 60 ? theme.colors.warning : theme.colors.danger;
  return (
    <View style={[styles.scoreCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
      <Text style={[styles.scoreLabel, { color: theme.colors.textMuted }]}>RESISTANCE LEVEL</Text>
      <Text style={[styles.scoreValue, { color }]}>{score}</Text>
      <Text style={[styles.scoreMax, { color: theme.colors.textMuted }]}>/ 100</Text>
    </View>
  );
}

export default function ResistanceScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: resistance, isLoading, isError, refetch } = useResistance();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backArrow, { color: theme.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Resistance</Text>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>
            Failed to load data
          </Text>
          <Button variant="secondary" onPress={() => refetch()} style={{ marginTop: 12 }}>
            Retry
          </Button>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => refetch()} tintColor={theme.colors.primary} />
          }
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <ResistanceScore score={resistance?.score ?? 0} theme={theme} />

            {/* Patterns */}
            {resistance?.patterns && resistance.patterns.length > 0 && (
              <View style={[styles.section, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Detected Patterns</Text>
                {resistance.patterns.map((pattern, i) => (
                  <View key={i} style={styles.patternItem}>
                    <Text style={[styles.patternBullet, { color: theme.colors.accent }]}>•</Text>
                    <Text style={[styles.patternText, { color: theme.colors.textMuted }]}>{pattern}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Suggestions */}
            {resistance?.suggestions && resistance.suggestions.length > 0 && (
              <View style={[styles.section, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Suggestions</Text>
                {resistance.suggestions.map((suggestion, i) => (
                  <View key={i} style={styles.suggestionItem}>
                    <Text style={[styles.suggestionIcon, { color: theme.colors.success }]}>✓</Text>
                    <Text style={[styles.suggestionText, { color: theme.colors.textMuted }]}>{suggestion}</Text>
                  </View>
                ))}
              </View>
            )}

            {(!resistance?.patterns || resistance.patterns.length === 0) &&
              (!resistance?.suggestions || resistance.suggestions.length === 0) && (
                <View style={[styles.emptyCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                  <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                    No resistance patterns detected. Keep up the momentum!
                  </Text>
                </View>
              )}
          </Animated.View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '300',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  scoreCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  patternItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  patternBullet: {
    fontSize: 18,
    lineHeight: 22,
  },
  patternText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  suggestionIcon: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
