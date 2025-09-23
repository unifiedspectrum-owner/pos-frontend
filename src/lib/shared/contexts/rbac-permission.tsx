'use client';

/* Libraries imports */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AxiosError } from 'axios';

/* Shared module imports */
import { handleApiError } from '@shared/utils/api';
import { PermissionTypes } from '@shared/types/validation';

/* User module imports */
import { userManagementService } from '@user-management/api';
import { UsersFullPermissions } from '@user-management/types';

/* Permission context interface */
interface PermissionContextType {
  permissions: UsersFullPermissions[];
  loading: boolean;
  error: string | null;
  hasModuleAccess: (moduleCode: string) => boolean;
  hasSpecificPermission: (moduleCode: string, permission: PermissionTypes) => boolean;
  refreshPermissions: () => Promise<void>;
}

/* Create permission context */
const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

/* Permission provider component */
export const PermissionProvider = ({ children }: { children: ReactNode }) => {
  const [permissions, setPermissions] = useState<UsersFullPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  /* Fetch permissions from API */
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[PermissionProvider] Fetching permissions for route:', pathname);

      const response = await userManagementService.getUserPermissions();
      if (response?.data?.permissions) {
        console.log('[PermissionProvider] Permissions loaded:', response.data.permissions);
        setPermissions(response.data.permissions);
      } else {
        console.log('[PermissionProvider] No permissions found in response');
        setPermissions([]);
      }
    } catch (error) {
      console.error('[PermissionProvider] Error fetching permissions:', error);
      const err = error as AxiosError;
      handleApiError(err, {
        title: "Failed to fetch permissions"
      })
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [pathname]);

  /* Check if user has access to a module */
  const hasModuleAccess = (moduleCode: string): boolean => {
    const modulePermission = permissions.find(p => p.module_code === moduleCode);
    if (!modulePermission) return false;

    return modulePermission.role_can_read || modulePermission.user_can_read ||
           modulePermission.role_can_create || modulePermission.user_can_create ||
           modulePermission.role_can_update || modulePermission.user_can_update ||
           modulePermission.role_can_delete || modulePermission.user_can_delete;
  };

  /* Check if user has specific permission for a module */
  const hasSpecificPermission = (moduleCode: string, permission: PermissionTypes): boolean => {
    const modulePermission = permissions.find(p => p.module_code === moduleCode);
    if (!modulePermission) return false;

    switch (permission) {
      case 'CREATE':
        return modulePermission.role_can_create || modulePermission.user_can_create;
      case 'READ':
        return modulePermission.role_can_read || modulePermission.user_can_read;
      case 'UPDATE':
        return modulePermission.role_can_update || modulePermission.user_can_update;
      case 'DELETE':
        return modulePermission.role_can_delete || modulePermission.user_can_delete;
      default:
        return false;
    }
  };

  /* Refresh permissions manually */
  const refreshPermissions = async () => {
    await fetchPermissions();
  };

  /* Fetch permissions on route change */
  useEffect(() => {
    console.log('[PermissionProvider] Route changed to:', pathname);
    fetchPermissions();
  }, [pathname, fetchPermissions]);

  const contextValue: PermissionContextType = {
    permissions,
    loading,
    error,
    hasModuleAccess,
    hasSpecificPermission,
    refreshPermissions
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

/* Hook to use permission context */
export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};