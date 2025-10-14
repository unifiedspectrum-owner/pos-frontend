/* Ticket communication form configuration constants */

/* Libraries imports */
import { FaCommentDots, FaPaperclip, FaInfoCircle } from 'react-icons/fa'

/* Support ticket module imports */
import { CreateTicketCommentFormSchema } from '@support-ticket-management/schemas'

/* Shared module imports */
import { FormFieldStructure } from '@shared/types'
import { FORM_FIELD_TYPES } from '@shared/constants'

/* Default form values for ticket communication */
export const TICKET_COMMUNICATION_FORM_DEFAULT_VALUES: CreateTicketCommentFormSchema = {
  message_content: '',
  is_internal: false,
  attachments: []
}

/* Ticket communication form field configurations */
export const TICKET_COMMUNICATION_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: FORM_FIELD_TYPES.WYSIWYG_EDITOR,
    label: "Message",
    schema_key: "message_content",
    placeholder: "Enter your message (minimum 1 character, maximum 10000 characters)",
    left_icon: FaCommentDots,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 2
    }
  },

  {
    id: 2,
    type: FORM_FIELD_TYPES.FILE,
    label: "Attachments",
    schema_key: "attachments",
    placeholder: "Upload attachments (max 5 files, max 10MB)",
    left_icon: FaPaperclip,
    is_required: false,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 2
    }
  },
  {
    id: 3,
    type: FORM_FIELD_TYPES.TOGGLE,
    label: "Internal Note",
    schema_key: "is_internal",
    placeholder: "Mark as internal note (visible only to agents)",
    left_icon: FaInfoCircle,
    is_required: false,
    is_active: true,
    display_order: 3,
    toggle_text: {
      true: "Internal (Agents Only)",
      false: "Public (Visible to Customer)"
    },
    grid: {
      col_span: 2
    }
  }
]
