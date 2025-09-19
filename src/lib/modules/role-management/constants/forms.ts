/* Form configuration constants for role management */

/* Libraries imports */
import { FaInfoCircle, FaCog, FaFileAlt, FaToggleOn } from 'react-icons/fa'
import { IconType } from 'react-icons'

/* Role management module imports */
import { CreateRoleFormData } from '@role-management/schemas'

/* Shared module imports */
import { FormFieldStructure } from '@shared/types'

/* Form section labels */
export const ROLE_FORM_SECTIONS = {
  ROLE_INFO: 'Role Information',
  MODULE_ASSIGNMENTS: 'Module Assignments'
} as const

/* Available modes for role forms */
export const ROLE_FORM_MODES = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
  VIEW: 'VIEW',
} as const

/* Form mode type */
export type RoleFormMode = typeof ROLE_FORM_MODES[keyof typeof ROLE_FORM_MODES]

/* Page titles for different role form modes */
export const ROLE_FORM_TITLES = {
  CREATE: 'Create New Role',
  EDIT: 'Edit Role',
  VIEW: 'View Role',
  DEFAULT: 'Role Management',
} as const

/* Default form values for role creation */
export const ROLE_FORM_DEFAULT_VALUES: CreateRoleFormData = {
  name: '',
  description: '',
  is_active: true,
  module_assignments: []
}

/* Role form tab interface and configuration */
export interface RoleFormTabData {
  id: RoleFormTabType,
  label: string;
  icon: IconType
}

export type RoleFormTabType = 'role-info' | 'module-assignments'

export const ROLE_TAB_IDS = {
  ROLE_INFO: 'role-info' as const,
  MODULE_ASSIGNMENTS: 'module-assignments' as const
} as const

export const ROLE_FORM_TABS: RoleFormTabData[] = [
  {
    id: ROLE_TAB_IDS.ROLE_INFO,
    label: ROLE_FORM_SECTIONS.ROLE_INFO,
    icon: FaInfoCircle
  },
  {
    id: ROLE_TAB_IDS.MODULE_ASSIGNMENTS,
    label: ROLE_FORM_SECTIONS.MODULE_ASSIGNMENTS,
    icon: FaCog
  }
]

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
      col_span: 5
    }
  },
  {
    id: 2,
    type: "TOGGLE",
    label: "Status",
    schema_key: "is_active",
    placeholder: "Toggle to activate or deactivate the role",
    left_icon: FaToggleOn,
    is_required: false,
    is_active: true,
    display_order: 2,
    toggle_text: {
      true: "Active",
      false: "Inactive"
    },
    grid: {
      col_span: 3
    }
  },
  {
    id: 3,
    type: "TEXTAREA",
    label: "Description",
    schema_key: "description",
    placeholder: "Enter role description",
    left_icon: FaFileAlt,
    is_required: true,
    is_active: true,
    display_order: 3,
    grid: {
      col_span: 8
    }
  }
]

/* CRUD permission options for module assignments */
export const MODULE_PERMISSION_OPTIONS = [
  { label: 'Create', value: 'can_create' },
  { label: 'Read', value: 'can_read' },
  { label: 'Update', value: 'can_update' },
  { label: 'Delete', value: 'can_delete' }
]