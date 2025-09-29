/* Regular expression constants for shared validation */

/* Phone number validation regex patterns */
export const DIAL_CODE_REGEX = /^\+\d{1,4}$/;
export const PHONE_NUMBER_REGEX = /^\d{4,15}$/;

/* Default dial code constant */
export const DEFAULT_DIAL_CODE = '+91';

/* Date format validation regex (YYYY-MM-DD) */
export const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/* OTP validation regex (6 digits) */
export const OTP_REGEX = /^\d{6}$/;

/* Name validation regex (letters, spaces, apostrophes, hyphens) */
export const NAME_REGEX = /^[a-zA-Z\s'-]+$/;