/* UI-specific types and configurations */

/* Role form configuration */
export interface RoleFormConfig {
  mode: 'create' | 'edit' | 'view'
  roleId?: number
  title?: string
}