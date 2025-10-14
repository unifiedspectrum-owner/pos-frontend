/* Ticket assignment form configuration constants */

/* Libraries imports */
import { FaUserCheck, FaFileAlt } from 'react-icons/fa'

/* Support ticket module imports */
import { AssignTicketFormSchema } from '@support-ticket-management/schemas'

/* Shared module imports */
import { FormFieldStructure } from '@shared/types'
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Default form values for ticket assignment */
export const TICKET_ASSIGNMENT_FORM_DEFAULT_VALUES: AssignTicketFormSchema = {
  user_id: '',
  reason: ''
}

/* Ticket assignment form field configurations */
export const TICKET_ASSIGNMENT_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: FORM_FIELD_TYPES.SELECT,
    label: "Assign To User",
    schema_key: "user_id",
    placeholder: "Select user to assign ticket",
    left_icon: FaUserCheck,
    is_required: false,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 2
    }
  },
  {
    id: 2,
    type: FORM_FIELD_TYPES.TEXTAREA,
    label: "Assignment Reason",
    schema_key: "reason",
    placeholder: "Enter reason for assignment (optional, minimum 5 characters)",
    left_icon: FaFileAlt,
    is_required: false,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 4
    }
  }
]
