"use client"

/* React and Chakra UI component imports */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { InputProps, VStack, Box, Flex, Text, SimpleGrid, GridItem, InputGroup, Collapsible } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { PasswordInput, PasswordStrengthMeter } from '@/components/ui/password-input';
import { lighten } from 'polished';
import { FaCheck, FaTimes } from 'react-icons/fa';

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config';
import { calculatePasswordStrength, PasswordStrengthResult } from '@shared/utils/validation';

/* Props interface for password input field component */
interface PasswordInputFieldProps {
  label: string; /* Field label text */
  value: string; /* Current input value */
  placeholder: string; /* Placeholder text */
  isInValid: boolean; /* Whether field has validation errors */
  required: boolean; /* Whether field is required */
  errorMessage?: string; /* Error message to display */
  disabled?: boolean; /* Whether field is disabled */
  readOnly?: boolean; /* Whether field is read-only */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; /* Value change handler */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; /* Blur event handler */
  name?: string; /* Field name attribute */
  inputProps?: InputProps; /* Additional Chakra input props */
  isDebounced?: boolean; /* Whether to debounce input changes */
  debounceMs?: number; /* Debounce delay in milliseconds */
  leftIcon?: React.ReactNode;
  autoFocus?: boolean;
  showStrengthMeter?: boolean; /* Whether to show password strength indicator */
  showRequirements?: boolean; /* Whether to show individual requirements checklist */
}

const PasswordInputField = React.forwardRef<HTMLInputElement, PasswordInputFieldProps>(({
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
  autoFocus = false,
  debounceMs = 200,
  leftIcon,
  showStrengthMeter = false,
  showRequirements = false
}, ref) => {
  /* Local state for immediate UI updates */
  const [localValue, setLocalValue] = useState(value);

  /* Password strength state */
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult>(
    calculatePasswordStrength(value)
  );

  /* Refs for tracking debouncing state */
  const isTypingRef = useRef(false); /* Track if user is actively typing */
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); /* Store debounce timeout */
  const lastEmittedValueRef = useRef(value); /* Track last value sent to parent */

  /* Update local value when external value changes (controlled component behavior) */
  useEffect(() => {
    if (!isTypingRef.current && value !== lastEmittedValueRef.current) {
      setLocalValue(value);
      lastEmittedValueRef.current = value;
      setPasswordStrength(calculatePasswordStrength(value));
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
    } as React.ChangeEvent<HTMLInputElement>); /* Create synthetic event for compatibility */
  }, [onChange, name]);

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

  /* Handle input change events */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    isTypingRef.current = true; /* Mark as actively typing */
    setLocalValue(newValue); /* Update local state immediately for responsive UI */

    /* Update password strength */
    if (showStrengthMeter || showRequirements) {
      setPasswordStrength(calculatePasswordStrength(newValue));
    }

    if (isDebounced) {
      debouncedOnChange(newValue); /* Use debounced emission */
    } else {
      emitChange(newValue); /* Emit immediately */
      isTypingRef.current = false; /* Reset immediately for non-debounced */
    }
  };

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

  /* Convert password strength score to meter value (0-4 scale) */
  const strengthMeterValue = Math.round((passwordStrength.score / 100) * 4);

  return (
    <Field
      label={label}
      invalid={isInValid}
      errorText={errorMessage}
      required={required}
      css={{
        '& label': {
          userSelect: 'text',
          cursor: 'text',
          pointerEvents: 'auto'
        },
        '& label:hover': {
          cursor: 'text'
        }
      }}
    >
      <VStack w={'100%'} align="stretch" gap={showStrengthMeter || showRequirements ? 3 : 0}>
        <InputGroup alignItems={'center'} startElementProps={{fontSize: 'lg'}} startElement={leftIcon ? leftIcon : undefined}>
          <PasswordInput
            ref={ref}
            h={'48px'}
            autoFocus={autoFocus}
            borderColor={isInValid ? 'red.500' : lighten(0.3, GRAY_COLOR)}
            borderRadius={'md'}
            placeholder={placeholder}
            disabled={disabled}
            value={isDebounced ? localValue : value}
            onChange={readOnly ? undefined : isDebounced ? handleInputChange : onChange}
            onBlur={readOnly ? undefined : isDebounced ? handleBlur : onBlur}
            name={name}
            {...inputProps}
          />
        </InputGroup>

        {/* Password strength meter */}
        <Collapsible.Root open={showStrengthMeter && !!localValue}>
          <Collapsible.Content>
            <Box>
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="xs" color="gray.600">
                  Password Strength:
                </Text>
                <Text fontSize="xs" color={passwordStrength.color} fontWeight="medium">
                  {passwordStrength.label}
                </Text>
              </Flex>
              <PasswordStrengthMeter max={5} value={strengthMeterValue} />
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Password requirements checklist */}
        <Collapsible.Root open={showRequirements && !!localValue}>
          <Collapsible.Content>
            <SimpleGrid columns={2} gap={1}>
              {Object.entries(passwordStrength.checks).map(([requirement, ismet], index, arr) => (
                <GridItem key={requirement}  colSpan={(index === arr.length - 1) ? 2 : 1}  gap={2}>
                  <Flex alignItems={'center'} gap={2}>
                    {ismet ? (
                      <FaCheck size="10px" color="green" />
                    ) : (
                      <FaTimes size="10px" color="gray" />
                    )}
                    <Text
                      fontSize="xs"
                      color={ismet ? "green.600" : "gray.500"}
                      transition="color 0.2s ease-in-out"
                    >
                      {requirement === 'length' && 'At least 8 characters'}
                      {requirement === 'lowercase' && 'One lowercase letter'}
                      {requirement === 'uppercase' && 'One uppercase letter'}
                      {requirement === 'number' && 'One number'}
                      {requirement === 'special' && 'One special character (!@#$%^&*)'}
                    </Text>
                  </Flex>
                </GridItem>
              ))}
            </SimpleGrid>
          </Collapsible.Content>
        </Collapsible.Root>
      </VStack>
    </Field>
  );
})

PasswordInputField.displayName = 'PasswordInputField'

export default PasswordInputField