/* Support ticket management API module exports */

/* HTTP client and configuration */
export * from './client'

/* API service methods */
export * from './services'

/* Legacy support - will be deprecated */
export { ticketsService as supportTicketService } from './services/tickets'
