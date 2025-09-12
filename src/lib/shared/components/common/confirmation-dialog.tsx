'use client';

/* React and Chakra UI component imports */
import React, { useState, useEffect } from 'react';
import { Dialog, Icon, Portal, Text, HStack, VStack } from '@chakra-ui/react';
import { FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';

/* Shared module imports */
import { PrimaryButton, SecondaryButton, TextInputField } from '@shared/components/form-elements';

/* Props interface for confirmation dialog */
interface ConfirmationDialogProps {
  isOpen: boolean; /* Dialog visibility state */
  title: string; /* Dialog title text */
  message: string; /* Dialog message content */
  confirmText?: string; /* Custom confirm button text */
  cancelText?: string; /* Custom cancel button text */
  confirmVariant?: 'danger' | 'primary'; /* Button variant style */
  isLoading?: boolean; /* Loading state for confirm button */
  onConfirm: () => void; /* Confirm action handler */
  onCancel: () => void; /* Cancel action handler */
  confirmationText?: string; /* Optional text that user must type to confirm */
  confirmationLabel?: string; /* Label for the confirmation text field */
}

/* Confirmation dialog component with customizable buttons */
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm', /* Default confirm button text */
  cancelText = 'Cancel', /* Default cancel button text */
  confirmVariant = 'primary', /* Default button variant */
  isLoading = false, /* Default loading state */
  onConfirm,
  onCancel,
  confirmationText, /* Optional confirmation text */
}) => {
  /* State for confirmation text input */
  const [inputValue, setInputValue] = useState<string>('')
  const [isConfirmDisabled, setIsConfirmDisabled] = useState<boolean>(false)
  const [isInvalid, setIsInvalid] = useState<boolean>(false)
  
  /* Reset input when dialog opens/closes */
  useEffect(() => {
    if (isOpen) {
      setInputValue('')
      setIsConfirmDisabled(!!confirmationText) /* Disable if confirmation text is required */
    }
  }, [isOpen, confirmationText])
  
  /* Update confirm button state based on input */
  useEffect(() => {
    if (confirmationText) {
      setIsConfirmDisabled(inputValue !== confirmationText)
    }
  }, [inputValue, confirmationText])

  /* Enhanced onConfirm handler with validation to prevent dev tools bypass */
  const handleConfirm = () => {
    /* If confirmation text is required, validate it before proceeding */
    if (confirmationText && inputValue !== confirmationText) {
      console.warn('[ConfirmationDialog] Validation failed: Input does not match required confirmation text')
      setIsInvalid(true)
      return /* Block execution if validation fails */
    }
    
    /* If no confirmation text required or validation passes, proceed */
    onConfirm()
  }

  return (
    <Dialog.Root 
      open={isOpen} 
      size="sm" 
      placement="center"
      onOpenChange={(details) => { 
        /* Handle dialog close on backdrop click */
        if (!details.open) {
          onCancel();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop 
          bg="blackAlpha.600" 
          backdropFilter="blur(8px)" /* Blur background effect */
        >
          <Dialog.Positioner>
            <Dialog.Content p={3}>
              {/* Dialog header with icon and title */}
              <Dialog.Header p={3}>
                <HStack gap={3} align="center">
                  <Icon 
                    asChild 
                    color={confirmVariant === 'danger' ? 'red.500' : 'blue.500'} /* Dynamic icon color */
                  >
                    <FiAlertTriangle size={24} />
                  </Icon>
                  <Dialog.Title fontSize="lg" fontWeight="medium">
                    {title}
                  </Dialog.Title>
                </HStack>
              </Dialog.Header>

              {/* Dialog message content */}
              <Dialog.Body p={3}>
                <VStack align="start" gap={3}>
                  <Text fontSize="sm" color="fg.muted">
                    {message}
                  </Text>
                  
                  {/* Optional confirmation text input */}
                  {confirmationText && (
                    <TextInputField
                      label={`Type in \`${confirmationText}\` to confirm`}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={confirmationText}
                      errorMessage={`Type in \`${confirmationText}\` to confirm`}
                      isInValid={isInvalid}
                      required={true}
                      disabled={isLoading}
                      inputProps={{
                        fontSize: "sm"
                      }}
                    />
                  )}
                </VStack>
              </Dialog.Body>

              {/* Dialog action buttons */}
              <Dialog.Footer p={3}>
                <HStack gap={3}>
                  {/* Cancel button */}
                  <SecondaryButton
                    onClick={onCancel}
                    leftIcon={FiX}
                    size="md"
                  >
                    {cancelText}
                  </SecondaryButton>
                  
                  {/* Conditional confirm button based on variant */}
                  {confirmVariant === 'danger' ? (
                    <PrimaryButton
                      onClick={handleConfirm}
                      size="md"
                      bg="red.500" /* Danger styling */
                      leftIcon={FiAlertTriangle}
                      loading={isLoading}
                      disabled={isLoading || isConfirmDisabled}
                    >
                      {confirmText}
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton
                      onClick={handleConfirm}
                      size="md"
                      leftIcon={FiCheck} /* Success icon */
                      loading={isLoading}
                      disabled={isLoading || isConfirmDisabled}
                    >
                      {confirmText}
                    </PrimaryButton>
                  )}
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Backdrop>
      </Portal>
    </Dialog.Root>
  );
};

export default ConfirmationDialog;