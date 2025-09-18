/* Libraries imports */
import { FaInfoCircle, FaCog } from 'react-icons/fa'
import { CreateRoleFormData } from '@role-management/schemas/validation'
import { IconType } from 'react-icons';

export interface RoleFormTabData {
  id: RoleFormTabType,
  label: string;
  icon: IconType
}

/* Form section labels */
export const ROLE_FORM_SECTIONS = {
  ROLE_INFO: 'Role Information',
  MODULE_ASSIGNMENTS: 'Module Assignments'
} as const

/* Role form tab type */
export type RoleFormTabType = 'role-info' | 'module-assignments'

/* Tab ID constants */
export const ROLE_TAB_IDS = {
  ROLE_INFO: 'role-info' as const,
  MODULE_ASSIGNMENTS: 'module-assignments' as const
} as const

/* Role form tab definitions */
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
  code: '',
  display_name: '',
  description: '',
  is_active: true,
  module_assignments: []
}

/* CRUD permission options for module assignments */
export const MODULE_PERMISSION_OPTIONS = [
  { label: 'Create', value: 'can_create' },
  { label: 'Read', value: 'can_read' },
  { label: 'Update', value: 'can_update' },
  { label: 'Delete', value: 'can_delete' }
]

