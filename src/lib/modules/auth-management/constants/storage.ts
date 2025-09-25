/* Authentication localStorage key constants */

/* User authentication tokens */
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  LOGGED_IN: 'loggedIn',
  USER_EMAIL: 'userEmail',
  PENDING_2FA_USER_ID: 'pending_2fa_user_id',
  PENDING_2FA_EMAIL: 'pending_2fa_email'
} as const

/* Auth storage key type */
export type AuthStorageKey = typeof AUTH_STORAGE_KEYS[keyof typeof AUTH_STORAGE_KEYS]