/* Paginated user listing response */
export interface UserListApiResponse {
  success: boolean;
  message: string;
  data: {
    users: UserWithDetails[];
  }
  pagination: {
    current_page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
}

/* User with login statistics and creator information for listing */
export interface UserWithDetails {
  id: number;
  f_name: string;
  l_name: string;
  email: string;
  phone?: string;
  profile_image_url?: string;
  user_status: string;
  email_verified: boolean;
  phone_verified: boolean;
  email_verified_at?: string;
  phone_verified_at?: string;
  account_locked_until?: string;
  user_created_at: string;
  user_updated_at: string;

  total_logins?: number;
  successful_logins?: number;
  failed_logins?: number;
  last_successful_login_at?: string;
  active_sessions?: number;
  max_concurrent_sessions?: number;

  role_id: number;
  role_name: string;
  role_code: string;
  role_display_name: string;
}