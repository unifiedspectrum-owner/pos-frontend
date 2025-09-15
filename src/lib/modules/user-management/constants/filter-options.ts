/* Filter options constants for user management module */

/* User status filter options */
export const USER_STATUS_FILTER_OPTIONS = [
  { label: 'All Users', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' },
  { label: 'Suspended', value: 'suspended' }
] as const

/* User role filter options (will be populated dynamically from API) */
export const USER_ROLE_FILTER_BASE_OPTIONS = [
  { label: 'All Roles', value: 'all' }
] as const