/* Routing constants for support ticket management module */

/* Support Ticket Module Name */
export const SUPPORT_TICKET_MODULE_NAME = 'support-ticket-management';

/* Support Ticket API endpoints */
export const SUPPORT_TICKET_API_ROUTES = {
  BASE_URL: '/support-tickets',
  LIST: '/list',
  ATTACHEMENT: {
    DOWNLOAD: '/attachments/:id/download'
  },
  DETAILS: '/:id',
  CREATE: '',
  UPDATE: '/:id',
  DELETE: '/:id',
  ASSIGN: '/:id/assign',
  ADD_COMMENT: '/communications',
  GET_COMMENTS: '/:id/communications',
  CATEGORIES: '/categories',
  STATISTICS: '/statistics',
} as const

/* Support Ticket management page routes */
export const SUPPORT_TICKET_PAGE_ROUTES = {
  HOME: '/admin/support-ticket-management',
  CREATE: '/admin/support-ticket-management/create',
  VIEW: '/admin/support-ticket-management/view/:id',
  EDIT: '/admin/support-ticket-management/edit/:id',
} as const
