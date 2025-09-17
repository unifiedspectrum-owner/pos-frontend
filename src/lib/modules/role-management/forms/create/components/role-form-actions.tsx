/* Libraries imports */
import React from 'react'
import { Flex, HStack } from '@chakra-ui/react'
import { MdOutlineArrowBack, MdOutlineArrowForward } from 'react-icons/md'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements'

/* Role module imports */
import { RoleFormTabType, ROLE_FORM_TABS } from '@role-management/constants'

/* Role form actions component props */
interface RoleFormActionsProps {
  onCancel: () => void
  onNext?: () => void
  onPrevious?: () => void
  currentTab: RoleFormTabType
  loading?: boolean
  submitText?: string
  loadingText?: string
}

/* Action buttons for role forms */
const RoleFormActions: React.FC<RoleFormActionsProps> = ({
  onCancel,
  onNext,
  onPrevious,
  currentTab,
  loading = false,
  submitText = "Create Role",
  loadingText = "Creating Role..."
}) => {

  /* Determine tab position internally */
  const isFirstTab = currentTab === ROLE_FORM_TABS[0].id
  const isLastTab = currentTab === ROLE_FORM_TABS[ROLE_FORM_TABS.length - 1].id

  /* Generate button text based on current state */
  const getButtonText = () => {
    if (isLastTab) {
      return loading ? loadingText : submitText
    }
    return "Next"
  }

  /* Generate button icon based on current state */
  const getButtonIcon = () => {
    if (isLastTab) {
      return undefined /* No icon for submit button */
    }
    return MdOutlineArrowForward /* Forward arrow for next */
  }

  return (
    <Flex justify={isFirstTab ? "space-between" : "space-between"} w="full">
      <HStack gap={3}>
        <SecondaryButton
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </SecondaryButton>
      </HStack>

      <HStack gap={3}>
        {/* Previous button - only show if not first tab */}
        {!isFirstTab && (
          <SecondaryButton
            onClick={onPrevious}
            leftIcon={MdOutlineArrowBack}
            disabled={loading}
          >
            Previous
          </SecondaryButton>
        )}

        {/* Next/Submit button */}
        <PrimaryButton
          onClick={onNext}
          rightIcon={getButtonIcon()}
          loading={loading}
          disabled={loading}
          type={isLastTab ? "submit" : "button"}
        >
          {getButtonText()}
        </PrimaryButton>
      </HStack>
    </Flex>
  )
}

export default RoleFormActions