/* Core role management entity interfaces */

/* Role information for listing and management */
export interface Role {
  id: number;
  name: string;
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
  description: string;
  display_order: number;
  is_active: boolean;
}

/* Module assignment configuration */
export interface ModuleAssignment {
  module_id: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

/* Role permission information with module details */
export interface RolePermission {
  id: number;
  role_id: number;
  module_id: number;
  can_create: number | boolean;
  can_read: number | boolean;
  can_update: number | boolean;
  can_delete: number | boolean;
  display_order: number;
}