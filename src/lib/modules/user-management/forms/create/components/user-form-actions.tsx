/* Libraries imports */
import React from 'react'
import { Flex } from '@chakra-ui/react'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements/buttons'

/* Component props interface */
interface UserFormActionsProps {
  onCancel: () => void
  onSubmit: () => void
  loading: boolean
  disabled?: boolean
  submitText: string
  loadingText: string
}

/* Shared actions component for user forms */
const UserFormActions: React.FC<UserFormActionsProps> = ({
  onCancel,
  onSubmit,
  loading,
  disabled = false,
  submitText,
  loadingText
}) => {
  return (
    <Flex justify="space-between" mt={4}>
      <SecondaryButton
        onClick={onCancel}
        disabled={loading || disabled}
      >
        Cancel
      </SecondaryButton>

      <PrimaryButton
        onClick={onSubmit}
        loading={loading}
        disabled={loading || disabled}
      >
        {loading ? loadingText : submitText}
      </PrimaryButton>
    </Flex>
  )
}

export default UserFormActions