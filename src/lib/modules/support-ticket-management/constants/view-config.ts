/* View configuration constants for support ticket details page */

/* Libraries imports */
import { IconType } from 'react-icons'
import { FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaTicketAlt, FaListAlt, FaClock, FaUserTie, FaCheckCircle, FaStar } from 'react-icons/fa'
import { FaCommentDots } from 'react-icons/fa6'
import { MdOutlineConfirmationNumber } from 'react-icons/md'

/* Field type enum */
export type TicketFieldType = 'TEXT' | 'BADGE' | 'DATE' | 'STATUS_BADGE' | 'OVERDUE_BADGE' | 'STAR_RATING' | 'CUSTOM'

/* Field type constants for dynamic rendering */
export const TICKET_VIEW_FIELD_TYPES = {
  TEXT: 'TEXT',
  BADGE: 'BADGE',
  DATE: 'DATE',
  STATUS_BADGE: 'STATUS_BADGE',
  OVERDUE_BADGE: 'OVERDUE_BADGE',
  STAR_RATING: 'STAR_RATING',
  CUSTOM: 'CUSTOM'
} as const satisfies Record<string, TicketFieldType>

/* Tab types for ticket details view */
export type TicketDetailsTabType = 'overview' | 'communications'

/* Tab configuration interface */
export interface TicketDetailsTabConfig {
  id: TicketDetailsTabType
  label: string
  icon: IconType
}

/* Field configuration interface */
export interface TicketDetailsFieldConfig {
  id: number
  display_order: number
  is_active: boolean
  label: string
  icon_name: IconType
  data_key: string
  type: TicketFieldType
}

/* Section configuration interface */
export interface TicketDetailsSectionConfig {
  id: string
  section_heading: string
  section_values: TicketDetailsFieldConfig[]
  columns?: number
  show_condition?: string
  empty_state_message?: string
}

/* Tab constants */
export const TICKET_DETAILS_TAB = {
  OVERVIEW: 'overview',
  COMMUNICATIONS: 'communications'
} as const satisfies Record<string, TicketDetailsTabType>

/* Tab configuration for ticket details view */
export const TICKET_DETAILS_TABS: TicketDetailsTabConfig[] = [
  {
    id: TICKET_DETAILS_TAB.OVERVIEW,
    label: 'Overview',
    icon: FaListAlt
  },
  {
    id: TICKET_DETAILS_TAB.COMMUNICATIONS,
    label: 'Communications',
    icon: FaCommentDots
  }
]

/* Ticket information fields */
export const TicketInfoFields: TicketDetailsFieldConfig[] = [
  {
    id: 1,
    display_order: 1,
    is_active: true,
    label: 'Ticket ID',
    icon_name: MdOutlineConfirmationNumber,
    data_key: 'ticket_id',
    type: TICKET_VIEW_FIELD_TYPES.TEXT
  },
  {
    id: 2,
    display_order: 2,
    is_active: true,
    label: 'Status',
    icon_name: FaCheckCircle,
    data_key: 'status',
    type: TICKET_VIEW_FIELD_TYPES.STATUS_BADGE
  },
  {
    id: 3,
    display_order: 3,
    is_active: true,
    label: 'Category',
    icon_name: FaListAlt,
    data_key: 'category_details.name',
    type: TICKET_VIEW_FIELD_TYPES.TEXT
  },
  {
    id: 4,
    display_order: 4,
    is_active: true,
    label: 'Overdue Status',
    icon_name: FaClock,
    data_key: 'is_overdue',
    type: TICKET_VIEW_FIELD_TYPES.OVERDUE_BADGE
  },
  {
    id: 5,
    display_order: 5,
    is_active: true,
    label: 'Created At',
    icon_name: FaCalendarAlt,
    data_key: 'created_at',
    type: TICKET_VIEW_FIELD_TYPES.DATE
  },
  {
    id: 6,
    display_order: 6,
    is_active: true,
    label: 'Resolution Due',
    icon_name: FaClock,
    data_key: 'resolution_due',
    type: TICKET_VIEW_FIELD_TYPES.DATE
  },
  {
    id: 7,
    display_order: 7,
    is_active: true,
    label: 'First Response',
    icon_name: FaCheckCircle,
    data_key: 'first_response_at',
    type: TICKET_VIEW_FIELD_TYPES.DATE
  },
  {
    id: 8,
    display_order: 8,
    is_active: true,
    label: 'Last Updated',
    icon_name: FaCalendarAlt,
    data_key: 'updated_at',
    type: TICKET_VIEW_FIELD_TYPES.DATE
  }
]

/* Requester information fields */
export const RequesterInfoFields: TicketDetailsFieldConfig[] = [
  {
    id: 1,
    display_order: 1,
    is_active: true,
    label: 'Name',
    icon_name: FaUser,
    data_key: 'requester_name',
    type: TICKET_VIEW_FIELD_TYPES.TEXT
  },
  {
    id: 2,
    display_order: 2,
    is_active: true,
    label: 'Email',
    icon_name: FaEnvelope,
    data_key: 'requester_email',
    type: TICKET_VIEW_FIELD_TYPES.TEXT
  },
  {
    id: 3,
    display_order: 3,
    is_active: true,
    label: 'Phone',
    icon_name: FaPhone,
    data_key: 'requester_phone',
    type: TICKET_VIEW_FIELD_TYPES.TEXT
  },
  {
    id: 4,
    display_order: 4,
    is_active: true,
    label: 'Tenant ID',
    icon_name: FaTicketAlt,
    data_key: 'tenant_id',
    type: TICKET_VIEW_FIELD_TYPES.TEXT
  }
]

/* Assignment information fields */
export const AssignmentInfoFields: TicketDetailsFieldConfig[] = [
  {
    id: 1,
    display_order: 1,
    is_active: true,
    label: 'Assigned To',
    icon_name: FaUserTie,
    data_key: 'assignment_details.assigned_to_user_name',
    type: TICKET_VIEW_FIELD_TYPES.TEXT
  },
  {
    id: 2,
    display_order: 2,
    is_active: true,
    label: 'Role',
    icon_name: FaUserTie,
    data_key: 'assignment_details.assigned_to_role_name',
    type: TICKET_VIEW_FIELD_TYPES.TEXT
  },
  {
    id: 3,
    display_order: 3,
    is_active: true,
    label: 'Assigned At',
    icon_name: FaCalendarAlt,
    data_key: 'assignment_details.assigned_at',
    type: TICKET_VIEW_FIELD_TYPES.DATE
  }
]

/* Satisfaction rating fields */
export const SatisfactionRatingFields: TicketDetailsFieldConfig[] = [
  {
    id: 1,
    display_order: 1,
    is_active: true,
    label: 'Rating',
    icon_name: FaStar,
    data_key: 'satisfaction_rating',
    type: TICKET_VIEW_FIELD_TYPES.STAR_RATING
  },
  {
    id: 2,
    display_order: 2,
    is_active: true,
    label: 'Submitted At',
    icon_name: FaCalendarAlt,
    data_key: 'satisfaction_submitted_at',
    type: TICKET_VIEW_FIELD_TYPES.DATE
  }
]

/* Section configurations */
export const TICKET_DETAILS_SECTIONS: TicketDetailsSectionConfig[] = [
  {
    id: 'ticket_info',
    section_heading: 'Ticket Information',
    section_values: TicketInfoFields,
    columns: 4
  },
  {
    id: 'requester_info',
    section_heading: 'Requester Information',
    section_values: RequesterInfoFields,
    columns: 4
  },
  {
    id: 'assignment_info',
    section_heading: 'Assignment Information',
    section_values: AssignmentInfoFields,
    columns: 4,
    show_condition: 'assignment_details',
    empty_state_message: 'Not yet assigned'
  },
  {
    id: 'internal_notes',
    section_heading: 'Internal Notes',
    section_values: [],
    show_condition: 'internal_notes'
  },
  {
    id: 'satisfaction_rating',
    section_heading: 'Customer Satisfaction',
    section_values: SatisfactionRatingFields,
    columns: 3,
    show_condition: 'satisfaction_rating'
  }
]
