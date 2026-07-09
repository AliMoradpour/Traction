import { forwardRef } from 'react';
import { type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { Input, type InputProps } from '@/components/ui/Input';

interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'control' | 'name'> {
  control: Control<T>;
  name: FieldPath<T>;
}

export const FormInput = forwardRef(function FormInput<T extends FieldValues>(
  { control, name, ...props }: FormInputProps<T>,
  ref: React.Ref<any>
) {
  return <Input ref={ref} control={control} name={name} {...props} />;
});
