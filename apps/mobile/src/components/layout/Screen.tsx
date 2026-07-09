import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme, type TractionTheme } from '../../theme';

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  scrollViewProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle'>;
}

export function Screen({
  children,
  scroll = true,
  keyboardAvoiding = false,
  contentContainerStyle,
  style,
  scrollViewProps,
}: ScreenProps) {
  const theme = useTractionTheme();
  const styles = createStyles(theme);
  const content = scroll ? (
    <ScrollView
      bounces={false}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.staticContent, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.root, style]}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

function createStyles(theme: TractionTheme) {
  return StyleSheet.create({
    root: {
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    keyboard: {
      flex: 1,
    },
    content: {
      gap: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.marginMobile,
      paddingTop: theme.spacing.lg,
    },
    staticContent: {
      flex: 1,
    },
  });
}

