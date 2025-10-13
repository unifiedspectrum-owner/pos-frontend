/* Libraries imports */
import React from 'react'
import { FormProvider, UseFormReturn } from 'react-hook-form'
import { Flex, Heading } from '@chakra-ui/react'
import { lighten } from 'polished'

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config'
import { Breadcrumbs } from '@shared/components'

/* Support ticket module imports */
import { CreateTicketFormSchema } from '@support-ticket-management/schemas'
import { TICKET_FORM_TITLES, TicketFormMode } from '@support-ticket-management/constants'
import { NavigationButtons, TicketForm, TicketComments } from '@support-ticket-management/forms'
import { TenantBasicDetails } from '@tenant-management/types/account/list'
import { TicketCommunication, TicketAttachment } from '@support-ticket-management/types'

/* Component props interface */
interface TicketFormLayoutProps {
  mode: TicketFormMode
  methods: UseFormReturn<CreateTicketFormSchema>
  onSubmit: (data: CreateTicketFormSchema) => void
  onCancel: () => void
  isSubmitting?: boolean,
  ticketId?: string;
  tenantDetails: TenantBasicDetails[]
  tenantSelectOptions?: Array<{ label: string; value: string }>
  categorySelectOptions?: Array<{ label: string; value: string }>
  ticketComments?: (TicketCommunication & { attachments?: TicketAttachment[] })[]
  onRefresh?: () => void
}

/* Main layout component for ticket forms */
const TicketFormLayout: React.FC<TicketFormLayoutProps> = ({
  mode,
  methods,
  onSubmit,
  onCancel,
  ticketId,
  isSubmitting = false,
  tenantDetails= [],
  tenantSelectOptions = [],
  categorySelectOptions = [],
  ticketComments = [],
  onRefresh,
}) => {

  return (
    <FormProvider {...methods}>
      <Flex w="100%" flexDir="column">
        {/* Responsive main container */}
        <Flex flexDir="column" p={6} maxW="1400px" mx="auto" w="full" gap={4}>
          {/* Page header section */}
          <Flex flexDir="column" gap={1}>
            <Heading as="h1" fontWeight="700" mb={0}>
              {TICKET_FORM_TITLES[mode]}
            </Heading>
            <Breadcrumbs />
          </Flex>

          {/* Form section with all fields */}
          <Flex flexDir="column" p={5} gap={4} borderWidth={1} borderRadius={10} borderColor={lighten(0.3, GRAY_COLOR)}>
            <TicketForm
              tenantDetails={tenantDetails}
              tenantSelectOptions={tenantSelectOptions}
              categorySelectOptions={categorySelectOptions}
            />
          </Flex>

          {/* Comments section - only visible in EDIT mode */}
          {mode === 'EDIT' && (
            <Flex flexDir="column" p={5} gap={4} borderWidth={1} borderRadius={10} borderColor={lighten(0.3, GRAY_COLOR)}>
              <TicketComments comments={ticketComments} ticketId={ticketId} onRefresh={onRefresh} />
            </Flex>
          )}

          {/* Navigation buttons section */}
          <NavigationButtons
            onCancel={onCancel}
            onSubmit={() => methods.handleSubmit(onSubmit)()}
            loading={isSubmitting}
            submitText={mode === 'CREATE' ? 'Create Ticket' : 'Update Ticket'}
            loadingText={mode === 'CREATE' ? 'Creating Ticket...' : 'Updating Ticket...'}
          />
        </Flex>
      </Flex>
    </FormProvider>
  )
}

export default TicketFormLayout
