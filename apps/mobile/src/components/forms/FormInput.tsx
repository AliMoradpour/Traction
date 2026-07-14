import { forwardRef } from 'react';
import { type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { Input, type InputProps } from '@/components/ui/Input';

interface FormInputProps extends Omit<InputProps, 'control' | 'name'> {
  control: Control<any>;
  name: string;
}

export const FormInput = forwardRef<any, FormInputProps>(function FormInput(
  { control, name, ...props }: FormInputProps,
  ref: React.Ref<any>
) {
  return <Input ref={ref} control={control} name={name} {...props} />;
});
