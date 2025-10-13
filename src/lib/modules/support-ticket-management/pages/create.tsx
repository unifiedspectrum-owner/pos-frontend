"use client"

/* Libraries imports */
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

/* Support ticket module imports */
import { CreateTicketFormSchema, createTicketSchema } from '@support-ticket-management/schemas'
import { useTicketOperations, useSupportTickets } from '@support-ticket-management/hooks'
import { TICKET_FORM_DEFAULT_VALUES, SUPPORT_TICKET_PAGE_ROUTES, TICKET_FORM_MODES } from '@support-ticket-management/constants'
import { TicketFormLayout } from '@support-ticket-management/forms'

/* Tenant module imports */
import { useTenants } from '@tenant-management/hooks'
import { ErrorMessageContainer, LoaderWrapper } from '@/lib/shared'

/* Ticket creation page with API data fetching */
const CreateTicketPage: React.FC = () => {
  const router = useRouter() /* Navigation handler */
  const { createTicket, isCreating } = useTicketOperations() /* Ticket creation API hook */

  /* Fetch categories for dropdown */
  const {
    categorySelectOptions,
    categoriesLoading,
    categoriesError,
  } = useSupportTickets({ autoFetchCategories: true })

  /* Fetch tenants for dropdown */
  const {
    tenantSelectOptions,
    baseDetailsTenants: tenantDetails,
    baseDetailsLoading: tenantsLoading,
    baseDetailsError: tenantsError,
  } = useTenants({ autoFetchBaseDetails: true })

  /* Form configuration with Zod validation schema */
  const methods = useForm<CreateTicketFormSchema>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: TICKET_FORM_DEFAULT_VALUES
  })

  /* Handle form submission with API call and navigation */
  const onSubmit = async (data: CreateTicketFormSchema) => {
    try {
      console.log('Form data before submission:', data)

      const success = await createTicket(data) /* Submit ticket creation request */

      if (success) {
        router.push(SUPPORT_TICKET_PAGE_ROUTES.HOME) /* Navigate to ticket list on success */
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
    }
  }

  /* Navigate back to ticket management page */
  const handleCancel = () => {
    router.push(SUPPORT_TICKET_PAGE_ROUTES.HOME)
  }

  return (
    <LoaderWrapper isLoading={tenantsLoading || categoriesLoading}>
      { categoriesError || tenantsError ?
        <ErrorMessageContainer
          error={categoriesError || tenantsError}
        />
      :
        <TicketFormLayout
          mode={TICKET_FORM_MODES.CREATE}
          methods={methods}
          onSubmit={onSubmit}
          onCancel={handleCancel}
          isSubmitting={isCreating}
          tenantDetails={tenantDetails}
          tenantSelectOptions={tenantSelectOptions}
          categorySelectOptions={categorySelectOptions}
        />
      }
    </LoaderWrapper>
  )
}

export default CreateTicketPage
