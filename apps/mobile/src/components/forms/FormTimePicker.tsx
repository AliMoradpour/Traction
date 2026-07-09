import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useTractionTheme } from '@/theme';

interface FormTimePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
}

export function FormTimePicker<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Select time',
}: FormTimePickerProps<T>) {
  const theme = useTractionTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
          <Pressable
            style={[
              styles.picker,
              {
                backgroundColor: theme.colors.input,
                borderColor: error ? theme.colors.danger : theme.colors.border,
              },
            ]}
            onPress={() => {
              // TODO: Implement native time picker
              // For now, just set a default value
              onChange('09:00');
            }}
          >
            <Text
              style={[
                styles.pickerText,
                { color: value ? theme.colors.text : theme.colors.textSubtle },
              ]}
            >
              {value ?? placeholder}
            </Text>
          </Pressable>
          {error && <Text style={[styles.error, { color: theme.colors.danger }]}>{error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  picker: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    minHeight: 56,
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 15,
  },
  error: {
    fontSize: 13,
  },
});
