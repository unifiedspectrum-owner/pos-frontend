/* Token validation state type for reset password flow */
export type TokenValidationState =
  | "PENDING"   /* Token validation is in progress */
  | "VALID"     /* Token is valid and can be used for password reset */
  | "INVALID"   /* Token is invalid, expired, or malformed */