/* React and Chakra UI imports */
import React, { useState, useEffect } from 'react'
import { Dialog, Portal, VStack, HStack, Text, Icon, SimpleGrid, GridItem, Flex } from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

/* Icon imports */
import { MdPause } from 'react-icons/md'
import { FiX } from 'react-icons/fi'

/* Shared module imports */
import { PrimaryButton, SecondaryButton, DateField, TextAreaField, TextInputField } from '@shared/components'

/* Tenant module imports */
import { holdTenantAccountSchema, HoldTenantFormData } from '@tenant-management/schemas/account/suspension'
import { HoldTenantApiRequest } from '@tenant-management/types/account/suspension'
import { useTenantSuspension } from '@tenant-management/hooks'
import { TENANT_HOLD_QUESTIONS } from '@tenant-management/constants'

/* Modal component props interface */
interface TenantHoldModalProps {
  isOpen: boolean /* Modal visibility state */
  onClose: () => void /* Close modal handler */
  onSuccess?: () => void /* Success callback handler */
  tenantId: string /* Target tenant ID */
  tenantName: string /* Tenant organization name */
}

/* Modal component for holding tenant accounts */
const TenantHoldModal: React.FC<TenantHoldModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tenantId,
  tenantName
}) => {
  /* Confirmation text state management */
  const [confirmationText, setConfirmationText] = useState<string>('')
  const [isConfirmationInvalid, setIsConfirmationInvalid] = useState<boolean>(false)

  /* Tenant hold hook with success callback */
  const { holdTenant, isHolding } = useTenantSuspension({
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
  const { control, handleSubmit, reset, formState: { errors } } = useForm<HoldTenantFormData>({
    resolver: zodResolver(holdTenantAccountSchema),
    defaultValues: {
      tenant_id: tenantId,
      reason: '',
      hold_until: null
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
  const onSubmit = async (data: HoldTenantFormData) => {
    /* Validate confirmation text matches tenant ID */
    if (confirmationText !== tenantId) {
      console.log('[TenantHoldModal] Validation failed: Confirmation text does not match tenant ID')
      setIsConfirmationInvalid(true)
      return
    }

    /* Prepare hold API request payload */
    const requestData: HoldTenantApiRequest = {
      tenant_id: data.tenant_id,
      reason: data.reason.trim(),
      hold_until: data.hold_until || null
    }

    /* Execute tenant hold */
    await holdTenant(requestData)
  }

  return (
    <Dialog.Root 
      open={isOpen} 
      size="lg" 
      placement="center"
      closeOnInteractOutside={false}
      onOpenChange={(details) => { 
        /* Prevent modal close during hold process */
        if (!details.open && !isHolding) {
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
                    <Icon asChild color="orange.500">
                      <MdPause size={20} />
                    </Icon>
                    <Dialog.Title fontSize="md" fontWeight="600" color="gray.900">
                      Hold Account
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
                    <VStack align="stretch" gap={2} p={4} bg="orange.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="orange.500">
                      <HStack justify="space-between" align="start">
                        <VStack align="start" gap={1}>
                          <Text fontSize="sm" fontWeight="600" color="orange.700">
                            Placing Account on Hold
                          </Text>
                          <Text fontSize="md" fontWeight="bold" color="gray.900">
                            {tenantName}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            ID: {tenantId}
                          </Text>
                        </VStack>
                        <Icon as={MdPause} color="orange.500" boxSize={4} />
                      </HStack>
                      <Text fontSize="xs" color="orange.600">
                        This will temporarily pause the account with limited access.
                      </Text>
                    </VStack>

                    {/* Dynamic form fields */}
                    <SimpleGrid columns={1} gap={4}>
                      {TENANT_HOLD_QUESTIONS.filter(que => que.is_active)
                        .sort((a, b) => a.display_order - b.display_order).map((que) => {
                          const schemaKey = que.schema_key as keyof HoldTenantFormData
                          const fieldError = errors[schemaKey]
                          
                          /* Standard form field properties */
                          const commonProps = {
                            name: schemaKey,
                            label: que.label,
                            placeholder: que.placeholder,
                            isInValid: !!fieldError,
                            required: que.is_required,
                            errorMessage: fieldError?.message,
                            disabled: isHolding,
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
                                        min={new Date().toISOString().split('T')[0]}
                                        helperText={que.schema_key === 'hold_until' ? 
                                          "If left empty, the hold will remain active until manually lifted." : 
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
                        disabled={isHolding}
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
                    disabled={isHolding}
                    size="sm"
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleSubmit(onSubmit)}
                    disabled={isHolding}
                    loading={isHolding}
                    size="sm"
                    bg="orange.500"
                    buttonProps={{
                      _hover:{ bg: "orange.600" },
                      _active:{ bg: "orange.700" }
                    }}
                  >
                    {isHolding ? 'Processing...' : 'Place on Hold'}
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

export default TenantHoldModal