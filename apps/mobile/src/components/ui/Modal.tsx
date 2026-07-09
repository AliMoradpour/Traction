import type { ReactNode } from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ModalProps as RNModalProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTractionTheme, type TractionTheme } from '../../theme';

export interface ModalProps extends Omit<RNModalProps, 'visible' | 'children'> {
  visible: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Modal({
  visible,
  title,
  description,
  children,
  footer,
  onClose,
  contentStyle,
  animationType = 'fade',
  transparent = true,
  ...modalProps
}: ModalProps) {
  const theme = useTractionTheme();
  const styles = createStyles(theme);

  return (
    <RNModal animationType={animationType} transparent={transparent} visible={visible} onRequestClose={onClose} {...modalProps}>
      <View style={styles.root}>
        <Pressable accessibilityLabel="Close modal" style={styles.scrim} onPress={onClose} />
        <View style={[styles.content, contentStyle]}>
          {title || description ? (
            <View style={styles.header}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {description ? <Text style={styles.description}>{description}</Text> : null}
            </View>
          ) : null}
          <View style={styles.body}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </RNModal>
  );
}

function createStyles(theme: TractionTheme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    scrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.scrim,
    },
    content: {
      backgroundColor: theme.colors.surfaceElevated,
      borderTopLeftRadius: theme.radius.xxl,
      borderTopRightRadius: theme.radius.xxl,
      gap: theme.spacing.lg,
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      ...theme.shadows.modal,
    },
    header: {
      gap: theme.spacing.sm,
    },
    title: {
      ...theme.typography.headlineMd,
      color: theme.colors.text,
      textAlign: 'center',
    },
    description: {
      ...theme.typography.bodyMd,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    body: {
      gap: theme.spacing.md,
    },
    footer: {
      gap: theme.spacing.sm,
    },
  });
}

