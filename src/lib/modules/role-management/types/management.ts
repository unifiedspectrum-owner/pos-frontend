/* TypeScript interfaces for role management data structures */

import { PaginationInfo, ValidationError } from "@/lib/shared";

/* Role information for listing */
export interface Role {
  id: number;
  name: string;
  code: string;
  display_name: string;
  description: string;
  display_order: number;
  user_count: number;
  is_active: boolean;
  created_at: string;
}

/* Paginated role listing response */
export interface RoleListApiResponse {
  success: boolean;
  message: string;
  data: {
    roles: Role[];
  }
  pagination: PaginationInfo;
}


/* API response for user deletion operation */
export interface RoleDeletionApiResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string
  };
  error?: string;
  timestamp: string;
}

/* API response for role creation operation */
export interface RoleCreationApiResponse {
  success: boolean;
  message: string;
  data?: {
    roleId: string
  };
  validation_errors?: ValidationError[];
  error?: string;
  timestamp: string;
}

/* Request payload for creating new role */
export interface RoleCreationApiRequest {
  name: string;
  code: string;
  display_name: string;
  description: string;
  is_active: boolean;
}