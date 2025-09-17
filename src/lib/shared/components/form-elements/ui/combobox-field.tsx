/* React and Chakra UI component imports */
import React, { useEffect } from 'react';
import { Combobox, Portal, useFilter, useListCollection } from '@chakra-ui/react';
import { lighten } from 'polished';

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config';
import { Field } from '@/components/ui/field';

/* Option structure for combobox dropdown */
export interface ComboboxOption {
  value: string
  label: string
}

/* Props interface for combobox field component */
interface ComboboxFieldProps {
  label: string
  value: string | string[]
  placeholder?: string
  isInValid: boolean
  required: boolean
  errorMessage?: string
  disabled?: boolean
  readOnly?: boolean
  options: ComboboxOption[]
  onChange: (value: string) => void
  name?: string
  size?: 'sm' | 'md' | 'lg'
  allowCustomValue?: boolean
  isDebounced?: boolean
  debounceMs?: number;
  showClearTrigger?: boolean;
}

const ComboboxField: React.FC<ComboboxFieldProps> = ({
  label,
  value,
  placeholder = "Type to search",
  isInValid,
  required,
  errorMessage,
  disabled = false,
  readOnly = false,
  options,
  onChange,
  name,
  size = 'lg',
  showClearTrigger = true
}) => {
  
  /* Normalize value to string for consistent handling */
  const normalizedValue = Array.isArray(value)
    ? value.filter(v => v !== '' && v !== null && v !== undefined)[0] || ''
    : value && value !== '' ? value : ''

  console.log('ComboboxField - received value:', value)
  console.log('ComboboxField - normalizedValue:', normalizedValue)

  /* Find matching option */
  const matchingOption = options.find(option => option.value === normalizedValue)
  console.log('ComboboxField - matching option:', matchingOption)

  /* Filter functionality */
  const { contains } = useFilter({ sensitivity: "base" })

  /* Collection management with dynamic filtering */
  const { collection, filter, set } = useListCollection({
    initialItems: options,
    itemToString: (item) => item.label, // Use label for filtering and display
    itemToValue: (item) => item.value,     // Use value to match form field values
    filter: contains,
  })

  useEffect(() => {
    set(options)
  }, [options, set])

  /* Handle input value changes */
  const handleInputValueChange = (details: { inputValue: string }) => {
    filter(details.inputValue);
  };

  /* Handle Enter key press to select first filtered option */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      const inputElement = event.target as HTMLInputElement;
      const currentInputValue = inputElement.value;
      
      const filteredItems = options.filter(option => 
        option.label.toLowerCase().includes(currentInputValue.toLowerCase())
      );
      
      const firstFilteredItem = filteredItems[0];
      if (firstFilteredItem) {
        console.log("ComboboxField - Enter key selection:", firstFilteredItem)
        onChange(firstFilteredItem.value);
      }
    }
  };

  /* Handle value selection */
  const handleValueChange = (details: { value: string[] }) => {
    const selectedValue = details.value[0] || '';
    console.log("ComboboxField - Value changed:", selectedValue, "for field:", name);
    onChange(selectedValue);
  };

  const inputHeight = size === 'sm' ? '32px' : size === 'md' ? '40px' : '48px';

  return (
    <Field label={label} invalid={isInValid} readOnly={readOnly} errorText={errorMessage} required={required}>
      <Combobox.Root
          collection={collection && collection}
          onValueChange={handleValueChange}
          onInputValueChange={handleInputValueChange}
          disabled={disabled}
          readOnly={readOnly}
          name={name}
          openOnClick
          value={normalizedValue ? [normalizedValue] : []}
          inputValue={matchingOption ? matchingOption.label : normalizedValue}
        >
        <Combobox.Control>
          <Combobox.Input
            placeholder={placeholder}
            h={inputHeight}
            borderColor={isInValid ? 'red.500' : lighten(0.3, GRAY_COLOR)}
            borderRadius={'md'}
            onKeyDown={handleKeyDown}
            autoComplete="autocomplete" // for removing suggestion popup
            _hover={{
              borderColor: isInValid ? 'red.600' : lighten(0.2, GRAY_COLOR)
            }}
            _focus={{
              borderColor: isInValid ? 'red.500' : 'blue.500',
              boxShadow: isInValid ? '0 0 0 1px red.500' : '0 0 0 1px blue.500'
            }}
          />
          <Combobox.IndicatorGroup>
            {showClearTrigger && <Combobox.ClearTrigger />}
            <Combobox.Trigger />
          </Combobox.IndicatorGroup>
        </Combobox.Control>

        <Portal>
          <Combobox.Positioner>
            <Combobox.Content
              borderRadius="md"
              maxH="200px"
              overflowY="auto"
              data-testid="combobox-options"
            >
              <Combobox.Empty>No items found</Combobox.Empty>
              {collection.items.map((item, index) => (
                <Combobox.Item 
                  item={item} 
                  key={index}
                >
                  {item.label}
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Positioner>
        </Portal>
      </Combobox.Root>
    </Field>
  )
}

export default ComboboxField