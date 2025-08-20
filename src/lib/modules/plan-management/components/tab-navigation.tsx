import React from 'react';
import { HStack } from '@chakra-ui/react';
import { MdOutlineArrowBack, MdOutlineArrowForward, MdList } from 'react-icons/md';
import { FiEdit } from 'react-icons/fi';
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements';

/* Props interface for tab navigation component */
interface TabNavigationProps {
  onPrevious?: () => void; /* Handler for previous tab navigation */
  onNext?: () => void; /* Handler for next tab navigation */
  onSubmit?: () => void; /* Handler for form submission */
  onEdit?: () => void; /* Handler for entering edit mode */
  onBackToList?: () => void; /* Handler for returning to list view */
  isFirstTab?: boolean; /* Whether this is the first tab */
  isLastTab?: boolean; /* Whether this is the last tab */
  isSubmitting?: boolean; /* Whether form is currently submitting */
  isFormValid?: boolean; /* Whether form data is valid */
  nextButtonText?: string; /* Custom text for next button */
  submitButtonText?: string; /* Custom text for submit button */
  readOnly?: boolean; /* Whether in read-only mode */
}

/* Navigation component for multi-step tab interfaces */
const TabNavigation: React.FC<TabNavigationProps> = ({
  onPrevious,
  onNext,
  onSubmit,
  onEdit,
  onBackToList,
  isFirstTab = false, /* Default to not first tab */
  isLastTab = false, /* Default to not last tab */
  isSubmitting = false, /* Default to not submitting */
  isFormValid = false, /* Default to form invalid */
  nextButtonText = "Next", /* Default next button text */
  submitButtonText = "Create Plan", /* Default submit button text */
  readOnly = false, /* Default to editable mode */
}) => {
  /* Handle next/submit button click based on current state */
  const handleNextOrSubmit = () => {
    if (readOnly && isLastTab && onEdit) {
      onEdit(); /* Switch to edit mode in read-only last tab */
    } else if (isLastTab && isFormValid && onSubmit && !readOnly) {
      onSubmit(); /* Submit form on valid last tab */
    } else if (onNext) {
      onNext(); /* Navigate to next tab */
    }
  };

  /* Generate button text based on current state */
  const getButtonText = () => {
    if (readOnly) {
      return isLastTab ? "Edit Plan" : nextButtonText; /* Edit or next in read-only */
    }
    if (isLastTab && isFormValid) {
      return isSubmitting ? 'Creating Plan...' : submitButtonText; /* Submit or loading text */
    }
    return nextButtonText; /* Default next text */
  };

  /* Generate button icon based on current state */
  const getButtonIcon = () => {
    if (readOnly && isLastTab) {
      return FiEdit; /* Edit icon for edit button */
    }
    if (isLastTab && isFormValid && !readOnly) {
      return undefined; /* No icon for submit button */
    }
    return MdOutlineArrowForward; /* Forward arrow for next */
  };

  return (
    <HStack justify={isFirstTab ? "flex-end" : "space-between"} mt={6}>
      {/* Previous button - only show if not first tab */}
      {!isFirstTab && (
        <SecondaryButton onClick={onPrevious} leftIcon={MdOutlineArrowBack}>
          Previous
        </SecondaryButton>
      )}
      
      {/* Right side action buttons */}
      <HStack gap={3}>
        {/* Back to list button - only in read-only mode on last tab */}
        {readOnly && isLastTab && onBackToList && (
          <SecondaryButton onClick={onBackToList} leftIcon={MdList}>
            Back to List
          </SecondaryButton>
        )}
        
        {/* Main action button with conditional icon positioning */}
        {readOnly && isLastTab ? (
          <PrimaryButton 
            onClick={handleNextOrSubmit}
            leftIcon={getButtonIcon()} /* Edit icon on left */
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {getButtonText()}
          </PrimaryButton>
        ) : (
          <PrimaryButton 
            onClick={handleNextOrSubmit}
            rightIcon={getButtonIcon()} /* Arrow icon on right */
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {getButtonText()}
          </PrimaryButton>
        )}
      </HStack>
    </HStack>
  );
};

export default TabNavigation;