/* Libraries imports */
import { FaInfoCircle, FaCode, FaTag, FaFileAlt, FaToggleOn } from 'react-icons/fa'

/* Shared module imports */
import { FormFieldStructure } from '@shared/types'

/* Role creation form field configurations */
export const ROLE_CREATION_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: "INPUT",
    label: "Name",
    schema_key: "name",
    placeholder: "Enter role name",
    left_icon: FaInfoCircle,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 3
    }
  },
  {
    id: 2,
    type: "INPUT",
    label: "Code",
    schema_key: "code",
    placeholder: "Enter role code (e.g., ADMIN_ROLE)",
    left_icon: FaCode,
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 3
    }
  },
  {
    id: 3,
    type: "INPUT",
    label: "Display Name",
    schema_key: "display_name",
    placeholder: "Enter display name",
    left_icon: FaTag,
    is_required: true,
    is_active: true,
    display_order: 3,
    grid: {
      col_span: 3
    }
  },
  {
    id: 4,
    type: "TOGGLE",
    label: "Status",
    schema_key: "is_active",
    placeholder: "Toggle to activate or deactivate the role",
    left_icon: FaToggleOn,
    is_required: false,
    is_active: true,
    display_order: 4,
    toggle_text: {
      true: "Active",
      false: "Inactive"
    },
    grid: {
      col_span: 3
    }
  },
  {
    id: 5,
    type: "TEXTAREA",
    label: "Description",
    schema_key: "description",
    placeholder: "Enter role description",
    left_icon: FaFileAlt,
    is_required: true,
    is_active: true,
    display_order: 5,
    grid: {
      col_span: 6
    }
  }
]