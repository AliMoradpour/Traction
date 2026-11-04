import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { type TractionTheme, useTractionTheme } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type IconName = ComponentProps<typeof Ionicons>['name'];

const SLIDES: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'sunny-outline',
    title: 'Start with Today',
    description: 'A short, realistic list for the day, so you always know what to do next.',
  },
  {
    icon: 'flag-outline',
    title: 'Keep goals in view',
    description: 'Break bigger goals into small steps and see whether you are on pace.',
  },
  {
    icon: 'timer-outline',
    title: 'Focus on one thing',
    description: 'Start a focus session from the Focus tab. If you get stuck, Traction helps you find a smaller step.',
  },
  {
    icon: 'bar-chart-outline',
    title: 'Notice your progress',
    description: 'Progress shows how your week is going and the patterns behind it.',
  },
];

export default function WelcomeIntroScreen() {
  const theme = useTractionTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLast = currentIndex === SLIDES.length - 1;

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    setCurrentIndex(Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH));
  };

  const handleComplete = () => router.replace('/(app)/today');

  const handleNext = () => {
    if (isLast) {
      handleComplete();
      return;
    }
    scrollViewRef.current?.scrollTo({ x: (currentIndex + 1) * SCREEN_WIDTH, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipRow}>
        <Pressable onPress={handleComplete} hitSlop={12} accessibilityRole="button">
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.iconWrap}>
              <Ionicons name={slide.icon} size={44} color={theme.colors.accent} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, index) => (
            <View key={slide.title} style={[styles.dot, index === currentIndex && styles.dotActive]} />
          ))}
        </View>
        <Button variant={isLast ? 'primary' : 'secondary'} size="lg" onPress={handleNext}>
          {isLast ? "Let's begin" : 'Next'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: TractionTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    skipRow: { alignItems: 'flex-end', paddingHorizontal: 24, paddingTop: 8 },
    skip: { ...theme.typography.bodyMd, fontWeight: '600', color: theme.colors.textMuted },
    slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
    iconWrap: {
      width: 112,
      height: 112,
      borderRadius: 56,
      backgroundColor: theme.colors.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
    },
    title: { ...theme.typography.displayLgMobile, color: theme.colors.text, textAlign: 'center' },
    description: {
      ...theme.typography.bodyLg,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginTop: 12,
    },
    footer: { paddingHorizontal: 24, paddingBottom: 16, gap: 24 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.surfaceMuted },
    dotActive: { width: 22, backgroundColor: theme.colors.accent },
  });
}
