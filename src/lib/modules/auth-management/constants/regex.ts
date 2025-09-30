/* Regular expression constants for authentication validation */

/* Password validation regex */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;

/* Backup code format validation regex (4 alphanumeric-hyphen-4 alphanumeric) */
export const BACKUP_CODE_REGEX = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;

/* 2FA Validation Regex Patterns */
export const TOTP_CODE_REGEX = /^\d{6}$/; // 6-digit TOTP codes