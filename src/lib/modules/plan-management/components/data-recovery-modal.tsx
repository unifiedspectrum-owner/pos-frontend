'use client';

import React from 'react';
import { Dialog, Icon, Portal, Text, HStack } from '@chakra-ui/react';
import { FiRefreshCw, FiX } from 'react-icons/fi';
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements';
import { PRIMARY_COLOR } from '@shared/config';

/* Props interface for data recovery modal */
interface DataRecoveryModelProps {
  isOpen: boolean; /* Whether modal is visible */
  onRestore: () => void; /* Handler for restoring saved data */
  onStartFresh: () => void; /* Handler for starting with fresh form */
}

/* Modal for choosing between restoring saved data or starting fresh */
const DataRecoveryModal: React.FC<DataRecoveryModelProps> = ({
  isOpen,
  onRestore,
  onStartFresh
}) => {

  return (
    <Dialog.Root 
      open={isOpen}
      size="sm" 
      placement="center"
      onOpenChange={(details) => { 
        if (!details.open) {
          onStartFresh();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop 
          bg="blackAlpha.600"
          backdropFilter="blur(8px)"
        >
          <Dialog.Positioner>
            <Dialog.Content p={3} >
              {/* Modal header with icon and title */}
              <Dialog.Header p={3}>
                <HStack gap={3} align="center">
                  <Icon asChild color={PRIMARY_COLOR}>
                    <FiRefreshCw size={24} />
                  </Icon>
                  <Dialog.Title fontSize="lg" fontWeight="medium">
                    Restore Previous Data?
                  </Dialog.Title>
                </HStack>
              </Dialog.Header>

              {/* Modal body with explanation text */}
              <Dialog.Body p={3}>
                <Text fontSize="sm" color="fg.muted">
                  We found previously saved form data. Would you like to restore your previous progress or start with a fresh form?
                </Text>
              </Dialog.Body>

              {/* Modal footer with action buttons */}
              <Dialog.Footer p={3}>
                <HStack gap={3}>
                  {/* Secondary action - start fresh */}
                  <SecondaryButton
                    onClick={onStartFresh}
                    leftIcon={FiX}
                    size="md"
                  >
                    Start Fresh
                  </SecondaryButton>
                  
                  {/* Primary action - restore data */}
                  <PrimaryButton
                    onClick={onRestore}
                    leftIcon={FiRefreshCw}
                    size="md"
                  >
                    Restore Data
                  </PrimaryButton>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Backdrop>
      </Portal>
    </Dialog.Root>
  );
};

export default DataRecoveryModal;