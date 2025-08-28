import React from 'react';
import { Field } from '@/components/ui/field';
import { Select, Portal, createListCollection } from '@chakra-ui/react';
import { lighten } from 'polished';
import { GRAY_COLOR } from '@shared/config';

/* Option structure for select dropdown */
export interface SelectOption {
  value: string; /* Option value */
  label: string; /* Option display text */
}

/* Props interface for select field component */
interface SelectFieldProps {
  label: string; /* Field label text */
  value: string | string[]; /* Current selected value(s) */
  placeholder?: string; /* Placeholder text */
  isInValid: boolean; /* Whether field has validation errors */
  required: boolean; /* Whether field is required */
  errorMessage?: string; /* Error message to display */
  disabled?: boolean; /* Whether field is disabled */
  readOnly?: boolean; /* Whether field is read-only */
  options: SelectOption[]; /* Available options array */
  onChange: (value: string) => void; /* Value change handler */
  name?: string; /* Field name attribute */
  size?: 'sm' | 'md' | 'lg'; /* Field size variant */
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  placeholder,
  isInValid,
  required,
  errorMessage,
  disabled = false,
  readOnly = false,
  options,
  onChange,
  name,
  size = 'lg'
}) => {
  /* Create collection from options with unique identifiers */
  const collection = createListCollection({
    items: options.map((option, index) => ({
      label: option.label,
      value: option.value,
      id: `select-option-${index}-${option.value}`, // Unique identifier
    }))
  })

  /* Ensure value is in array format for Select.Root and filter out empty values */
  const selectValue = Array.isArray(value) 
    ? value.filter(v => v !== '' && v !== null && v !== undefined)
    : value && value !== '' ? [value] : []

  return (
    <Field label={label} invalid={isInValid} readOnly={readOnly} errorText={errorMessage} required={required}>
      <Select.Root
        size={size}
        value={selectValue}
        onValueChange={(e) => {
          const newValue = e.value[0]
          onChange(newValue)
        }}
        readOnly = {readOnly}
        disabled={disabled}
        name={name}
        collection={collection}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger
            h="48px"
            borderRadius="2xl"
            borderColor={isInValid ? 'red.500' : lighten(0.3, GRAY_COLOR)}
            _hover={{
              borderColor: isInValid ? 'red.600' : lighten(0.2, GRAY_COLOR)
            }}
            _focus={{
              borderColor: isInValid ? 'red.500' : 'blue.500',
              boxShadow: isInValid ? '0 0 0 1px red.500' : '0 0 0 1px blue.500'
            }}
            data-testid="select-trigger"
          >
            <Select.ValueText 
              px={3} 
              placeholder={placeholder}
              data-testid="select-value-text"
            />
          </Select.Trigger>
          <Select.IndicatorGroup pr={3}>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content 
              borderRadius="2xl" 
              p={2} 
              gap={1}
              maxH="200px"
              overflowY="auto"
              data-testid="select-content"
            >
              {collection.items.map((item, index) => (
                <Select.Item 
                  key={item.id || `${item.value}-${index}`}
                  item={item}
                  p={2}
                  borderRadius="lg"
                  _hover={{
                    bg: lighten(0.4, GRAY_COLOR)
                  }}
                  data-testid={`select-option-${item.value}`}
                  data-option-index={index}
                  data-option-value={item.value}
                >
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Field>
  )
}

export default SelectField