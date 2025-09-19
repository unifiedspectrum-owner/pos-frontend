/* Libraries imports */
import React from 'react'
import { Flex, HStack } from '@chakra-ui/react'
import { MdAdd, MdCancel } from 'react-icons/md'
import { useRouter, useParams } from 'next/navigation'
import { FaRegEdit } from 'react-icons/fa'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements'

/* Role module imports */
import { ROLE_PAGE_ROUTES } from '@role-management/constants'
import { useFormMode } from '@role-management/contexts'

/* Navigation buttons component props */
interface NavigationButtonsProps {
  onCancel: () => void
  onSubmit?: () => void
  loading?: boolean
}

/* Navigation and action buttons for role forms */
const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const { isViewMode, isCreateMode } = useFormMode() /* Get form mode from context */
  const router = useRouter() /* Next.js router for navigation */
  const params = useParams() /* Get URL parameters */

  /* Handle submit or edit navigation */
  const handlePrimaryAction = () => {
    if (isViewMode) {
      /* Navigate to edit page using router and roleId from params */
      const roleId = params.roleId as string
      const editPath = ROLE_PAGE_ROUTES.EDIT.replace(':id', roleId)
      router.push(editPath)
    } else {
      onSubmit?.()
    }
  }

  /* Generate button text based on current mode */
  const getButtonText = () => {
    if (isViewMode) {
      return "Edit Role"
    }
    if (loading) {
      return isCreateMode ? "Creating Role..." : "Updating Role..."
    }
    return isCreateMode ? "Create Role" : "Update Role"
  }

  /* Generate button icon based on current mode */
  const getButtonIcon = () => {
    if (isViewMode) {
      return FaRegEdit /* Edit icon for view mode edit button */
    }
    return isCreateMode ? MdAdd : FaRegEdit /* Add icon for create, edit icon for update */
  }

  return (
    <Flex justify="space-between" w="full">
      <HStack gap={3}>
        <SecondaryButton
          onClick={onCancel}
          disabled={loading && !isViewMode}
          leftIcon={MdCancel}
        >
          {isViewMode ? "Back to Roles" : "Cancel"}
        </SecondaryButton>
      </HStack>

      <HStack gap={3}>
        {/* Submit/Edit button */}
        <PrimaryButton
          onClick={handlePrimaryAction}
          leftIcon={getButtonIcon()}
          loading={loading && !isViewMode}
          disabled={loading && !isViewMode}
          type={!isViewMode ? "submit" : "button"}
        >
          {getButtonText()}
        </PrimaryButton>
      </HStack>
    </Flex>
  )
}

export default NavigationButtons