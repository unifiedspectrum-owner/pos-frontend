/* API request and response interfaces */

/* Shared module imports */
import { PaginationInfo, ValidationError } from '@shared/types'

/* Role management module imports */
import { Role, Module, ModuleAssignment, RolePermission } from '@role-management/types'

/* API Request Interfaces */

/* Payload for creating new role with basic info and permissions */
export interface RoleCreationRequest {
  name: string;
  description: string;
  is_active: boolean;
  module_assignments?: ModuleAssignment[];
}

/* Payload for updating existing role with partial data */
export interface RoleUpdateRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  module_assignments?: ModuleAssignment[];
}

/* API Response Interfaces */

/* Paginated list of roles with metadata */
export interface RoleListResponse {
  success: boolean;
  message: string;
  data: {
    roles: Role[];
  }
  pagination: PaginationInfo;
}

/* Paginated list of available modules */
export interface ModulesListResponse {
  success: boolean;
  message: string;
  data: {
    modules: Module[];
  };
  pagination: PaginationInfo;
}

/* List of role permissions without pagination */
export interface RolePermissionsListResponse {
  success: boolean;
  message: string;
  data: {
    permissions: RolePermission[];
  };
  error?: string;
  timestamp?: string;
}

/* Response after successful role creation */
export interface RoleCreationResponse {
  success: boolean;
  message: string;
  data?: {
    roleId: string
  };
  validation_errors?: ValidationError[];
  error?: string;
  timestamp: string;
}

/* Response after role update operation */
export interface RoleUpdateResponse {
  success: boolean;
  message: string;
  data?: {
    roleId: string
  };
  validation_errors?: ValidationError[];
  error?: string;
  timestamp: string;
}

/* Response after role deletion operation */
export interface RoleDeletionResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string
  };
  error?: string;
  timestamp: string;
}

/* Response containing role details and associated permissions */
export interface RoleDetailsResponse {
  success: boolean;
  message: string;
  data?: {
    role: Role;
    permissions: RolePermission[]
  };
  error?: string;
  timestamp: string;
}