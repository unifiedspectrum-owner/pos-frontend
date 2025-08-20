'use client';

import React from 'react';
import { Dialog, Icon, Portal, Text, HStack } from '@chakra-ui/react';
import { FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements';

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
  onCancel
}) => {
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
                <Text fontSize="sm" color="fg.muted">
                  {message}
                </Text>
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
                      onClick={onConfirm}
                      size="md"
                      bg="red.500" /* Danger styling */
                      leftIcon={FiAlertTriangle}
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      {confirmText}
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton
                      onClick={onConfirm}
                      size="md"
                      leftIcon={FiCheck} /* Success icon */
                      loading={isLoading}
                      disabled={isLoading}
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