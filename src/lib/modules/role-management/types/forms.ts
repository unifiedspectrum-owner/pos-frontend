/* Role form types and enums */

/* Role form operation modes */
export enum RoleFormMode {
  CREATE = 'create',
  EDIT = 'edit',
  VIEW = 'view'
}

/* Role form tab navigation */
export enum RoleManagementTabs {
  ROLE_INFO = 'role-info',
  MODULE_ASSIGNMENTS = 'module-assignments'
}

/* Form mode constants for easier usage */
export const ROLE_FORM_MODES = {
  CREATE: RoleFormMode.CREATE,
  EDIT: RoleFormMode.EDIT,
  VIEW: RoleFormMode.VIEW
} as const

/* Default tab for role forms */
export const DEFAULT_ROLE_TAB = RoleManagementTabs.ROLE_INFO

/* Role form configuration */
export interface RoleFormConfig {
  mode: RoleFormMode
  roleId?: number
  title?: string
}