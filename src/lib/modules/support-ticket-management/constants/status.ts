/* Ticket status constants */

/* Ticket status filter values */
export const TICKET_STATUS = {
  ALL: 'all',
  NEW: 'new',
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  PENDING_CUSTOMER: 'pending_customer',
  PENDING_INTERNAL: 'pending_internal',
  ESCALATED: 'escalated',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
} as const

/* Ticket status display labels */
export const TICKET_STATUS_LABELS = {
  [TICKET_STATUS.ALL]: 'All Status',
  [TICKET_STATUS.NEW]: 'New',
  [TICKET_STATUS.OPEN]: 'Open',
  [TICKET_STATUS.IN_PROGRESS]: 'In Progress',
  [TICKET_STATUS.PENDING_CUSTOMER]: 'Pending Customer',
  [TICKET_STATUS.PENDING_INTERNAL]: 'Pending Internal',
  [TICKET_STATUS.ESCALATED]: 'Escalated',
  [TICKET_STATUS.RESOLVED]: 'Resolved',
  [TICKET_STATUS.CLOSED]: 'Closed',
  [TICKET_STATUS.CANCELLED]: 'Cancelled',
  [TICKET_STATUS.PENDING]: 'Pending',
} as const

/* Ticket status update dropdown options (without 'All' option) */
export const TICKET_STATUS_OPTIONS = [
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.NEW], value: TICKET_STATUS.NEW },
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.OPEN], value: TICKET_STATUS.OPEN },
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.IN_PROGRESS], value: TICKET_STATUS.IN_PROGRESS },
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.PENDING_CUSTOMER], value: TICKET_STATUS.PENDING_CUSTOMER },
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.PENDING_INTERNAL], value: TICKET_STATUS.PENDING_INTERNAL },
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.ESCALATED], value: TICKET_STATUS.ESCALATED },
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.RESOLVED], value: TICKET_STATUS.RESOLVED },
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.CLOSED], value: TICKET_STATUS.CLOSED },
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.CANCELLED], value: TICKET_STATUS.CANCELLED },
]
