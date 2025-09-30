/* Token validation state type for reset password flow */
export type TokenValidationState =
  | "PENDING"   /* Token validation is in progress */
  | "VALID"     /* Token is valid and can be used for password reset */
  | "INVALID"   /* Token is invalid, expired, or malformed */

export interface UserDetailsCache {
  id: string;
  email: string;
  name: string;
  role: string;
  is_2fa_required?: boolean;
}

/* 2FA Types */
export type TwoFAType = 'totp' | 'backup';