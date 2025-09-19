/* Role status and filtering constants */

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

/* Role status filter configuration */
export const ROLE_STATUS_FILTER_OPTIONS = [
  { label: 'All Status', value: ROLE_STATUS.ALL },
  { label: ROLE_STATUS_LABELS[ROLE_STATUS.ACTIVE], value: ROLE_STATUS.ACTIVE },
  { label: ROLE_STATUS_LABELS[ROLE_STATUS.INACTIVE], value: ROLE_STATUS.INACTIVE },
] as const