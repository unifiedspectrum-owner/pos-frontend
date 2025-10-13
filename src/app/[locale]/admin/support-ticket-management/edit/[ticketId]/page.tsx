/* Libraries imports */
import React from 'react'

/* Support ticket module imports */
import { EditTicketPage } from '@support-ticket-management/pages'

/* Shared module imports */
import { AdminRouteGuard } from '@shared/components'

/* Page params interface */
interface PageProps {
  params: Promise<{
    ticketId: string
  }>
}

/* Edit ticket page route with admin authentication */
const EditTicket = async ({ params }: PageProps) => {
  const resolvedParams = await params

  return (
    <AdminRouteGuard>
      <EditTicketPage ticketId={resolvedParams.ticketId} />
    </AdminRouteGuard>
  )
}

export default EditTicket
