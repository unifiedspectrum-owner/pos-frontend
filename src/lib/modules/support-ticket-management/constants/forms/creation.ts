/* Ticket creation form configuration constants */

/* Libraries imports */
import { FaInfoCircle, FaUser, FaEnvelope, FaPhone, FaListAlt, FaFileAlt, FaPaperclip } from 'react-icons/fa'

/* Support ticket module imports */
import { CreateTicketFormSchema } from '@support-ticket-management/schemas'

/* Shared module imports */
import { FormFieldStructure, FormSectionStructure } from '@shared/types'
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Available modes for ticket forms */
export const TICKET_FORM_MODES = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
  VIEW: 'VIEW',
} as const

/* Form mode type */
export type TicketFormMode = typeof TICKET_FORM_MODES[keyof typeof TICKET_FORM_MODES]

/* Page titles for different ticket form modes */
export const TICKET_FORM_TITLES = {
  CREATE: 'Create New Ticket',
  EDIT: 'Edit Ticket',
  VIEW: 'View Ticket',
  DEFAULT: 'Support Ticket Management',
} as const

/* Default form values for ticket creation */
export const TICKET_FORM_DEFAULT_VALUES: CreateTicketFormSchema = {
  tenant_id: '',
  requester_user_id: '',
  requester_email: '',
  requester_name: '',
  requester_phone: '',
  category_id: '',
  subject: '',
  message_content: '',
  resolution_due: undefined,
  internal_notes: null,
  attachments: []
}

/* Ticket creation form field configurations for Requester Info tab */
export const REQUESTER_INFO_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: FORM_FIELD_TYPES.SELECT,
    label: "Tenant Name",
    schema_key: "tenant_id",
    placeholder: "Select Tenant Name",
    left_icon: FaInfoCircle,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 2
    }
  },
  {
    id: 2,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Requester Name",
    schema_key: "requester_name",
    placeholder: "Enter requester name",
    left_icon: FaUser,
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 2
    }
  },
  {
    id: 3,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Requester Email",
    schema_key: "requester_email",
    placeholder: "Enter requester email",
    left_icon: FaEnvelope,
    is_required: true,
    is_active: true,
    display_order: 3,
    grid: {
      col_span: 2
    }
  },
  {
    id: 4,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Requester Phone",
    schema_key: "requester_phone",
    placeholder: "Enter requester phone (optional)",
    left_icon: FaPhone,
    is_required: false,
    is_active: true,
    display_order: 4,
    grid: {
      col_span: 2
    }
  }
]

/* Ticket creation form field configurations for Ticket Info tab */
export const TICKET_INFO_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 5,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Subject",
    schema_key: "subject",
    placeholder: "Enter ticket subject",
    left_icon: FaFileAlt,
    is_required: true,
    is_active: true,
    display_order: 5,
    grid: {
      col_span: 4
    }
  },
  {
    id: 6,
    type: FORM_FIELD_TYPES.SELECT,
    label: "Category",
    schema_key: "category_id",
    placeholder: "Select ticket category",
    left_icon: FaListAlt,
    is_required: true,
    is_active: true,
    display_order: 6,
    grid: {
      col_span: 2
    }
  },
  {
    id: 7,
    type: FORM_FIELD_TYPES.DATE,
    label: "Resolution Due Date",
    schema_key: "resolution_due",
    placeholder: "Select resolution due date",
    left_icon: FaInfoCircle,
    is_required: false,
    is_active: true,
    display_order: 7,
    grid: {
      col_span: 2
    }
  },
  {
    id: 8,
    type: FORM_FIELD_TYPES.TEXTAREA,
    label: "Description",
    schema_key: "message_content",
    placeholder: "Enter your message (minimum 10 characters)",
    left_icon: FaFileAlt,
    is_required: true,
    is_active: true,
    display_order: 8,
    grid: {
      col_span: 4
    }
  },
  {
    id: 9,
    type: FORM_FIELD_TYPES.TEXTAREA,
    label: "Internal Notes",
    schema_key: "internal_notes",
    placeholder: "Enter internal notes (optional)",
    left_icon: FaFileAlt,
    is_required: false,
    is_active: true,
    display_order: 9,
    grid: {
      col_span: 4
    }
  }
]

/* Ticket creation form field configurations for Message Info tab */
export const MESSAGE_INFO_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 10,
    type: FORM_FIELD_TYPES.FILE,
    label: "Attachments",
    schema_key: "attachments",
    placeholder: "Upload attachments (max 5 files, 10MB each)",
    left_icon: FaPaperclip,
    is_required: false,
    is_active: true,
    display_order: 10,
    grid: {
      col_span: 8
    }
  }
]

/* Ticket creation form sections configuration */
export const TICKET_CREATION_FORM_QUESTIONS: FormSectionStructure[] = [
  {
    id: 1,
    icon: FaUser,
    heading: "Requester Information",
    questions: REQUESTER_INFO_FORM_QUESTIONS,
  },
  {
    id: 2,
    icon: FaInfoCircle,
    heading: "Ticket Information",
    questions: TICKET_INFO_FORM_QUESTIONS
  },
  {
    id: 3,
    icon: FaFileAlt,
    heading: "Attachments",
    questions: MESSAGE_INFO_FORM_QUESTIONS
  }
]
