/* Communication constants for ticket management */

/* Sender type values */
export const SENDER_TYPES = {
  CUSTOMER: 'customer',
  AGENT: 'agent',
  SYSTEM: 'system'
} as const

/* Type for sender type values */
export type SenderType = typeof SENDER_TYPES[keyof typeof SENDER_TYPES]
