/* React and Chakra UI component imports */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input, InputProps } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { lighten } from 'polished';

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config';

/* Props interface for date input field component */
interface DateFieldProps {
  label: string;
  value: string | null;
  placeholder?: string;
  isInValid: boolean;
  required?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  inputProps?: InputProps;
  min?: string;
  max?: string;
  helperText?: string;
}

const DateField: React.FC<DateFieldProps> = ({
  label, 
  value, 
  placeholder = 'Select date', 
  isInValid, 
  required = false, 
  errorMessage,
  disabled = false, 
  readOnly = false, 
  onChange, 
  onBlur, 
  name,
  inputProps,
  min,
  max,
  helperText
}) => {
  /* Local state for immediate UI updates */
  const [localValue, setLocalValue] = useState(value || '');
  
  /* Refs for tracking state */
  const lastEmittedValueRef = useRef(value || '');
  
  /* Update local value when external value changes (controlled component behavior) */
  useEffect(() => {
    const newValue = value || '';
    if (newValue !== lastEmittedValueRef.current) {
      setLocalValue(newValue);
      lastEmittedValueRef.current = newValue;
    }
  }, [value]);

  /* Emit change event with synthetic event object */
  const emitChange = useCallback((newValue: string) => {
    lastEmittedValueRef.current = newValue;
    onChange({ 
      target: { 
        value: newValue || null,
        name: name 
      } 
    } as React.ChangeEvent<HTMLInputElement>);
  }, [onChange, name]);

  /* Handle input change events */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    emitChange(newValue);
  };

  /* Handle blur events */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
  };

  /* Format date for display */
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      /* Return in YYYY-MM-DD format for HTML date input */
      return dateString;
    } catch (error) {
      console.log(error)
      return dateString;
    }
  };

  /* Validate date format */
  const isValidDateFormat = (dateString: string) => {
    if (!dateString) return true; /* Empty is valid if not required */
    
    /* Check basic YYYY-MM-DD format */
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    
    /* Check if date is valid */
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.toISOString().split('T')[0] === dateString;
  };

  /* Determine if field has validation error */
  const hasValidationError = isInValid || (localValue && !isValidDateFormat(localValue));

  return (
    <Field label={label} invalid={Boolean(hasValidationError)} errorText={errorMessage} required={required} helperText={helperText}>
      <Input
        h={'48px'}
        type={'date'}
        borderColor={hasValidationError ? 'red.500' : lighten(0.3, GRAY_COLOR)}
        borderRadius={'md'}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        value={formatDateForDisplay(localValue)}
        onChange={readOnly ? undefined : handleInputChange}
        onBlur={readOnly ? undefined : handleBlur}
        name={name}
        min={min}
        max={max}
        /* Date input specific styles */
        _hover={{
          borderColor: hasValidationError ? 'red.400' : lighten(0.2, GRAY_COLOR)
        }}
        _focus={{
          borderColor: hasValidationError ? 'red.500' : 'blue.500',
          boxShadow: `0 0 0 1px ${hasValidationError ? 'red.500' : 'blue.500'}`
        }}
        /* Additional date input constraints */
        pattern="\d{4}-\d{2}-\d{2}"
        maxLength={10}
        {...inputProps}
      />
    </Field>
  );
}

export default DateField