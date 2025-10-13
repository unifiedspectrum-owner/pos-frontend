/* Support ticket status constants */

/* Ticket status filter values */
export const TICKET_STATUS = {
  ALL: 'all',
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  PENDING: 'pending',
} as const

/* Ticket status display labels */
export const TICKET_STATUS_LABELS = {
  [TICKET_STATUS.ALL]: 'All Status',
  [TICKET_STATUS.OPEN]: 'Open',
  [TICKET_STATUS.IN_PROGRESS]: 'In Progress',
  [TICKET_STATUS.RESOLVED]: 'Resolved',
  [TICKET_STATUS.CLOSED]: 'Closed',
  [TICKET_STATUS.PENDING]: 'Pending',
} as const

/* Ticket status filter dropdown options */
export const TICKET_STATUS_FILTER_OPTIONS = [
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.ALL], value: TICKET_STATUS.ALL },
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.OPEN], value: TICKET_STATUS.OPEN },
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.IN_PROGRESS], value: TICKET_STATUS.IN_PROGRESS },
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.RESOLVED], value: TICKET_STATUS.RESOLVED },
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.CLOSED], value: TICKET_STATUS.CLOSED },
  { label: TICKET_STATUS_LABELS[TICKET_STATUS.PENDING], value: TICKET_STATUS.PENDING },
] as const

/* Ticket priority filter values */
export const TICKET_PRIORITY = {
  ALL: 'all',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

/* Ticket priority display labels */
export const TICKET_PRIORITY_LABELS = {
  [TICKET_PRIORITY.ALL]: 'All Priority',
  [TICKET_PRIORITY.LOW]: 'Low',
  [TICKET_PRIORITY.MEDIUM]: 'Medium',
  [TICKET_PRIORITY.HIGH]: 'High',
  [TICKET_PRIORITY.URGENT]: 'Urgent',
} as const

/* Ticket priority filter dropdown options */
export const TICKET_PRIORITY_FILTER_OPTIONS = [
  { label: TICKET_PRIORITY_LABELS[TICKET_PRIORITY.ALL], value: TICKET_PRIORITY.ALL },
  { label: TICKET_PRIORITY_LABELS[TICKET_PRIORITY.LOW], value: TICKET_PRIORITY.LOW },
  { label: TICKET_PRIORITY_LABELS[TICKET_PRIORITY.MEDIUM], value: TICKET_PRIORITY.MEDIUM },
  { label: TICKET_PRIORITY_LABELS[TICKET_PRIORITY.HIGH], value: TICKET_PRIORITY.HIGH },
  { label: TICKET_PRIORITY_LABELS[TICKET_PRIORITY.URGENT], value: TICKET_PRIORITY.URGENT },
] as const
