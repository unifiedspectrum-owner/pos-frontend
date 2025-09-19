/* Shared module imports */
import { ValidationError } from "@/lib/shared";

/* Role module imports */
import { Role, ModuleAssignments } from "@role-management/types";

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

/* User account data with profile and security information */
export interface UserAccountDetails {
  id: number;
  f_name: string;
  l_name: string;
  email: string;
  phone: string;
  profile_image_url: string | null;
  user_status: string;
  email_verified: boolean;
  phone_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  last_password_change: string | null;
  account_locked_until: string | null;
  user_created_at: string;
  user_updated_at: string;
  is_active: boolean;
  role_details: Role | null;
}

/* User activity and login statistics */
export interface UserAccountStatistics {
  total_logins: number;
  successful_logins: number;
  failed_logins: number;
  consecutive_failed_attempts: number;
  first_login_at: string | null;
  last_successful_login_at: string | null;
  last_failed_login_at: string | null;
  last_login_ip: string | null;
  last_user_agent: string | null;
  last_device_fingerprint: string | null;
  active_sessions: number;
  max_concurrent_sessions: number;
  password_changes_count: number;
  account_lockouts_count: number;
  last_lockout_at: string | null;
}

/* User module permissions with role and direct access rights */
export interface UserPermissions {
  module_id: number;
  module_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  permission_expires_at: string;
}

/* Request payload for creating new user account */
export interface UserCreationApiRequest {
  f_name: string;
  l_name: string;
  email: string;
  phone: string;
  role_id: number;
  module_assignments?: ModuleAssignments[];
  is_active: boolean;
}

/* Request payload for updating existing user account */
export interface UserUpdationApiRequest {
  f_name?: string;
  l_name?: string;
  email?: string;
  phone?: string;
  role_id?: number;
  module_assignments?: ModuleAssignments[];
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