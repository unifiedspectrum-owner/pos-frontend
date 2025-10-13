/* Libraries imports */
import React from 'react'
import { Flex } from '@chakra-ui/react'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements/buttons'

/* Component props interface */
interface NavigationButtonsProps {
  onCancel: () => void
  onSubmit: () => void
  loading: boolean
  disabled?: boolean
  submitText?: string
  loadingText?: string
}

/* Navigation and action buttons for ticket forms */
const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onCancel,
  onSubmit,
  loading,
  disabled = false,
  submitText = "Create Ticket",
  loadingText = "Creating Ticket..."
}) => {
  return (
    <Flex justify="space-between" mt={4}>
      <SecondaryButton
        onClick={onCancel}
        disabled={loading || disabled}
      />

      <PrimaryButton
        onClick={onSubmit}
        loading={loading}
        disabled={loading || disabled}
        loadingText={loadingText}
        buttonText={submitText}
      />
    </Flex>
  )
}

export default NavigationButtons
