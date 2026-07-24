import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { useTractionTheme } from '@/theme';

interface FormTimePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function FormTimePicker<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'HH:MM',
}: FormTimePickerProps<T>) {
  const theme = useTractionTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback((text: string, onChange: (value: string) => void) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    let formatted = '';
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length > 2) formatted += ':' + digits.slice(2);
    onChange(formatted);
  }, []);

  const handleBlur = useCallback((value: string, onChange: (value: string) => void) => {
    setIsFocused(false);
    if (value && !isValidTime(value)) {
      const digits = value.replace(/\D/g, '').padStart(4, '0');
      const hours = Math.min(parseInt(digits.slice(0, 2), 10), 23);
      const minutes = Math.min(parseInt(digits.slice(2, 4), 10), 59);
      onChange(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    }
  }, []);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.input,
                borderColor: error
                  ? theme.colors.danger
                  : isFocused
                    ? theme.colors.primary
                    : theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={value ?? ''}
            onChangeText={(text) => handleChange(text, onChange)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => handleBlur(value ?? '', onChange)}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSubtle}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            returnKeyType="done"
          />
          {error && <Text style={[styles.error, { color: theme.colors.danger }]}>{error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 15, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    minHeight: 56,
    fontSize: 15,
  },
  error: { fontSize: 13 },
});
