/* Libraries imports */
import { IconType } from 'react-icons'
import { CreateUserFormData } from '../schemas'
import { FaUser, FaEnvelope, FaUserShield, FaToggleOn } from 'react-icons/fa'
import { FiPhone } from 'react-icons/fi'
import { FormFieldStructure } from '@/lib/shared/types'

/* User creation tab type */
export type UserCreationTabType = 'basic_info'

/* User creation tab configuration interface */
export interface UserCreationTabConfig {
  id: UserCreationTabType
  label: string
  icon: IconType
}

export const USER_FORM_DEFAULT_VALUES: CreateUserFormData = {
  f_name: '',
  l_name: '',
  email: '',
  phone: ['+91', ''],
  role_id: '',
  module_assignments: [],
  is_active: true,
}

/* User creation tab constants */
export const USER_CREATION_TAB = {
  BASIC_INFO: 'basic_info',
} as const satisfies Record<string, UserCreationTabType>

/* Tab configuration for user creation form */
export const USER_CREATION_TABS: UserCreationTabConfig[] = [
  {
    id: USER_CREATION_TAB.BASIC_INFO,
    label: 'Basic Information',
    icon: FaUser
  }
]

/* Section heading constants */
export const USER_FORM_SECTIONS = {
  BASIC_INFO: "User Information",
  MODULE_ASSIGNMENTS: "Module Permissions",
} as const

/* User creation form field configurations */
export const USER_CREATION_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: "INPUT",
    label: "First Name",
    schema_key: "f_name",
    placeholder: "Enter first name",
    left_icon: FaUser,
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
    label: "Last Name",
    schema_key: "l_name",
    placeholder: "Enter last name",
    left_icon: FaUser,
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 3
    }
  },
  {
    id: 3,
    type: "SELECT",
    label: "User Role",
    schema_key: "role_id",
    placeholder: "Select a role",
    left_icon: FaUserShield,
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
    label: "Account Status",
    schema_key: "is_active",
    placeholder: "Enable or disable user account",
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
    type: "INPUT",
    label: "Email Address",
    schema_key: "email",
    placeholder: "Enter email address",
    left_icon: FaEnvelope,
    is_required: true,
    is_active: true,
    display_order: 5,
    grid: {
      col_span: 3
    }
  },
  {
    id: 6,
    type: "PHONE_NUMBER",
    label: "Phone Number",
    schema_key: "phone",
    placeholder: "Enter phone number",
    left_icon: FiPhone,
    is_required: true,
    is_active: true,
    display_order: 6,
    grid: {
      col_span: 3
    }
  }
]