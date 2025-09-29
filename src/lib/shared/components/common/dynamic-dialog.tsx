/* React and Chakra UI imports */
import React, { ReactNode } from 'react'
import { Dialog, Portal, Flex, Icon } from '@chakra-ui/react'
import { FiX } from 'react-icons/fi'

/* Component props interface */
interface DynamicDialogProps {
  isOpen: boolean /* Dialog visibility state */
  onClose: () => void /* Close dialog handler */
  title: string /* Dialog title */
  titleIcon?: ReactNode /* Optional icon for title */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' /* Dialog size */
  maxWidth?: string /* Custom max width */
  children: ReactNode /* Dynamic body content */
  showCloseButton?: boolean /* Show close button in header */
  closeOnOutsideClick?: boolean /* Allow closing on outside click */
}

/* Reusable dialog component with dynamic content */
const DynamicDialog: React.FC<DynamicDialogProps> = ({
  isOpen,
  onClose,
  title,
  titleIcon,
  size = 'lg',
  maxWidth,
  children,
  showCloseButton = true,
  closeOnOutsideClick = true
}) => {
  return (
    <Dialog.Root
      open={isOpen}
      size={size}
      placement="center"
      onOpenChange={(details) => {
        if (!details.open && closeOnOutsideClick) {
          onClose()
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop
          bg="blackAlpha.600"
          backdropFilter="blur(8px)"
        >
          <Dialog.Positioner>
            <Dialog.Content p={0} maxW={maxWidth}>
              {/* Dialog header with title and optional close button */}
              <Dialog.Header p={5} pb={3}>
                <Flex justify="space-between" align="center" w="full">
                  <Flex gap={3} align="center">
                    {titleIcon && (
                      <Icon asChild>
                        {titleIcon}
                      </Icon>
                    )}
                    <Dialog.Title fontSize="md" fontWeight="600" color="gray.900">
                      {title}
                    </Dialog.Title>
                  </Flex>
                  {showCloseButton && (
                    <Flex align="center" justify="center">
                      <Dialog.Trigger asChild>
                        <Icon
                          as={FiX}
                          boxSize={5}
                          color="gray.400"
                          cursor="pointer"
                          _hover={{ color: "gray.600" }}
                          onClick={onClose}
                        />
                      </Dialog.Trigger>
                    </Flex>
                  )}
                </Flex>
              </Dialog.Header>

              {/* Dynamic body content */}
              <Dialog.Body p={5} pt={0}>
                {children}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Backdrop>
      </Portal>
    </Dialog.Root>
  )
}

export default DynamicDialog