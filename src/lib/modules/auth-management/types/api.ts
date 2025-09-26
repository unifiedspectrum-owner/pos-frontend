/* Authentication API request and response interfaces */

/* Shared module imports */
import { ValidationError } from '@shared/types'
import { TwoFAType } from '@auth-management/types';

/* API Request Interfaces */

/* User login credentials payload */
export interface LoginApiRequest {
  email: string;
  password: string;
  remember_me: boolean;
}

export interface Verify2FAApiRequest {
  user_id: string;
  type: TwoFAType;
  code: string;
}

/* Forgot Password request payload */
export interface ForgotPasswordApiRequest {
  email: string;
}

/* Reset Password request payload */
export interface ResetPasswordApiRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

/* Refresh API request payload */
export interface RefreshTokenApiRequest {
  email: string;
}


/* API Response Interfaces */

/* User authentication success response */
export interface LoginApiResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    session_id?: string;
    requires_2fa: boolean;
    is_2fa_authenticated: boolean;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
  validation_errors?: ValidationError[];
  error?: string;
  timestamp: string;
}

/* Logout Api response */
export interface LogoutApiResponse {
  success: boolean;
  message: string;
  data?: {
    logged_out_at: string;
  };
  validation_errors?: ValidationError[];
  error?: string;
  timestamp: string;
}

/* Token refresh response */
export interface RefreshTokenApiResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
  };
  validation_errors?: ValidationError[];
  error?: string;
  timestamp: string;
}

/* Reset Password Api request response */
export interface ResetPasswordApiResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: string;
    reset_at: string
  };
  validation_errors?: ValidationError[];
  error?: string;
  timestamp: string;
}

/* Forgot Password Api request response */
export interface ForgotPasswordApiResponse {
  success: boolean;
  message: string;
  data?: string;
  validation_errors?: ValidationError[];
  error?: string;
  timestamp: string;
}

/* Validate Reset Token Api request response */
export interface ValidateResetTokenApiResponse {
  success: boolean;
  message: string;
  data?: {
    token_valid: boolean,
    user_id: string;
    expires_at: string;
    created_at: string;
  };
  error?: string;
  timestamp: string;
}