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

/* Module information for system management */
export interface Module {
  id: number;
  name: string;
  code: string;
  display_name: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

/* Modules list response */
export interface ModulesListApiResponse {
  success: boolean;
  message: string;
  data: {
    modules: Module[];
  };
  pagination: PaginationInfo;
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
  module_assignments?: ModuleAssignments[];
}

export interface ModuleAssignments {
  module_id: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

/* Request payload for updating existing role */
export interface RoleUpdationApiRequest {
  name?: string;
  code?: string;
  display_name?: string;
  description?: string;
  is_active?: boolean;
  module_assignments?: ModuleAssignments[];
}

/* API response for role update operation */
export interface RoleUpdationApiResponse {
  success: boolean;
  message: string;
  data?: {
    roleId: string
  };
  validation_errors?: ValidationError[];
  error?: string;
  timestamp: string;
}

/* API response for role details fetch operation */
export interface RoleDetailsApiResponse {
  success: boolean;
  message: string;
  data?: { 
    role: Role;
    permissions:  RolePermission[]
  };
  error?: string;
  timestamp: string;
}

/* Role permission information with module details */ 
export interface RolePermission {
  id: number;
  role_id: number;
  module_id: number;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  display_order: number;
}