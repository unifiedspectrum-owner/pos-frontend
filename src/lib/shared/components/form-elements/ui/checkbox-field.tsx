/* React and Chakra UI component imports */
import React from 'react';
import { Field } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { Flex } from '@chakra-ui/react';

/* Props interface for checkbox field component */
interface CheckboxFieldProps {
  label: string; /* Field label text */
  value: boolean; /* Current checkbox state */
  isInValid: boolean; /* Whether field has validation errors */
  required: boolean; /* Whether field is required */
  errorMessage?: string; /* Error message to display */
  disabled?: boolean; /* Whether field is disabled */
  readOnly?: boolean; /* Whether field is read-only */
  onChange: (checked: boolean) => void; /* Value change handler */
  name?: string; /* Field name attribute */
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  value,
  isInValid,
  required,
  errorMessage,
  readOnly = false,
  disabled,
  onChange,
  name
}) => {
  return (
    <Field invalid={isInValid} errorText={errorMessage} required={required}>
      <Flex
        cursor={disabled ? 'not-allowed' : 'pointer'}
        onClick={(e) => {
          e.preventDefault()
          if (!disabled && !readOnly) {
            onChange(!value)
          }
        }}
        transition="all 0.2s"
        alignItems="center"
      >
        <Checkbox
          cursor={'pointer'}
          alignItems={'center'}
          checked={value}
          disabled={disabled}
          readOnly={readOnly}
          name={name}
          onCheckedChange={(details) => {
            onChange(details.checked as boolean)
          }}
          onClick={(e) => e.stopPropagation()}
          css={{
            '& [data-part="control"]': {
              borderWidth: '2px',
              height:'25px',
              width:'25px',
              borderRadius: 'md'
            }
          }}
        >
          {label}
        </Checkbox>
      </Flex>
    </Field>
  );
}

export default CheckboxField;