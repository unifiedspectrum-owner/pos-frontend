/* Libraries imports */
import { notFound } from 'next/navigation'

/* Support ticket module imports */
import TicketDetailsPage from '@support-ticket-management/pages/view'

/* Props interface for ticket details page route */
interface TicketDetailsPageRouteProps {
  params: Promise<{
    ticketId: string
  }>
}

/* Ticket details page route component */
export default async function TicketDetailsPageRoute({
  params
}: TicketDetailsPageRouteProps) {
  const { ticketId } = await params

  /* Validate ticketId parameter */
  if (!ticketId || isNaN(Number(ticketId))) {
    notFound()
  }

  return <TicketDetailsPage ticketId={ticketId} />
}
