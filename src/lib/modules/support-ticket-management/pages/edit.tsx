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

/* Shared module imports */
import { ErrorMessageContainer, FullPageLoader } from '@shared/components'

/* Component props interface */
interface EditTicketPageProps {
  ticketId: string
}

/* Ticket edit page with data fetching and form population */
const EditTicketPage: React.FC<EditTicketPageProps> = ({ ticketId }) => {
  const router = useRouter()

  /* Fetch ticket details */
  const { fetchTicketDetails, ticketDetails, isFetching, fetchError } = useTicketOperations()

  /* Fetch ticket comments */
  const { fetchTicketComments, refetchTicketComments, ticketComments, isFetchingComments, fetchCommentsError } = useCommentOperations()

  /* Fetch categories for dropdown */
  const {
    categorySelectOptions,
    categoriesLoading,
    categoriesError,
  } = useSupportTickets({ autoFetchCategories: true })

  /* Form configuration with Zod validation schema */
  const methods = useForm<UpdateTicketFormSchema>({
    resolver: zodResolver(updateTicketSchema),
    defaultValues: {
      category_id: '',
      subject: '',
      status: 'new',
      resolution_due: undefined,
      internal_notes: ''
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
    if (ticketDetails) {
      methods.reset({
        category_id: ticketDetails.category_id?.toString() || '',
        subject: ticketDetails.subject || '',
        status: ticketDetails.status,
        resolution_due: ticketDetails.resolution_due || undefined,
        internal_notes: ticketDetails.internal_notes || ''
      })
    }
  }, [ticketDetails, methods])

  /* Log fetched comments for debugging */
  useEffect(() => {
    if (ticketComments.length > 0) {
      console.log('[EditTicketPage] Fetched ticket comments:', ticketComments)
    }
  }, [ticketComments])

  /* Handle form submission */
  const onSubmit = async (data: UpdateTicketFormSchema) => {
    try {
      console.log('Form data for update:', data)
      console.log('Ticket ID:', ticketId)

      /* TODO: Implement update API call when service is ready */
      // const success = await updateTicket(ticketId, data)
      // if (success) {
      //   router.push(SUPPORT_TICKET_PAGE_ROUTES.HOME)
      // }

      /* Temporary: Show success message */
      alert('Update functionality will be implemented when API is ready')
      router.push(SUPPORT_TICKET_PAGE_ROUTES.HOME)
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  /* Navigate back to ticket management page */
  const handleCancel = () => {
    router.push(SUPPORT_TICKET_PAGE_ROUTES.HOME)
  }

  /* Loading state */
  if (isFetching || categoriesLoading || isFetchingComments) {
    return <FullPageLoader />
  }

  /* Error state */
  if (fetchError || categoriesError || fetchCommentsError) {
    return (
      <ErrorMessageContainer
        error={fetchError || categoriesError || fetchCommentsError || 'Failed to load ticket data'}
      />
    )
  }

  /* No ticket data state */
  if (!ticketDetails) {
    return (
      <ErrorMessageContainer
        error="Ticket not found"
      />
    )
  }

  return (
    <TicketFormLayout
      mode={TICKET_FORM_MODES.EDIT}
      methods={methods as any}
      onSubmit={onSubmit as any}
      onCancel={handleCancel}
      isSubmitting={false}
      tenantDetails={[]}
      ticketId={ticketId}
      tenantSelectOptions={[]}
      categorySelectOptions={categorySelectOptions}
      ticketComments={ticketComments}
      onRefresh={refetchTicketComments}
    />
  )
}

export default EditTicketPage
