import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useState } from 'react';
import { useTractionTheme } from '@/theme';

interface FormSelectOption {
  label: string;
  value: string;
}

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: FormSelectOption[];
  placeholder?: string;
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = 'Select an option',
}: FormSelectProps<T>) {
  const theme = useTractionTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selectedOption = options.find((opt) => opt.value === value);

        return (
          <View style={styles.container}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
            <Pressable
              style={[
                styles.select,
                {
                  backgroundColor: theme.colors.input,
                  borderColor: error ? theme.colors.danger : theme.colors.border,
                },
              ]}
              onPress={() => setIsOpen(true)}
            >
              <Text
                style={[
                  styles.selectText,
                  { color: selectedOption ? theme.colors.text : theme.colors.textSubtle },
                ]}
              >
                {selectedOption?.label ?? placeholder}
              </Text>
            </Pressable>
            {error && <Text style={[styles.error, { color: theme.colors.danger }]}>{error.message}</Text>}

            <Modal visible={isOpen} transparent animationType="slide">
              <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
                <View style={[styles.options, { backgroundColor: theme.colors.surfaceElevated }]}>
                  {options.map((option) => (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.option,
                        option.value === value && { backgroundColor: theme.colors.accentMuted },
                      ]}
                      onPress={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                    >
                      <Text style={[styles.optionText, { color: theme.colors.text }]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Pressable>
            </Modal>
          </View>
        );
      }}
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
  select: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    minHeight: 56,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: 15,
  },
  error: {
    fontSize: 13,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  options: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '50%',
  },
  option: {
    padding: 16,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
  },
});
