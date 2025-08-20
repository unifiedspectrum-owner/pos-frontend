import React from 'react';
import { Field } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { Flex } from '@chakra-ui/react';
import { lighten } from 'polished';
import { GRAY_COLOR } from '@shared/config';

/* Props interface for switch field component */
interface SwitchFieldProps {
  label: string; /* Field label text */
  value: boolean; /* Current switch state */
  isInValid: boolean; /* Whether field has validation errors */
  required: boolean; /* Whether field is required */
  errorMessage: string; /* Error message to display */
  disabled?: boolean; /* Whether field is disabled */
  readOnly?: boolean; /* Whether field is read-only */
  onChange: (checked: boolean) => void; /* Value change handler */
  name?: string; /* Field name attribute */
  activeText?: string; /* Text to show when switch is on */
  inactiveText?: string; /* Text to show when switch is off */
}

const SwitchField: React.FC<SwitchFieldProps> = ({
  label, 
  value, 
  isInValid, 
  required, 
  errorMessage, 
  readOnly = false,
  disabled, 
  onChange,
  name,
  activeText = 'Active', /* Default text for active state */
  inactiveText = 'Inactive' /* Default text for inactive state */
}) => {
  return (
    <Field label={label} invalid={isInValid} errorText={errorMessage} required={required}>
      <Flex 
        borderWidth={1} 
        w={'100%'} 
        h={'48px'} 
        p={'12px'} 
        borderRadius={'2xl'}
        borderColor={lighten(0.3, GRAY_COLOR)}
        cursor={disabled ? 'not-allowed' : 'pointer'}
        onClick={() => !disabled && onChange(!value)} /* Toggle value on click if not disabled */
        _hover={!disabled ? {
          borderColor: GRAY_COLOR,
          bg: lighten(0.7, GRAY_COLOR)
        } : {}} /* Apply hover styles only when enabled */
        transition="all 0.2s"
      >
        <Switch 
          checked={value}
          disabled={disabled}
          readOnly={readOnly}
          name={name}
          onCheckedChange={(details) => onChange(details.checked)}
        >
          {value ? activeText : inactiveText}
        </Switch>
      </Flex>
    </Field>
  );
}

export default SwitchField;