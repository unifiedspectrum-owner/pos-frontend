"use client"

/* React and Chakra UI imports */
import React, { useState, useEffect } from 'react'
import { Dialog, Portal, VStack, HStack, Text, Icon, SimpleGrid, GridItem, Flex } from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

/* Icon imports */
import { MdBlock } from 'react-icons/md'
import { FiX } from 'react-icons/fi'

/* Shared module imports */
import { PrimaryButton, SecondaryButton, DateField, TextAreaField, TextInputField } from '@shared/components'

/* Tenant module imports */
import { suspendTenantAccountSchema, SuspendTenantFormData } from '@tenant-management/schemas/account/suspension'
import { SuspendTenantApiRequest } from '@tenant-management/types/account/suspension'
import { useTenantSuspension } from '@tenant-management/hooks'
import { TENANT_SUSPENSION_QUESTIONS } from '@tenant-management/constants'
import { getCurrentISOString } from "@shared/utils";

/* Modal component props interface */
interface TenantSuspensionModalProps {
  isOpen: boolean /* Modal visibility state */
  onClose: () => void /* Close modal handler */
  onSuccess?: () => void /* Success callback handler */
  tenantId: string /* Target tenant ID */
  tenantName: string /* Tenant organization name */
}

/* Modal component for suspending tenant accounts */
const TenantSuspensionModal: React.FC<TenantSuspensionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tenantId,
  tenantName
}) => {
  /* Confirmation text state management */
  const [confirmationText, setConfirmationText] = useState<string>('')
  const [isConfirmationInvalid, setIsConfirmationInvalid] = useState<boolean>(false)

  /* Tenant suspension hook with success callback */
  const { suspendTenant, isSuspending } = useTenantSuspension({
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
  const { control, handleSubmit, reset, formState: { errors } } = useForm<SuspendTenantFormData>({
    resolver: zodResolver(suspendTenantAccountSchema),
    defaultValues: {
      tenant_id: tenantId,
      reason: '',
      suspend_until: null
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
  const onSubmit = async (data: SuspendTenantFormData) => {
    /* Validate confirmation text matches tenant ID */
    if (confirmationText !== tenantId) {
      console.log('[TenantSuspensionModal] Validation failed: Confirmation text does not match tenant ID')
      setIsConfirmationInvalid(true)
      return
    }

    /* Prepare suspension API request payload */
    const requestData: SuspendTenantApiRequest = {
      tenant_id: data.tenant_id,
      reason: data.reason.trim(),
      suspend_until: data.suspend_until || null
    }

    /* Execute tenant suspension */
    await suspendTenant(requestData)
  }

  return (
    <Dialog.Root 
      open={isOpen} 
      size="lg" 
      placement="center"
      closeOnInteractOutside={false}
      onOpenChange={(details) => { 
        /* Prevent modal close during suspension process */
        if (!details.open && !isSuspending) {
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
                    <Icon asChild color="red.500">
                      <MdBlock size={20} />
                    </Icon>
                    <Dialog.Title fontSize="md" fontWeight="600" color="gray.900">
                      Suspend Account
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
                    {/* Organization info with warning */}
                    <VStack align="stretch" gap={2} p={4} bg="red.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="red.500">
                      <HStack justify="space-between" align="start">
                        <VStack align="start" gap={1}>
                          <Text fontSize="sm" fontWeight="600" color="red.700">
                            Suspending Account
                          </Text>
                          <Text fontSize="md" fontWeight="bold" color="gray.900">
                            {tenantName}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            ID: {tenantId}
                          </Text>
                        </VStack>
                        <Icon as={MdBlock} color="red.500" boxSize={4} />
                      </HStack>
                      <Text fontSize="xs" color="red.600">
                        This will suspend access to all services immediately.
                      </Text>
                    </VStack>

                    {/* Dynamic form fields */}
                    <SimpleGrid columns={1} gap={4}>
                      {TENANT_SUSPENSION_QUESTIONS.filter(que => que.is_active)
                        .sort((a, b) => a.display_order - b.display_order).map((que) => {
                          const schemaKey = que.schema_key as keyof SuspendTenantFormData
                          const fieldError = errors[schemaKey]
                          
                          /* Standard form field properties */
                          const commonProps = {
                            name: schemaKey,
                            label: que.label,
                            placeholder: que.placeholder,
                            isInValid: !!fieldError,
                            required: que.is_required,
                            errorMessage: fieldError?.message,
                            disabled: isSuspending,
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
                            case "DATE": 
                              return (
                                <GridItem key={que.id} colSpan={que.grid.col_span}>
                                  <Controller
                                    name={schemaKey}
                                    control={control}
                                    render={({ field }) => (
                                      <DateField
                                        {...commonProps}
                                        value={field.value}
                                        onChange={field.onChange}
                                        min={getCurrentISOString().split('T')[0]}
                                        helperText={que.schema_key === 'suspend_until' ? 
                                          "If left empty, the suspension will remain active until manually reactivated." : 
                                          undefined
                                        }
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
                        disabled={isSuspending}
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
                    disabled={isSuspending}
                    size="sm"
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSuspending}
                    loading={isSuspending}
                    size="sm"
                  >
                    {isSuspending ? 'Suspending...' : 'Suspend'}
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

export default TenantSuspensionModal