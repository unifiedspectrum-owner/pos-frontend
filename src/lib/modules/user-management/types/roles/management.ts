/* TypeScript interfaces for role management data structures */

import { PaginationInfo } from "@/lib/shared";

/* Role information for listing */
export interface Role {
  id: number;
  name: string;
  code: string;
  display_name: string;
  description: string;
  display_order: number;
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