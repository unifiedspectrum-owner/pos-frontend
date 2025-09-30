/* Form configuration constants for authentication */

/* Libraries imports */
import { FaLock, FaEnvelope, FaShieldAlt, FaKey } from 'react-icons/fa'
import { MdToggleOn } from 'react-icons/md'

/* Auth management module imports */
import { TwoFAType } from '@auth-management/types'

/* 2FA Type Constants */
export const TWO_FA_TYPES = {
  TOTP: 'totp',
  BACKUP: 'backup'
} satisfies Record<string, TwoFAType>;

/* Auth management module imports */
import { TokenValidationState } from '@auth-management/types'
import { ForgotPasswordFormData, LoginFormData, ResetPasswordFormData, Enable2FAFormData } from '@auth-management/schemas'

/* Shared module imports */
import { FormFieldStructure } from '@shared/types'

/* Default form values for login */
export const LOGIN_FORM_DEFAULT_VALUES: LoginFormData = {
  email: '',
  password: '',
  remember_me: false
}

/* Default form values for forgot password */
export const FORGOT_PASSWORD_FORM_DEFAULT_VALUES: ForgotPasswordFormData = {
  email: ''
}

/* Default form values for reset password */
export const RESET_PASSWORD_FORM_DEFAULT_VALUES: ResetPasswordFormData = {
  token: '',
  new_password: '',
  confirm_password: ''
}

/* Default form values for enable 2FA */
export const ENABLE_2FA_FORM_DEFAULT_VALUES: Enable2FAFormData = {
  code: ['', '', '', '', '', '']
}

/* Login form field configurations */
export const LOGIN_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: "INPUT",
    label: "Email Address",
    schema_key: "email",
    placeholder: "Enter your email address",
    left_icon: FaEnvelope,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 2
    }
  },
  {
    id: 2,
    type: "PASSWORD",
    label: "Password",
    schema_key: "password",
    placeholder: "Enter your password",
    left_icon: FaLock,
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 2
    }
  },
  {
    id: 3,
    type: "CHECKBOX",
    label: "Remember Me",
    schema_key: "remember_me",
    placeholder: "Keep me logged in",
    left_icon: MdToggleOn,
    is_required: false,
    is_active: true,
    display_order: 3,
    grid: {
      col_span: 2
    }
  }
]

/* Forgot password form field configurations */
export const FORGOT_PASSWORD_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: "INPUT",
    label: "Email Address",
    schema_key: "email",
    placeholder: "Enter your registered email address",
    left_icon: FaEnvelope,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 2
    }
  }
]

/* Reset password form field configurations */
export const RESET_PASSWORD_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: "PASSWORD",
    label: "New Password",
    schema_key: "new_password",
    placeholder: "Enter your new password",
    left_icon: FaLock,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 2
    }
  },
  {
    id: 2,
    type: "PASSWORD",
    label: "Confirm Password",
    schema_key: "confirm_password",
    placeholder: "Confirm your new password",
    left_icon: FaLock,
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 2
    }
  }
]

/* 2FA verification form field configurations */
export const VERIFY_2FA_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: "PIN",
    label: "Enter 6-digit code",
    schema_key: "totp_code",
    placeholder: "Enter the 6-digit code from your authenticator app",
    left_icon: FaShieldAlt,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 2
    }
  },
  {
    id: 2,
    type: "INPUT",
    label: "Enter backup code",
    schema_key: "b_code",
    placeholder: "Enter your backup recovery code",
    left_icon: FaKey,
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 2
    }
  }
]

/* Enable 2FA form field configurations */
export const ENABLE_2FA_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: "PIN",
    label: "Verification Code",
    schema_key: "code",
    placeholder: "Enter the 6-digit code from your authenticator app",
    left_icon: FaShieldAlt,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 2
    }
  }
]

/* Token validation states */
export const TOKEN_VALIDATION_STATE: Record<string, TokenValidationState> = {
  PENDING: 'PENDING',
  VALID: 'VALID',
  INVALID: 'INVALID'
} as const