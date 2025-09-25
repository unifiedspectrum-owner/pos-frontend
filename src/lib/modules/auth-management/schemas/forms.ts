/* Form validation schemas for authentication */

/* Libraries imports */
import { z } from 'zod'

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
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
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

/* Change password form validation schema */
export const changePasswordSchema = z.object({
  current_password: z.string()
    .min(1, 'Current password is required'),

  new_password: z.string()
    .min(1, 'New password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
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
  code: z.array(z.string())
    .length(6, { message: "Code must be 6 digits long" })
    .superRefine((arr, ctx) => {
      if (arr.some((c) => c.trim() === '')) {
        ctx.addIssue({
          code: 'custom',
          message: 'All 6 digits are required',
        });
      }
    }),
});

/* TypeScript types from schemas */
export type LoginFormData = z.infer<typeof loginSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>
export type TwoFactorValidationFormData = z.infer<typeof twoFactorValidationSchema>