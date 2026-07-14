import { forwardRef, type ReactNode, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Controller } from 'react-hook-form';
import { useTractionTheme, type TractionTheme } from '../../theme';

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
  ref: React.Ref<TextInput>
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

const InputInner = forwardRef<TextInput, BaseInputProps>(function InputInner(
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

// Export for backward compatibility - accepts both with and without control/name
export const Input = forwardRef(function Input(
  props: InputProps,
  ref: React.Ref<TextInput>
) {
  return <InputInner {...props} ref={ref} />;
});

function createStyles(theme: TractionTheme) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.sm,
      width: '100%',
    },
    label: {
      ...theme.typography.labelSm,
      color: theme.colors.text,
    },
    inputShell: {
      alignItems: 'center',
      backgroundColor: theme.colors.input,
      borderColor: theme.colors.borderMuted,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      flexDirection: 'row',
      minHeight: theme.spacing.controlHeightLg,
      paddingHorizontal: theme.spacing.md,
    },
    focused: {
      borderColor: theme.colors.accent,
      shadowColor: theme.colors.accent,
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
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
