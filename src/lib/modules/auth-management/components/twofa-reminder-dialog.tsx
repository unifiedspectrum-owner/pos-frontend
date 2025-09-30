"use client"

/* React and Chakra UI imports */
import React from 'react'
import { Dialog, Portal, VStack, HStack, Text, Icon, Flex } from '@chakra-ui/react'
import { useRouter } from '@/i18n/navigation'

/* Icon imports */
import { FiShield, FiX } from 'react-icons/fi'
import { MdArrowForward } from 'react-icons/md'

/* Shared module imports */
import { PrimaryButton, SecondaryButton } from '@shared/components/form-elements'

/* Auth module imports */
import { ADMIN_PAGE_ROUTES } from '@/lib/shared'

/* Component props interface */
interface TwoFAReminderDialogProps {
  isOpen: boolean
  onClose: () => void
}

/* 2FA reminder dialog component */
const TwoFAReminderDialog: React.FC<TwoFAReminderDialogProps> = ({ isOpen, onClose }) => {
  const router = useRouter()

  /* Navigate to profile page */
  const handleGoToProfile = () => {
    onClose()
    router.push(ADMIN_PAGE_ROUTES.PROFILE)
  }

  /* Close and dismiss reminder */
  const handleDismiss = () => {
    onClose()
  }

  return (
    <Dialog.Root
      open={isOpen}
      size="md"
      placement="center"
      closeOnInteractOutside={false}
      onOpenChange={(details) => {
        if (!details.open) {
          handleDismiss()
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop
          bg="blackAlpha.600"
          backdropFilter="blur(8px)"
        >
          <Dialog.Positioner>
            <Dialog.Content p={0} maxW="500px">
              {/* Dialog header */}
              <Dialog.Header p={5} pb={3}>
                <Flex justify="space-between" align="center" w="full">
                  <Flex gap={3} align="center">
                    <Icon asChild color="blue.500">
                      <FiShield size={20} />
                    </Icon>
                    <Dialog.Title fontSize="md" fontWeight="600" color="gray.900">
                      Enable Two-Factor Authentication
                    </Dialog.Title>
                  </Flex>
                  <Flex align="center" justify="center">
                    <Dialog.Trigger asChild>
                      <Icon
                        as={FiX}
                        boxSize={5}
                        color="gray.400"
                        cursor="pointer"
                        _hover={{ color: "gray.600" }}
                        onClick={handleDismiss}
                      />
                    </Dialog.Trigger>
                  </Flex>
                </Flex>
              </Dialog.Header>

              {/* Dialog body */}
              <Dialog.Body p={5} pt={0}>
                <VStack align="stretch" gap={4}>
                  {/* Information section */}
                  <VStack align="stretch" gap={2} p={4} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
                    <HStack justify="space-between" align="start">
                      <VStack align="start" gap={1}>
                        <Text fontSize="sm" fontWeight="600" color="blue.700">
                          Security Enhancement Required
                        </Text>
                        <Text fontSize="sm" color="gray.700">
                          Your account requires two-factor authentication (2FA) for enhanced security.
                        </Text>
                      </VStack>
                      <Icon as={FiShield} color="blue.500" boxSize={4} />
                    </HStack>
                    <Text fontSize="xs" color="blue.600">
                      Enable 2FA from your profile settings to protect your account.
                    </Text>
                  </VStack>

                  <Text fontSize="sm" color="gray.600">
                    You can set this up now or later from the Profile section.
                  </Text>
                </VStack>
              </Dialog.Body>

              {/* Dialog footer with action buttons */}
              <Dialog.Footer p={5} pt={3} bg="gray.50" borderTop="1px solid" borderBottomRadius={5} borderColor="gray.200">
                <HStack gap={3} w="full" justify="flex-end">
                  <SecondaryButton
                    onClick={handleDismiss}
                    size="sm"
                    buttonText={'Remind Me Later'}
                  />
                  <PrimaryButton
                    onClick={handleGoToProfile}
                    size="sm"
                    rightIcon={MdArrowForward}
                    buttonText={'Go to Profile'}
                  />
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Backdrop>
      </Portal>
    </Dialog.Root>
  )
}

export default TwoFAReminderDialog