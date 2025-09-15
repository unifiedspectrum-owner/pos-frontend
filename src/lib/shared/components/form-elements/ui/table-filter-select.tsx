/* Libraries imports */
import React from 'react'
import { Select, Portal, createListCollection } from '@chakra-ui/react'
import { lighten } from 'polished'

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config'

/* Filter option interface */
interface FilterOption {
  readonly value: string
  readonly label: string
}

/* Table filter select props */
interface TableFilterSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: readonly FilterOption[]
  placeholder?: string
  disabled?: boolean
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

/* Reusable table filter select component */
export const TableFilterSelect: React.FC<TableFilterSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "Filter by...",
  disabled = false,
  icon,
  size = "sm",
}) => {
  /* Create collection from options */
  const collection = React.useMemo(() =>
    createListCollection({ items: options }), [options]
  )

  return (
    <Select.Root
      value={[value]}
      onValueChange={(e) => onValueChange(e.value[0])}
      size={size}
      collection={collection}
      disabled={disabled}
    >
      <Select.Control>
        <Select.Trigger
          borderRadius="2xl"
          borderColor={lighten(0.3, GRAY_COLOR)}
          _hover={{ borderColor: lighten(0.2, GRAY_COLOR) }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          pl={3}
          pr={3}
        >
          {icon}
          <Select.ValueText placeholder={placeholder} />
        </Select.Trigger>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content
            borderRadius="2xl"
            p={2}
            gap={1}
            maxH="200px"
            overflowY="auto"
          >
            {collection.items.map((item) => (
              <Select.Item
                key={item.value}
                item={item}
                p={2}
                borderRadius="lg"
                _hover={{ bg: lighten(0.4, GRAY_COLOR) }}
              >
                {item.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  )
}