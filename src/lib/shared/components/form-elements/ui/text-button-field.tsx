/* React and Chakra UI component imports */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Flex, Group, Input, InputGroup, InputProps, Text } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { lighten } from 'polished';

/* Shared module imports */
import { GRAY_COLOR, PRIMARY_COLOR, SUCCESS_GREEN_COLOR2, WHITE_COLOR } from '@shared/config';
import { IoCheckmarkCircle } from 'react-icons/io5';

/* Props interface for text input field component */
interface TextInputFieldWithButtonProps {
  label: string;
  value: string;
  placeholder: string;
  isInValid: boolean;
  required: boolean;
  errorMessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  inputProps?: InputProps;
  isDebounced?: boolean;
  debounceMs?: number;
  rightIcon?: React.ReactNode
  leftIcon?: React.ReactNode;
  ButtonText?: string;
  onButtonClick?: () => void;
  buttonLoading?: boolean;
  showVerifiedText?: boolean
}

const TextInputFieldWithButton: React.FC<TextInputFieldWithButtonProps> = ({
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
  rightIcon,
  leftIcon,
  ButtonText = "Submit",
  onButtonClick,
  buttonLoading = false,
  showVerifiedText = false
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

  return (
    <Field label={label} invalid={isInValid} errorText={errorMessage} required={required}>
      <Group attached w="full" >
        <InputGroup alignItems={'center'} startElementProps={{fontSize: 'lg'}} startElement={leftIcon ? leftIcon : undefined} 
          endElement={showVerifiedText ?
          <Flex align="center" gap={1} bg={WHITE_COLOR} color={SUCCESS_GREEN_COLOR2} px={2} zIndex={10}>
              <IoCheckmarkCircle size={16} />
              <Text>Verified</Text>
            </Flex>
          : rightIcon ? rightIcon : undefined}
        >
          <Input
            h={'48px'}
            type={'text'}
            borderColor={isInValid ? 'red.500' : lighten(0.3, GRAY_COLOR)}
            borderLeftRadius={'md'}
            borderRightRadius={'none'}
            placeholder={placeholder}
            disabled={disabled}
            value={isDebounced ? localValue : value}
            onChange={readOnly ? undefined : isDebounced ? handleInputChange : onChange}
            onBlur={readOnly ? undefined : isDebounced ? handleBlur : onBlur}
            name={name}
            {...inputProps}
          />
        
        </InputGroup>
        { !showVerifiedText && (
          <Button 
            h={'48px'} 
            bg={PRIMARY_COLOR} 
            borderRightRadius={'md'}
            onClick={onButtonClick}
            disabled={disabled}
            loading={buttonLoading}
          >
            {ButtonText}
          </Button>
        )}
      </Group>
    </Field>
  );
}

export default TextInputFieldWithButton