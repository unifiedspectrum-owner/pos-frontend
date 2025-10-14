"use client"

/* Libraries imports */
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

/* Support ticket module imports */
import { UpdateTicketFormSchema, updateTicketSchema } from '@support-ticket-management/schemas'
import { useTicketOperations, useSupportTickets, useCommentOperations } from '@support-ticket-management/hooks'
import { SUPPORT_TICKET_PAGE_ROUTES, TICKET_FORM_MODES } from '@support-ticket-management/constants'
import { TicketFormLayout } from '@support-ticket-management/forms'

/* Tenant management module imports */
import { useTenants } from '@tenant-management/hooks'

/* Shared module imports */
import { ErrorMessageContainer, LoaderWrapper } from '@shared/components'

/* Component props interface */
interface EditTicketPageProps {
  ticketId: string
}

/* Ticket edit page with data fetching and form population */
const EditTicketPage: React.FC<EditTicketPageProps> = ({ ticketId }) => {
  const router = useRouter()

  /* Fetch ticket details and update operations */
  const { fetchTicketDetails, updateSupportTicket, ticketDetails, isFetching, isUpdating, fetchError } = useTicketOperations()

  /* Fetch ticket comments */
  const { fetchTicketComments, refetchTicketComments, ticketComments, isFetchingComments, fetchCommentsError } = useCommentOperations()

  /* Fetch categories for dropdown */
  const {
    categorySelectOptions,
    categoriesLoading,
    categoriesError,
  } = useSupportTickets({ autoFetchCategories: true })

  /* Fetch tenants for dropdown */
  const {
    tenantSelectOptions,
    baseDetailsTenants,
    baseDetailsLoading,
    baseDetailsError,
  } = useTenants({ autoFetchBaseDetails: true })

  /* Form configuration with Zod validation schema */
  const methods = useForm<UpdateTicketFormSchema>({
    resolver: zodResolver(updateTicketSchema),
    defaultValues: {
      tenant_id: '',
      category_id: '',
      subject: '',
      resolution_due: undefined,
      internal_notes: '',
      requester_name: '',
      requester_email: '',
      requester_phone: ''
    }
  })

  /* Fetch ticket data and comments on mount */
  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails(ticketId)
      fetchTicketComments(ticketId)
    }
  }, [ticketId, fetchTicketDetails, fetchTicketComments])

  /* Populate form when ticket details are loaded */
  useEffect(() => {
    if (ticketDetails && tenantSelectOptions.length > 0) {
      methods.reset({
        tenant_id: ticketDetails.tenant_id || '',
        category_id: ticketDetails.category_id?.toString() || '',
        subject: ticketDetails.subject || '',
        resolution_due: ticketDetails.resolution_due || undefined,
        internal_notes: ticketDetails.internal_notes || '',
        requester_name: ticketDetails.requester_name || '',
        requester_email: ticketDetails.requester_email || '',
        requester_phone: ticketDetails.requester_phone || ''
      })
    }
  }, [ticketDetails, tenantSelectOptions, methods])

  /* Log fetched comments for debugging */
  useEffect(() => {
    if (ticketComments.length > 0) {
      console.log('[EditTicketPage] Fetched ticket comments:', ticketComments)
    }
  }, [ticketComments])

  /* Handle form submission */
  const onSubmit = async (data: UpdateTicketFormSchema) => {
    try {
      console.log('[EditTicketPage] Form data for update:', data)
      console.log('[EditTicketPage] Ticket ID:', ticketId)

      /* Call update API */
      const success = await updateSupportTicket(ticketId, data)

      if (success) {
        router.push(SUPPORT_TICKET_PAGE_ROUTES.HOME)
      }
    } catch (error) {
      console.error('[EditTicketPage] Error updating ticket:', error)
    }
  }

  /* Navigate back to ticket management page */
  const handleCancel = () => {
    router.push(SUPPORT_TICKET_PAGE_ROUTES.HOME)
  }

  /* Check for loading state */
  const isLoading = isFetching || categoriesLoading || isFetchingComments || baseDetailsLoading

  /* Check for errors */
  const error = fetchError || categoriesError || fetchCommentsError || baseDetailsError

  return (
    <LoaderWrapper
      isLoading={isLoading}
      loadingText="Loading ticket details..."
      minHeight="500px"
    >
      {error ? (
        <ErrorMessageContainer error={error || 'Failed to load ticket data'} />
      ) : !ticketDetails ? (
        <ErrorMessageContainer error="Ticket not found" />
      ) : (
        <TicketFormLayout
          mode={TICKET_FORM_MODES.EDIT}
          methods={methods as any}
          onSubmit={onSubmit as any}
          onCancel={handleCancel}
          isSubmitting={isUpdating}
          tenantDetails={baseDetailsTenants}
          ticketId={ticketId}
          tenantSelectOptions={tenantSelectOptions}
          categorySelectOptions={categorySelectOptions}
          ticketComments={ticketComments}
          onRefresh={refetchTicketComments}
        />
      )}
    </LoaderWrapper>
  )
}

export default EditTicketPage
