import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import { BodyText, Card, EmptyHint, Page, Pill, SectionTitle, StatTiles } from '@/components/calm';
import { Button } from '@/components/ui/Button';
import { useMonthlyReview, useMonthPlan, useUpdateMonthPlan } from '@/hooks/usePlanning';
import { addMonths, monthKey, parseMonthKey } from '@/lib/dates';
import { useTractionTheme } from '@/theme';

function hoursLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = minutes / 60;
  return `${h >= 10 ? Math.round(h) : Math.round(h * 10) / 10} h`;
}

export default function MonthlyReviewScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ month?: string }>();
  const month = parseMonthKey(params.month) ?? addMonths(new Date(), -1);
  const key = monthKey(month);
  const nextKey = monthKey(addMonths(month, 1));
  const name = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const review = useMonthlyReview(key);
  const nextPlan = useMonthPlan(nextKey);
  const updateNext = useUpdateMonthPlan(nextKey);
  const [applied, setApplied] = useState(false);

  const applySuggestions = () => {
    const suggestions = review.data?.suggestedFocuses ?? [];
    const save = () =>
      updateNext.mutate(
        { focuses: suggestions.slice(0, 3) },
        {
          onSuccess: () => setApplied(true),
          onError: (error: any) => Alert.alert("Couldn't save", error?.message || 'Please try again.'),
        },
      );
    if ((nextPlan.data?.focuses.length ?? 0) > 0) {
      Alert.alert('Replace your focuses?', 'You already set focuses for next month. Use these instead?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace', onPress: save },
      ]);
    } else {
      save();
    }
  };

  const list = (title: string, items: string[] | undefined) =>
    items && items.length > 0 ? (
      <>
        <SectionTitle title={title} />
        <Card style={{ gap: 10 }}>
          {items.map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
              <Text style={{ color: theme.colors.accent, ...theme.typography.bodyMd }}>•</Text>
              <View style={{ flex: 1 }}>
                <BodyText>{item}</BodyText>
              </View>
            </View>
          ))}
        </Card>
      </>
    ) : null;

  if (review.isLoading) {
    return (
      <Page title={name} subtitle="Looking back at your month…">
        <ActivityIndicator style={{ marginTop: 32 }} />
      </Page>
    );
  }

  if (review.isError || !review.data) {
    return (
      <Page title={name}>
        <EmptyHint icon="cloud-offline-outline" title="We couldn't build the review" text="Check your connection and try again.">
          <Button variant="secondary" onPress={() => review.refetch()} fullWidth={false}>
            Try again
          </Button>
        </EmptyHint>
      </Page>
    );
  }

  const r = review.data;
  const suggestions = r.suggestedFocuses ?? [];

  return (
    <Page title={name} subtitle="Your month in review">
      <StatTiles
        items={[
          { label: 'tasks done', value: String(r.stats.completed), tint: 'sage' },
          { label: 'of planned', value: `${r.stats.completionRate}%`, tint: 'blue' },
          { label: 'focused', value: hoursLabel(r.stats.focusMinutes), tint: 'sand' },
        ]}
      />

      {r.focuses.length > 0 ? (
        <Card tint="blue" style={{ gap: 6 }}>
          <Text style={{ ...theme.typography.labelSm, fontWeight: '600', color: theme.colors.textMuted }}>YOUR FOCUSES</Text>
          {r.focuses.map((f, i) => (
            <BodyText key={i}>{`${i + 1}. ${f}`}</BodyText>
          ))}
        </Card>
      ) : null}

      <Card style={{ gap: 8 }}>
        <BodyText>{r.summary}</BodyText>
        {!r.aiGenerated ? <Pill label="Summary from your numbers only" tone="sand" /> : null}
      </Card>

      {list('What went well', r.wins)}
      {list('What got in the way', r.struggles)}
      {list('Patterns', r.patterns)}
      {list('For next month', r.nextMonth)}

      {suggestions.length > 0 && nextKey <= monthKey(addMonths(new Date(), 1)) ? (
        <>
          <SectionTitle title="Suggested focuses" />
          <Card tint="sage" style={{ gap: 10 }}>
            {suggestions.map((s, i) => (
              <BodyText key={i}>{`${i + 1}. ${s}`}</BodyText>
            ))}
            {applied ? (
              <Button
                variant="secondary"
                onPress={() => router.push({ pathname: '/today/month', params: { month: nextKey } })}
              >
                Open next month
              </Button>
            ) : (
              <Button variant="primary" onPress={applySuggestions} loading={updateNext.isPending}>
                Use these for next month
              </Button>
            )}
          </Card>
        </>
      ) : null}
    </Page>
  );
}
