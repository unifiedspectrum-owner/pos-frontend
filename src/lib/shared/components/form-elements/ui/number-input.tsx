/* React and Chakra UI component imports */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HStack, IconButton, InputProps, NumberInput } from '@chakra-ui/react';
import { lighten } from 'polished';
import { Field } from '@/components/ui/field';
import { LuMinus, LuPlus } from 'react-icons/lu';

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config';

interface NumberInputFieldProps {
  label: string;
  value: string;
  placeholder: string;
  isInValid: boolean;
  required: boolean;
  errorMessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  inputProps?: InputProps;
  isDebounced?: boolean;
  debounceMs?: number;
  min?: number;
  max?: number | null;
}

const NumberInputField: React.FC<NumberInputFieldProps> = ({
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
  debounceMs = 300,
  min = 1,
  max
}) => {
  /* State management */
  const [localValue, setLocalValue] = useState(value);
  const isTypingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastEmittedValueRef = useRef(value);
  
  /* Sync external value changes with local state */
  useEffect(() => {
    if (!isTypingRef.current && value !== lastEmittedValueRef.current) {
      setLocalValue(value);
      lastEmittedValueRef.current = value;
    }
  }, [value]);

  /* Cleanup timeout on unmount */
  useEffect(() => {
    return () => {
      isTypingRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /* Emit change event with validated value */
  const emitChange = useCallback((newValue: string) => {
    lastEmittedValueRef.current = newValue;
    onChange(newValue);
  }, [onChange]);

  /* Debounced onChange handler - delays emission until user stops typing */
  const debouncedOnChange = useCallback((newValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); /* Clear previous timeout */
    }
    
    timeoutRef.current = setTimeout(() => {
      emitChange(newValue);
      isTypingRef.current = false; /* Reset typing flag after debounced update */
    }, debounceMs);
  }, [emitChange, debounceMs]);

  /* Handle value change from NumberInput */
  const handleValueChange = useCallback((details: { value: string }) => {
    const newValue = details.value;
    isTypingRef.current = true; /* Mark as actively typing */
    setLocalValue(newValue); /* Update local state immediately for responsive UI */
    
    if (isDebounced) {
      debouncedOnChange(newValue); /* Use debounced emission */
    } else {
      emitChange(newValue); /* Emit immediately */
      isTypingRef.current = false; /* Reset immediately for non-debounced */
    }
  }, [isDebounced, debouncedOnChange, emitChange]);

  /* Handle blur events - ensure final value is emitted */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isTypingRef.current = false; /* Mark as not typing */
    
    if (isDebounced) {
      /* Clear any pending timeout to avoid duplicate emissions */
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      /* Only emit if value changed and hasn't been emitted yet */
      if (localValue !== lastEmittedValueRef.current) {
        emitChange(localValue);
      }
    }
    
    onBlur?.(e);
  };

  return (
    <Field label={label} invalid={isInValid} errorText={errorMessage} required={required}>
      <NumberInput.Root 
        value={isDebounced ? localValue : value}
        onValueChange={readOnly ? undefined : handleValueChange}
        disabled={disabled}
        min={min}
        max={max === null ? undefined : max}
        unstyled 
        spinOnPress={false}
      >
        <HStack gap="2">
          {/* Decrement button */}
          <NumberInput.DecrementTrigger asChild>
            <IconButton variant="outline" size="sm" disabled={disabled || readOnly}>
              <LuMinus />
            </IconButton>
          </NumberInput.DecrementTrigger>
          
          {/* Number input field */}
          <NumberInput.Control />
          <NumberInput.Input 
            textAlign="center" 
            fontSize="lg" 
            p={'12px'}
            w={'100px'}
            borderWidth={'1px'}
            h={'100%'}
            _focus={{ borderWidth: '1px' }}
            _active={{ borderWidth: '1px' }}
            borderColor={lighten(0.3, GRAY_COLOR)}
            borderRadius={'2xl'}
            placeholder={placeholder}
            name={name}
            onBlur={readOnly ? undefined : handleBlur}
            {...inputProps}
          />
          
          {/* Increment button */}
          <NumberInput.IncrementTrigger asChild>
            <IconButton variant="outline" size="sm" disabled={disabled || readOnly}>
              <LuPlus />
            </IconButton>
          </NumberInput.IncrementTrigger>
        </HStack>
      </NumberInput.Root>
    </Field>
  );
}

export default NumberInputField