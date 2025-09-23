/* TypeScript interfaces for user management API contracts */

/* Shared module imports */
import { ValidationError } from "@shared/types";

/* Role module imports */
import { ModuleAssignment } from "@role-management/types";

/* User module imports */
import { UserAccountDetails, UserAccountStatistics, UserPermissions, UsersFullPermissions } from '@user-management/types';

/* API response for paginated user list */
export interface UserListApiResponse {
  success: boolean;
  message: string;
  data: {
    users: UserAccountDetails[];
  };
  pagination: {
    current_page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
}

/* User update response */
export interface UserUpdationApiResponse {
  success: boolean;
  message: string;
  data: {
    userId: number
  }
  error?: string;
}

/* API response for user deletion operation */
export interface UserDeletionApiResponse {
  success: boolean;
  message: string;
  data?: {
    deletedUserId: number;
    deletedByUserId: number;
    deletedAt: string;
    cleanupSummary: {
      userAccount: string;
      sessions: string;
      permissions: string;
      twoFactorAuth: string;
      resetTokens: string;
    };
  };
  error?: string;
  timestamp: string;
}

/* API response for single user details */
export interface UserDetailsApiResponse {
  success: boolean;
  message: string;
  data: {
    user_details: UserAccountDetails;
    user_statistics: UserAccountStatistics;
    permissions: UserPermissions[];
  };
  error?: string;
}

/* Basic user details response */
export interface UserBasicDetailsApiResponse {
  success: boolean;
  message: string;
  data: {
    user_details: UserAccountDetails
  }
  error?: string;
}

/* Request payload for creating new user account */
export interface UserCreationApiRequest {
  f_name: string;
  l_name: string;
  email: string;
  phone: string;
  role_id: number;
  module_assignments?: ModuleAssignment[];
  is_active: boolean;
}

/* Request payload for updating existing user account */
export interface UserUpdationApiRequest {
  f_name?: string;
  l_name?: string;
  email?: string;
  phone?: string;
  role_id?: number;
  module_assignments?: ModuleAssignment[];
  is_active?: boolean;
}

/* API response for user creation operation */
export interface UserCreationApiResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string
  };
  validation_errors?: ValidationError[];
  error?: string;
  timestamp: string;
}

/* User permissions summary response */
export interface UserPermissionsSummaryApiResponse {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    name: string | null;
    role_id: number;
    role_name: string;
    permissions: UsersFullPermissions[]
  };
  error?: string;
  timestamp?: string;
}