import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTractionTheme, type TractionTheme } from '@/theme';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/feedback/Toast';
import { useFeedback } from '@/hooks/useFeedback';
import { useCurrentRoute } from '@/hooks/useCurrentRoute';

type FeedbackType = 'bug' | 'feature' | 'general';

const FEEDBACK_TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'general', label: 'General' },
];

export function FeedbackWidget() {
  const theme = useTractionTheme();
  const styles = createStyles(theme);
  const { submitFeedback } = useFeedback();
  const currentRoute = useCurrentRoute();

  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<FeedbackType>('general');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    await submitFeedback(type, message.trim());
    setMessage('');
    setType('general');
    setVisible(false);
    setToast('Thanks for your feedback!');
  };

  const handleCancel = () => {
    setMessage('');
    setType('general');
    setVisible(false);
  };

  return (
    <>
      <Pressable
        style={styles.fab}
        onPress={() => setVisible(true)}
        accessibilityLabel="Send feedback"
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>?</Text>
      </Pressable>

      <Modal
        visible={visible}
        title="Send Feedback"
        onClose={handleCancel}
        footer={
          <View style={styles.footerRow}>
            <Button variant="ghost" size="md" onPress={handleCancel} title="Cancel" />
            <Button variant="primary" size="md" onPress={handleSubmit} title="Submit" disabled={!message.trim()} />
          </View>
        }
      >
        <View style={styles.typeRow}>
          {FEEDBACK_TYPES.map((t) => (
            <Pressable
              key={t.value}
              style={[styles.typePill, type === t.value && styles.typePillActive]}
              onPress={() => setType(t.value)}
            >
              <Text style={[styles.typePillText, type === t.value && styles.typePillTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Describe your feedback..."
          placeholderTextColor={theme.colors.textSubtle}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={message}
          onChangeText={setMessage}
        />

        <View style={styles.screenRow}>
          <Text style={styles.screenLabel}>Screen:</Text>
          <Text style={styles.screenValue}>{currentRoute}</Text>
        </View>
      </Modal>

      {toast && <Toast message={toast} type="success" onDismiss={() => setToast(null)} />}
    </>
  );
}

function createStyles(theme: TractionTheme) {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      right: 20,
      bottom: theme.spacing.bottomTabHeight + 16,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.raised,
      opacity: 0.85,
      zIndex: 100,
    },
    fabText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '700',
    },
    typeRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    typePill: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surfaceSoft,
      borderWidth: 1,
      borderColor: theme.colors.borderMuted,
    },
    typePillActive: {
      backgroundColor: theme.colors.accentMuted,
      borderColor: theme.colors.accent,
    },
    typePillText: {
      ...theme.typography.labelSm,
      color: theme.colors.textMuted,
    },
    typePillTextActive: {
      color: theme.colors.accent,
      fontWeight: '600',
    },
    input: {
      backgroundColor: theme.colors.input,
      borderWidth: 1,
      borderColor: theme.colors.borderMuted,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      minHeight: 120,
      ...theme.typography.bodyMd,
      color: theme.colors.text,
    },
    screenRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    screenLabel: {
      ...theme.typography.labelSm,
      color: theme.colors.textSubtle,
    },
    screenValue: {
      ...theme.typography.labelSm,
      color: theme.colors.textMuted,
    },
    footerRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
  });
}
