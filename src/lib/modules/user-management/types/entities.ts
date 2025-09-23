/* TypeScript interfaces for user domain entities */

/* Role module imports */
import { Role } from "@role-management/types";

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

/* User permissions combining role and direct permissions */
export interface UsersFullPermissions {
  module_name: string;
  module_id: string;
  module_code: string;
  role_can_create: boolean;
  role_can_read: boolean;
  role_can_update: boolean;
  role_can_delete: boolean;

  user_can_create: boolean;
  user_can_read: boolean;
  user_can_update: boolean;
  user_can_delete: boolean;
}