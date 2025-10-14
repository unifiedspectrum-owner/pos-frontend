/* React and Chakra UI component imports */
import React from 'react';
import { Select, createListCollection } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { lighten } from 'polished';

/* Shared module imports */
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
  height?: string; /* Custom height for the select trigger */
  width?: string; /* Custom width for the select trigger */
  padding?: string; /* Custom padding for the select trigger */
  borderRadius?: string; /* Custom border radius for the select trigger */
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
  size = 'lg',
  height,
  width,
  padding,
  borderRadius
}) => {
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
    <Field label={label} invalid={isInValid} readOnly={readOnly} errorText={errorMessage} required={required}
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
            h={height || "48px"}
            w={width}
            p={padding}
            borderRadius={borderRadius || "2xl"}
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
              placeholder={placeholder}
              data-testid="select-value-text"
            />
          </Select.Trigger>
          <Select.IndicatorGroup pr={3}>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Select.Positioner>
          <Select.Content
            position="absolute"
            zIndex={9999}
            borderRadius="2xl"
            p={2}
            gap={1}
            maxH="200px"
            overflowY="auto"
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            boxShadow="lg"
            data-testid="select-content"
          >
              {collection.items.length > 0 ? (
                collection.items.map((item, index) => (
                  <Select.Item
                    key={item.id || `${item.value}-${index}`}
                    item={item}
                    p={2}
                    borderRadius="lg"
                    cursor="pointer"
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
                ))
              ) : (
                <Select.Item
                  item={{ label: 'No options available', value: '', id: 'no-options' }}
                  p={2}
                >
                  No options available
                </Select.Item>
              )}
            </Select.Content>
        </Select.Positioner>
      </Select.Root>
    </Field>
  )
}

export default SelectField