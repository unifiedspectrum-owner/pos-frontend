/* Form validation schemas for authentication */

/* Libraries imports */
import { z } from 'zod'

/* Auth management constants imports */
import { TWO_FA_TYPES, PASSWORD_REGEX, BACKUP_CODE_REGEX } from '@auth-management/constants'

/* Login form validation schema */
export const loginSchema = z.object({
  email: z.email('Please enter a valid email address').min(1, 'Email is required'),

  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),

  remember_me: z.boolean()
})

/* Forgot password form validation schema */
export const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address').min(1, 'Email is required')
})

/* Reset password form validation schema */
export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required'),

  new_password: z.string()
    .min(1, 'New password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(PASSWORD_REGEX,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  confirm_password: z.string()
    .min(1, 'Password confirmation is required')
}).refine(
  (data) => data.new_password === data.confirm_password,
  {
    message: "Passwords don't match",
    path: ['confirm_password']
  }
)

/* Email verification form validation schema */
export const emailVerificationSchema = z.object({
  token: z.string()
    .min(1, 'Verification token is required'),

  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
});

/* 2FA token validation request schema */
export const twoFactorValidationSchema = z.object({
  user_id: z.string().min(1, 'user ID is required'),
  type: z.enum([TWO_FA_TYPES.TOTP, TWO_FA_TYPES.BACKUP]),
  b_code: z.string().optional(),
  totp_code: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.type === TWO_FA_TYPES.BACKUP) {
    if (!data.b_code || data.b_code.trim().length < 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'Backup code is required',
        path: ['b_code']
      });
    } else if (data.b_code.length !== 9) {
      ctx.addIssue({
        code: 'custom',
        message: 'Backup code must contain exactly 9 characters',
        path: ['b_code']
      });
    } else if (!BACKUP_CODE_REGEX.test(data.b_code)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid backup code format. It must be 4 alphanumeric characters, a hyphen, then 4 alphanumeric characters (e.g., AB12-CD34).',
        path: ['b_code'],
      });
    }
  }

  if (data.type === TWO_FA_TYPES.TOTP) {
    if (!data.totp_code || data.totp_code.length !== 6) {
      ctx.addIssue({
        code: 'custom',
        message: 'Code must be 6 digits long',
        path: ['totp_code']
      });
    } else if (data.totp_code.some((c) => c.trim() === '')) {
      ctx.addIssue({
        code: 'custom',
        message: 'All 6 digits are required',
        path: ['totp_code']
      });
    }
  }
});

/* User profile update form validation schema */
export const updateProfileSchema = z.object({
  f_name: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name cannot exceed 100 characters'),

  l_name: z.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name cannot exceed 100 characters'),

  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters')
    .toLowerCase(),

  phone: z.tuple([z.string(), z.string()]).optional(),
});

/* Enable 2FA request validation schema */
export const enable2FASchema = z.object({
 code: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (!data.code || data.code.length !== 6) {
    ctx.addIssue({
      code: 'custom',
      message: 'Code must be 6 digits long',
      path: ['totp_code']
    });
  } else if (data.code.some((c) => c.trim() === '')) {
    ctx.addIssue({
      code: 'custom',
      message: 'All 6 digits are required',
      path: ['totp_code']
    });
  }
});

/* TypeScript types from schemas */
export type LoginFormData = z.infer<typeof loginSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>
export type TwoFactorValidationFormData = z.infer<typeof twoFactorValidationSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type Enable2FAFormData = z.infer<typeof enable2FASchema>