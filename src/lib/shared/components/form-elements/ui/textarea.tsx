/* React and Chakra UI component imports */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Field } from '@/components/ui/field';
import { Textarea, TextareaProps } from '@chakra-ui/react';
import { lighten } from 'polished';

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config';

/* Props interface for textarea field component */
interface TextAreaFieldProps {
  label: string; /* Field label text */
  value: string; /* Current textarea value */
  placeholder: string; /* Placeholder text */
  isInValid: boolean; /* Whether field has validation errors */
  required: boolean; /* Whether field is required */
  errorMessage?: string; /* Error message to display */
  disabled?: boolean; /* Whether field is disabled */
  readOnly?: boolean; /* Whether field is read-only */
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; /* Value change handler */
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void; /* Blur event handler */
  name?: string; /* Field name attribute */
  inputProps?: TextareaProps; /* Additional Chakra textarea props */
  isDebounced?: boolean; /* Whether to debounce input changes */
  debounceMs?: number; /* Debounce delay in milliseconds */
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label, 
  value, 
  placeholder, 
  isInValid, 
  required, 
  errorMessage,
  disabled, 
  readOnly = false, 
  onChange, 
  onBlur, 
  name,
  inputProps,
  isDebounced = true,
  debounceMs = 300
}) => {
  /* Local state for immediate UI updates */
  const [localValue, setLocalValue] = useState(value);
  
  /* Refs for tracking debouncing state */
  const isTypingRef = useRef(false); /* Track if user is actively typing */
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); /* Store debounce timeout */
  const lastEmittedValueRef = useRef(value); /* Track last value sent to parent */
  
  /* Update local value when external value changes (controlled component behavior) */
  useEffect(() => {
    if (!isTypingRef.current && value !== lastEmittedValueRef.current) {
      setLocalValue(value);
      lastEmittedValueRef.current = value;
    }
  }, [value]);

  /* Cleanup timeout on unmount to prevent memory leaks */
  useEffect(() => {
    return () => {
      isTypingRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /* Emit change event with synthetic event object */
  const emitChange = useCallback((newValue: string) => {
    lastEmittedValueRef.current = newValue;
    onChange({ 
      target: { 
        value: newValue,
        name: name 
      } 
    } as React.ChangeEvent<HTMLTextAreaElement>); /* Create synthetic event for compatibility */
  }, [onChange, name]);

  /* Debounced onChange handler */
  const debouncedOnChange = useCallback((newValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      emitChange(newValue);
      isTypingRef.current = false; // Reset typing flag after debounced update
    }, debounceMs);
  }, [emitChange, debounceMs]);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    isTypingRef.current = true;
    setLocalValue(newValue);
    
    if (isDebounced) {
      debouncedOnChange(newValue);
    } else {
      emitChange(newValue);
      isTypingRef.current = false; // Reset immediately for non-debounced
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    isTypingRef.current = false;
    
    if (isDebounced) {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Only emit if value changed and hasn't been emitted yet
      if (localValue !== lastEmittedValueRef.current) {
        emitChange(localValue);
      }
    }
    
    onBlur?.(e);
  };

  return (
    <Field label={label} invalid={isInValid} errorText={errorMessage} required={required}>
      <Textarea
        p={'12px'}
        borderColor={lighten(0.3, GRAY_COLOR)}
        borderRadius={'2xl'}
        placeholder={placeholder}
        disabled={disabled}
        value={isDebounced ? localValue : value}
        onChange={readOnly ? undefined : isDebounced ? handleTextAreaChange : onChange}
        onBlur={readOnly ? undefined : isDebounced ? handleBlur : onBlur}
        name={name}
        {...inputProps}
      />
    </Field>
  );
}

export default TextAreaField;