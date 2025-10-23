"use client"

/* React and Chakra UI imports */
import React, { useState, useEffect } from 'react'
import { Dialog, Portal, VStack, HStack, Text, Icon, SimpleGrid, GridItem, Flex } from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

/* Icon imports */
import { MdCheck } from 'react-icons/md'
import { FiX } from 'react-icons/fi'

/* Shared module imports */
import { PrimaryButton, SecondaryButton, TextAreaField, TextInputField } from '@shared/components'

/* Tenant module imports */
import { activateTenantAccountSchema, ActivateTenantFormData } from '@tenant-management/schemas/account/suspension'
import { ActivateTenantApiRequest } from '@tenant-management/types'
import { useTenantSuspension } from '@tenant-management/hooks'
import { TENANT_ACTIVATION_QUESTIONS } from '@tenant-management/constants'

/* Modal component props interface */
interface TenantActivationModalProps {
  isOpen: boolean /* Modal visibility state */
  onClose: () => void /* Close modal handler */
  onSuccess?: () => void /* Success callback handler */
  tenantId: string /* Target tenant ID */
  tenantName: string /* Tenant organization name */
}

/* Modal component for activating tenant accounts */
const TenantActivationModal: React.FC<TenantActivationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tenantId,
  tenantName
}) => {
  /* Confirmation text state management */
  const [confirmationText, setConfirmationText] = useState<string>('')
  const [isConfirmationInvalid, setIsConfirmationInvalid] = useState<boolean>(false)

  /* Tenant activation hook with success callback */
  const { activateTenant, isActivating } = useTenantSuspension({
    onSuccess: () => {
      handleClose()
      onSuccess?.()
    }
  })

  /* Reset validation error on text change */
  useEffect(() => {
    setIsConfirmationInvalid(false)
  }, [confirmationText, tenantId])

  /* Reset form state when modal opens */
  useEffect(() => {
    if (isOpen) {
      setConfirmationText('')
      setIsConfirmationInvalid(false)
    }
  }, [isOpen])

  /* Form configuration with validation schema */
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ActivateTenantFormData>({
    resolver: zodResolver(activateTenantAccountSchema),
    defaultValues: {
      reason: ''
    },
    mode: 'onChange'
  })

  /* Close modal and reset form state */
  const handleClose = () => {
    reset()
    setConfirmationText('')
    setIsConfirmationInvalid(false)
    onClose()
  }

  /* Form submission with confirmation validation */
  const onSubmit = async (data: ActivateTenantFormData) => {
    /* Validate confirmation text matches tenant ID */
    if (confirmationText !== tenantId) {
      console.log('[TenantActivationModal] Validation failed: Confirmation text does not match tenant ID')
      setIsConfirmationInvalid(true)
      return
    }

    /* Prepare activation API request payload */
    const requestData: ActivateTenantApiRequest = {
      reason: data.reason.trim()
    }

    /* Execute tenant activation */
    await activateTenant(requestData, tenantId)
  }

  return (
    <Dialog.Root 
      open={isOpen} 
      size="lg" 
      placement="center"
      closeOnInteractOutside={false}
      onOpenChange={(details) => { 
        /* Prevent modal close during activation process */
        if (!details.open && !isActivating) {
          handleClose();
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
                  <Flex gap={3} align="center" >
                    <Icon asChild color="green.500">
                      <MdCheck size={20} />
                    </Icon>
                    <Dialog.Title fontSize="md" fontWeight="600" color="gray.900">
                      Activate Account
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
                        onClick={handleClose}
                      />
                    </Dialog.Trigger>
                  </Flex>
                </Flex>
              </Dialog.Header>

              {/* Dialog body with form */}
              <Dialog.Body p={5} pt={0}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack align="stretch" gap={4}>
                    {/* Organization info with confirmation */}
                    <VStack align="stretch" gap={2} p={4} bg="green.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="green.500">
                      <HStack justify="space-between" align="start">
                        <VStack align="start" gap={1}>
                          <Text fontSize="sm" fontWeight="600" color="green.700">
                            Activating Account
                          </Text>
                          <Text fontSize="md" fontWeight="bold" color="gray.900">
                            {tenantName}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            ID: {tenantId}
                          </Text>
                        </VStack>
                        <Icon as={MdCheck} color="green.500" boxSize={4} />
                      </HStack>
                      <Text fontSize="xs" color="green.600">
                        This will restore full access to all services.
                      </Text>
                    </VStack>

                    {/* Dynamic form fields */}
                    <SimpleGrid columns={1} gap={4}>
                      {TENANT_ACTIVATION_QUESTIONS.filter(que => que.is_active)
                        .sort((a, b) => a.display_order - b.display_order).map((que) => {
                          const schemaKey = que.schema_key as keyof ActivateTenantFormData
                          const fieldError = errors[schemaKey]
                          
                          /* Standard form field properties */
                          const commonProps = {
                            name: schemaKey,
                            label: que.label,
                            placeholder: que.placeholder,
                            isInValid: !!fieldError,
                            required: que.is_required,
                            errorMessage: fieldError?.message,
                            disabled: isActivating,
                          }

                          switch(que.type) {
                            case "TEXTAREA":
                              return (
                                <GridItem key={que.id} colSpan={que.grid.col_span}>
                                  <Controller
                                    name={schemaKey}
                                    control={control}
                                    render={({ field }) => (
                                      <TextAreaField
                                        {...commonProps}
                                        value={field.value?.toString() || ''}
                                        onChange={field.onChange}
                                        helperText='This reason will be included in the notification sent to the tenant.'
                                        inputProps={{
                                          rows: 2,
                                          maxLength: 500
                                        }}
                                      />
                                    )}
                                  />
                                </GridItem>
                              )

                            default:
                              return null;
                          }
                        })
                      }
                      <TextInputField
                        label={`Type in \`${tenantId}\` to confirm`}
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder={tenantId}
                        errorMessage={`Type in \`${tenantId}\` to confirm`}
                        isInValid={isConfirmationInvalid}
                        required={true}
                        disabled={isActivating}
                        inputProps={{
                          fontSize: "sm"
                        }}
                      />
                    </SimpleGrid>
                  </VStack>
                </form>
              </Dialog.Body>

              {/* Dialog footer with action buttons */}
              <Dialog.Footer p={5} pt={3} bg="gray.50" borderTop="1px solid" borderBottomRadius={5} borderColor="gray.200">
                <HStack gap={3} w="full" justify="flex-end">
                  <SecondaryButton
                    onClick={handleClose}
                    disabled={isActivating}
                    size="sm"
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleSubmit(onSubmit)}
                    disabled={isActivating}
                    loading={isActivating}
                    size="sm"
                    bg="green.500"
                    buttonProps={{
                      _hover:{ bg: "green.600" },
                      _active:{ bg: "green.700" }
                    }}
                  >
                    {isActivating ? 'Activating...' : 'Activate'}
                  </PrimaryButton>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Backdrop>
      </Portal>
    </Dialog.Root>
  )
}

export default TenantActivationModal