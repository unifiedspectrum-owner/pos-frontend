/* Authentication localStorage key constants */

/* User authentication tokens */
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  LOGGED_IN: 'loggedIn',
  USER: 'user',
  PENDING_2FA_USER_ID: 'pending_2fa_user_id',
  PENDING_2FA_EMAIL: 'pending_2fa_email',
  PENDING_2FA_SETUP_REQUIRED: 'pending_2fa_setup_required',
  SESSION_EXPIRY_TIME: 'session_expiry_time'
} as const

/* Auth storage key type */
export type AuthStorageKey = typeof AUTH_STORAGE_KEYS[keyof typeof AUTH_STORAGE_KEYS]

/* Session timeout duration in minutes */
export const SESSION_TIMEOUT = 24*60  // 24 hours

/* Session warning threshold in minutes (show warning this many minutes before expiry) */
export const SESSION_WARNING_THRESHOLD = 1  // 1 minute

/* Inactivity threshold in minutes (show warning after this many minutes of no activity) */
export const INACTIVITY_THRESHOLD = 23*60  // 23 hours

/* Inactivity dialog countdown duration in minutes */
export const INACTIVITY_DIALOG_COUNTDOWN = 1  // 1 minute

/* User activity events for session tracking */
export const USER_ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'keypress',
  'scroll',
  'touchstart',
  'touchmove',
  'click',
  'wheel',
  'input',
  'focus',
  'blur'
] as const