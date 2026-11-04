import { forwardRef, type ReactNode, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  Platform,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import { type TractionTheme,useTractionTheme } from '../../theme';

export interface BaseInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
}

interface InputWithControlProps extends BaseInputProps {
  control: any;
  name: string;
}

interface InputWithoutControlProps extends BaseInputProps {
  control?: never;
  name?: never;
}

export type InputProps = InputWithControlProps | InputWithoutControlProps;

function InputComponent(
  props: InputProps,
  ref: React.Ref<TextInputInstance>
) {
  const {
    control,
    name,
    label,
    error,
    helperText,
    leftAccessory,
    rightAccessory,
    containerStyle,
    inputContainerStyle,
    editable = true,
    onBlur,
    onFocus,
    style,
    ...textInputProps
  } = props;

  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur: fieldOnBlur, value } }) => (
          <InputInner
            ref={ref}
            label={label}
            error={error}
            helperText={helperText}
            leftAccessory={leftAccessory}
            rightAccessory={rightAccessory}
            containerStyle={containerStyle}
            inputContainerStyle={inputContainerStyle}
            editable={editable}
            onBlur={(e) => {
              fieldOnBlur();
              onBlur?.(e);
            }}
            onFocus={onFocus}
            style={style}
            value={value}
            onChangeText={onChange}
            {...textInputProps}
          />
        )}
      />
    );
  }

  return (
    <InputInner
      ref={ref}
      label={label}
      error={error}
      helperText={helperText}
      leftAccessory={leftAccessory}
      rightAccessory={rightAccessory}
      containerStyle={containerStyle}
      inputContainerStyle={inputContainerStyle}
      editable={editable}
      onBlur={onBlur}
      onFocus={onFocus}
      style={style}
      {...textInputProps}
    />
  );
}

const InputInner = forwardRef<TextInputInstance, BaseInputProps>(function InputInner(
  {
    label,
    error,
    helperText,
    leftAccessory,
    rightAccessory,
    containerStyle,
    inputContainerStyle,
    editable = true,
    onBlur,
    onFocus,
    style,
    ...textInputProps
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const theme = useTractionTheme();
  const styles = createStyles(theme);
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputShell,
          focused && styles.focused,
          hasError && styles.error,
          !editable && styles.disabled,
          inputContainerStyle,
        ]}
      >
        {leftAccessory ? <View style={styles.accessory}>{leftAccessory}</View> : null}
        <TextInput
          ref={ref}
          editable={editable}
          placeholderTextColor={theme.colors.textSubtle}
          selectionColor={theme.colors.accent}
          style={[styles.input, style]}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          {...textInputProps}
        />
        {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
});

// Accepts both with and without control/name; with them, the field is bound to react-hook-form.
export const Input = forwardRef(InputComponent);

function createStyles(theme: TractionTheme) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.sm,
      width: '100%',
    },
    label: {
      ...theme.typography.labelSm,
      fontWeight: '600',
      color: theme.colors.textMuted,
      marginLeft: theme.spacing.xs,
    },
    inputShell: {
      alignItems: 'center',
      backgroundColor: theme.colors.input,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      borderWidth: 1.5,
      flexDirection: 'row',
      minHeight: theme.spacing.controlHeightLg,
      paddingHorizontal: theme.spacing.md,
    },
    focused: {
      borderColor: theme.colors.accent,
    },
    error: {
      borderColor: theme.colors.danger,
    },
    disabled: {
      backgroundColor: theme.colors.disabled,
      opacity: 0.72,
    },
    input: {
      ...theme.typography.bodyMd,
      color: theme.colors.text,
      flex: 1,
      minHeight: theme.spacing.controlHeightLg,
      paddingVertical: 0,
      // The shell already shows focus; hide the browser's own outline on web.
      ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
    },
    accessory: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    helper: {
      ...theme.typography.labelSm,
      color: theme.colors.textSubtle,
    },
    errorText: {
      ...theme.typography.labelSm,
      color: theme.colors.dangerText,
    },
  });
}
