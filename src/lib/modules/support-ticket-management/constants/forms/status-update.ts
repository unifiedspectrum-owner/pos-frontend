/* Ticket status update form configuration constants */

/* Libraries imports */
import { FaExchangeAlt, FaFileAlt } from 'react-icons/fa'

/* Support ticket module imports */
import { UpdateTicketStatusFormSchema } from '@support-ticket-management/schemas'

/* Shared module imports */
import { FormFieldStructure } from '@shared/types'
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Default form values for ticket status update */
export const TICKET_STATUS_UPDATE_FORM_DEFAULT_VALUES: UpdateTicketStatusFormSchema = {
  status: 'open',
  status_reason: ''
}

/* Ticket status update form field configurations */
export const TICKET_STATUS_UPDATE_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: FORM_FIELD_TYPES.SELECT,
    label: "New Status",
    schema_key: "status",
    placeholder: "Select new ticket status",
    left_icon: FaExchangeAlt,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 4
    }
  },
  {
    id: 2,
    type: FORM_FIELD_TYPES.TEXTAREA,
    label: "Status Change Reason",
    schema_key: "status_reason",
    placeholder: "Enter reason for status change (minimum 5 characters)",
    left_icon: FaFileAlt,
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 4
    }
  }
]
