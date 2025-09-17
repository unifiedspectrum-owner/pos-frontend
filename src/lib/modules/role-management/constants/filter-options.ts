/* Role status filter options for table filtering */

import { ROLE_STATUS, ROLE_STATUS_LABELS } from './role-status'

/* Role status filter configuration */
export const ROLE_STATUS_FILTER_OPTIONS = [
  { label: 'All Status', value: ROLE_STATUS.ALL },
  { label: ROLE_STATUS_LABELS[ROLE_STATUS.ACTIVE], value: ROLE_STATUS.ACTIVE },
  { label: ROLE_STATUS_LABELS[ROLE_STATUS.INACTIVE], value: ROLE_STATUS.INACTIVE },
] as const