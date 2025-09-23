import { PermissionTypes } from "@shared/types/validation";

export const PERMISSION_ACTIONS = {
  CREATE: 'CREATE',
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE"
} as const satisfies Record<string, PermissionTypes>;