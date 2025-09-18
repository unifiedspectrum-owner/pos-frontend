/* Libraries imports */
import React from 'react'
import { Flex, HStack } from '@chakra-ui/react'
import { MdOutlineArrowBack, MdOutlineArrowForward, MdAdd, MdCancel } from 'react-icons/md'
import { useRouter, useParams } from 'next/navigation'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements'

/* Role module imports */
import { RoleFormTabType, ROLE_FORM_TABS, ROLE_PAGE_ROUTES } from '@role-management/constants'
import { useFormMode } from './form-mode-context'
import { FaRegEdit } from 'react-icons/fa'

/* Role form actions component props */
interface RoleFormActionsProps {
  onCancel: () => void
  onNext?: () => void
  onPrevious?: () => void
  currentTab: RoleFormTabType
  loading?: boolean
}

/* Action buttons for role forms */
const RoleFormActions: React.FC<RoleFormActionsProps> = ({
  onCancel,
  onNext,
  onPrevious,
  currentTab,
  loading = false
}) => {
  const { isViewMode, isCreateMode } = useFormMode() /* Get form mode from context */
  const router = useRouter() /* Next.js router for navigation */
  const params = useParams() /* Get URL parameters */

  /* Determine tab position internally */
  const isFirstTab = currentTab === ROLE_FORM_TABS[0].id
  const isLastTab = currentTab === ROLE_FORM_TABS[ROLE_FORM_TABS.length - 1].id

  /* Handle edit navigation for view mode */
  const handleNavigation = () => {
    if (isViewMode && isLastTab) {
      /* Navigate to edit page using router and roleId from params */
      const roleId = params.roleId as string
      const editPath = ROLE_PAGE_ROUTES.EDIT.replace(':id', roleId)
      router.push(editPath)
    } else {
      onNext?.()
    }
  }

  /* Generate button text based on current state and mode */
  const getButtonText = () => {
    if (isViewMode && isLastTab) {
      return "Edit Role"
    }
    if (isLastTab && !isViewMode) {
      if (loading) {
        return isCreateMode ? "Creating Role..." : "Updating Role..."
      }
      return isCreateMode ? "Create Role" : "Update Role"
    }
    return "Next"
  }

  /* Generate button icon based on current state */
  const getButtonIcon = () => {
    if (isViewMode && isLastTab) {
      return FaRegEdit /* Edit icon for view mode edit button */
    }
    if (isLastTab && !isViewMode) {
      return isCreateMode ? MdAdd : FaRegEdit /* Add icon for create, edit icon for update */
    }
    return MdOutlineArrowForward /* Forward arrow for next */
  }

  return (
    <Flex justify={isFirstTab ? "space-between" : "space-between"} w="full">
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
        {/* Previous button - only show if not first tab */}
        {!isFirstTab && (
          <SecondaryButton
            onClick={onPrevious}
            leftIcon={MdOutlineArrowBack}
            disabled={loading && !isViewMode}
          >
            Previous
          </SecondaryButton>
        )}

        {/* Next/Submit/Edit button */}
        <PrimaryButton
          onClick={handleNavigation}
          rightIcon={!isLastTab ? getButtonIcon() : undefined}
          leftIcon={isLastTab ? getButtonIcon() : undefined}
          loading={loading && !isViewMode}
          disabled={loading && !isViewMode}
          type={isLastTab && !isViewMode ? "submit" : "button"}
        >
          {getButtonText()}
        </PrimaryButton>
      </HStack>
    </Flex>
  )
}

export default RoleFormActions