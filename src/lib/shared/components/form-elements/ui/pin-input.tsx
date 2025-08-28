/* React and Chakra UI component imports */
import React from 'react';
import { Field } from '@/components/ui/field';
import { PinInput } from '@chakra-ui/react';

/* Props interface for pin input field component */
interface PinInputFieldProps {
  label: string; /* Field label text */
  placeholder?: string; /* Placeholder text */
  isInValid: boolean; /* Whether field has validation errors */
  required: boolean; /* Whether field is required */
  errorMessage: string; /* Error message to display */
  disabled?: boolean; /* Whether field is disabled */
  readOnly?: boolean; /* Whether field is read-only */
  name?: string; /* Field name attribute */
  length?: number; /* Number of PIN input fields */
  value?: string[]; /* Current value as array of strings */
  onChange?: (value: string[]) => void; /* Change handler */
  onBlur?: () => void; /* Blur handler */
}

const PinInputField: React.FC<PinInputFieldProps> = ({
  label, 
  placeholder, 
  isInValid, 
  required, 
  errorMessage,
  disabled, 
  readOnly = false, 
  name,
  length = 6,
  value = [],
  onChange,
}) => {

  return (
    <Field label={label} invalid={isInValid} errorText={errorMessage} required={required}>
      <PinInput.Root
        size={'xl'}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        value={value}
        onValueChange={(details) => {
          onChange?.(details.value);
        }}
        otp
      >
        <PinInput.HiddenInput />
        <PinInput.Control gap={'20px'}>
          {Array.from({ length }, (_, index) => (
            <PinInput.Input w={'100%'} key={index} index={index} />
          ))}
        </PinInput.Control>
      </PinInput.Root>
    </Field>
  );
}

export default PinInputField