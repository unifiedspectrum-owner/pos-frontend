/* Role status constants for consistent status handling */

/* Role status values */
export const ROLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ALL: 'all'
} as const

/* Role status display labels */
export const ROLE_STATUS_LABELS = {
  [ROLE_STATUS.ACTIVE]: 'Active',
  [ROLE_STATUS.INACTIVE]: 'Inactive'
} as const

/* Type for role status values */
export type RoleStatus = typeof ROLE_STATUS[keyof typeof ROLE_STATUS]