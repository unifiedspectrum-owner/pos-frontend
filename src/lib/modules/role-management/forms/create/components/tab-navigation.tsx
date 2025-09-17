/* Libraries imports */
import React from 'react'
import { HStack } from '@chakra-ui/react'
import { MdOutlineArrowBack, MdOutlineArrowForward } from 'react-icons/md'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements'

/* Props interface for tab navigation component */
interface TabNavigationProps {
  onPrevious?: () => void /* Handler for previous tab navigation */
  onNext?: () => void /* Handler for next tab navigation */
  onSubmit?: () => void /* Handler for form submission */
  isFirstTab?: boolean /* Whether this is the first tab */
  isLastTab?: boolean /* Whether this is the last tab */
  isSubmitting?: boolean /* Whether form is currently submitting */
  isFormValid?: boolean /* Whether form data is valid */
  nextButtonText?: string /* Custom text for next button */
  submitButtonText?: string /* Custom text for submit button */
}

/* Navigation component for role management tabs */
const TabNavigation: React.FC<TabNavigationProps> = ({
  onPrevious,
  onNext,
  onSubmit,
  isFirstTab = false,
  isLastTab = false,
  isSubmitting = false,
  isFormValid = false,
  nextButtonText = "Next",
  submitButtonText = "Create Role"
}) => {
  /* Handle next/submit button click based on current state */
  const handleNextOrSubmit = () => {
    if (isLastTab && isFormValid && onSubmit) {
      onSubmit() /* Submit form on valid last tab */
    } else if (onNext) {
      onNext() /* Navigate to next tab */
    }
  }

  /* Generate button text based on current state */
  const getButtonText = () => {
    if (isLastTab && isFormValid) {
      return isSubmitting ? 'Creating Role...' : submitButtonText
    }
    return nextButtonText
  }

  /* Generate button icon based on current state */
  const getButtonIcon = () => {
    if (isLastTab && isFormValid) {
      return undefined /* No icon for submit button */
    }
    return MdOutlineArrowForward /* Forward arrow for next */
  }

  return (
    <HStack justify={isFirstTab ? "flex-end" : "space-between"} mt={6}>
      {/* Previous button - only show if not first tab */}
      {!isFirstTab && (
        <SecondaryButton onClick={onPrevious} leftIcon={MdOutlineArrowBack}>
          Previous
        </SecondaryButton>
      )}

      {/* Next/Submit button */}
      <PrimaryButton
        onClick={handleNextOrSubmit}
        rightIcon={getButtonIcon()}
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {getButtonText()}
      </PrimaryButton>
    </HStack>
  )
}

export default TabNavigation