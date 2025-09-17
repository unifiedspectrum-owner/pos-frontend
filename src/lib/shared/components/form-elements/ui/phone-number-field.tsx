/* React and Chakra UI component imports */
import React, { useCallback } from 'react';
import { Button, Group, Input, InputGroup, Box, Flex, Text } from '@chakra-ui/react';
import { lighten } from 'polished';

/* Shared module imports */
import ComboboxField, { ComboboxOption } from './combobox-field';
import { GRAY_COLOR, PRIMARY_COLOR, SUCCESS_GREEN_COLOR2, WHITE_COLOR } from '@shared/config';
import { Field } from '@/components/ui/field';
import { IoCheckmarkCircle } from 'react-icons/io5';

/* Country code option interface - keeping for backwards compatibility */
export interface CountryCode {
  country: string;
  code: string;
  dialCode: string;
  flag: string;
}

/* Phone number tuple type [dialCode, phoneNumber] */
export type PhoneNumberTuple = [string, string]

/* Props interface for phone number field component */
interface PhoneNumberFieldProps {
  label: string;
  value: PhoneNumberTuple;
  placeholder?: string;
  comboboxPlaceholder?: string;
  isInValid: boolean;
  required: boolean;
  errorMessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange: (value: PhoneNumberTuple) => void;
  onBlur?: () => void;
  name?: string;
  options: ComboboxOption[];
  dialCodes?: CountryCode[];
  defaultDialCode?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  buttonLoading?: boolean;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  getDialCodeFromSelection?: (selectedValue: string) => string;
  showVerifiedText?: boolean;
  showVerifyButton?: boolean;
}

const PhoneNumberField: React.FC<PhoneNumberFieldProps> = ({
  label,
  value,
  placeholder = 'Enter phone number',
  comboboxPlaceholder = 'Select country',
  isInValid,
  required,
  errorMessage,
  disabled = false,
  readOnly = false,
  onChange,
  onBlur,
  name,
  options,
  defaultDialCode = '+91',
  buttonText = 'Verify',
  onButtonClick,
  buttonLoading = false,
  rightIcon,
  leftIcon,
  getDialCodeFromSelection,
  showVerifiedText = false,
  showVerifyButton = true
}) => {
  /* Handle dial code change */
  const handleDialCodeChange = useCallback((selectedValue: string) => {
    if (onChange) {
      /* Use the conversion function if provided, otherwise use the selected value directly */
      const actualDialCode = getDialCodeFromSelection 
        ? getDialCodeFromSelection(selectedValue)
        : selectedValue;
        
      onChange([actualDialCode, value?.[1] || '']);
    }
  }, [onChange, value, getDialCodeFromSelection]);

  /* Handle phone number change */
  const handlePhoneNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange([value?.[0] || defaultDialCode, e.target.value]);
    }
  }, [onChange, value, defaultDialCode]);

  /* Get current dial code for display - ensure it matches an option value */
  const currentDialCode = value?.[0] || defaultDialCode;

  console.log('PhoneNumberField - currentDialCode:', currentDialCode);

  /* Find the matching option for the current dial code */
  const matchingOption = options.find(option => option.value === currentDialCode);
  console.log('PhoneNumberField - matchingOption:', matchingOption);

  /* Use option.value for ComboboxField value matching, fallback to first option if no match */
  const comboboxValue = matchingOption ? matchingOption.value : (options.length > 0 ? options[0].value : currentDialCode);
  console.log('PhoneNumberField - comboboxValue:', comboboxValue);
  
  /* Get current phone number for display */
  const currentPhoneNumber = value?.[1] || '';

  /* Handle blur events */
  const handleBlur = useCallback(() => {
    if (onBlur) {
      onBlur();
    }
  }, [onBlur]);

  return (
    <Field label={label} invalid={isInValid} errorText={errorMessage} required={required}>
      <Group attached w="full" css={{
        '& > div:first-of-type .chakra-field': {
          marginBottom: 0
        },
        '& > div:first-of-type input': {
          borderRightRadius: 0,
         // borderRight: 'none'
        }
      }}>
        {/* Country code combobox - custom styling for integrated appearance */}
        <Box maxW="75px" position="relative">
          <ComboboxField
            label=""
            placeholder={comboboxPlaceholder}
            value={comboboxValue}
            onChange={handleDialCodeChange}
            isInValid={isInValid}
            required={false}
            disabled={disabled}
            readOnly={readOnly}
            options={options || []}
            name={name ? `${name}_country` : undefined}
            size="lg"
            showClearTrigger={false}
          />
        </Box>
        
        {/* Phone number input */}
        <InputGroup flex="1" alignItems={'center'} startElementProps={{fontSize: 'lg'}} startElement={leftIcon ? leftIcon : undefined} 
          endElement={showVerifiedText ?
          <Flex align="center" gap={1} bg={WHITE_COLOR} color={SUCCESS_GREEN_COLOR2} px={2} zIndex={10}>
              <IoCheckmarkCircle size={16} />
              <Text>Verified</Text>
            </Flex>
          : rightIcon ? rightIcon : undefined}
        >
          <Input
            h={'48px'}
            type={'tel'}
            value={currentPhoneNumber}
            onChange={handlePhoneNumberChange}
            onBlur={handleBlur}
            borderColor={isInValid ? 'red.500' : lighten(0.3, GRAY_COLOR)}
            borderRadius={showVerifyButton ? 'none' : undefined}
            borderLeft={'none'}
            borderRight={showVerifyButton ? 'none' : undefined}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            name={name ? `${name}_phone_number` : undefined}
            _hover={{
              borderColor: isInValid ? 'red.600' : lighten(0.2, GRAY_COLOR)
            }}
            _focus={{
              borderColor: isInValid ? 'red.500' : 'blue.500',
              boxShadow: isInValid ? '0 0 0 1px red.500' : '0 0 0 1px blue.500'
            }}
          />
        </InputGroup>

        {/* Verify button */}
        {showVerifyButton && (
          <Button
            h={'48px'}
            minW="100px"
            bg={PRIMARY_COLOR}
            borderRightRadius={'md'}
            borderLeftRadius={'none'}
            onClick={onButtonClick}
            disabled={disabled}
            loading={buttonLoading}
          >
            {buttonText}
          </Button>
        )}
      </Group>
    </Field>
  );
};

export default PhoneNumberField;