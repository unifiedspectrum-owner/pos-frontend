'use client';

/* Libraries imports */
import React, { ReactNode, useEffect, useState, useRef } from 'react';

/* Shared module imports */
import { usePermissions } from '@shared/contexts';
import { FullPageLoader } from '@shared/components/common';
import { getRoutePermission } from '@shared/config';
import AdminLayout from '@shared/layouts/admin';

/* RBAC module imports */
import { ForbiddenPage } from './forbidden-page';

/* Client route guard component props */
interface ClientRouteGuardProps {
  children: ReactNode;
  pathname: string; /* Current route pathname */
}

/* Client-side route guard that checks permissions after page load */
export const ClientRouteGuard = ({ children, pathname }: ClientRouteGuardProps) => {
  const { loading, error, hasModuleAccess, hasSpecificPermission } = usePermissions();
  const [isChecking, setIsChecking] = useState(true);
  const hasInitialLoadRef = useRef(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [deniedModule, setDeniedModule] = useState<string>('');
  const [deniedPermission, setDeniedPermission] = useState<string>('');

  useEffect(() => {
    const checkPermissions = async () => {
      console.log('[ClientRouteGuard] checkPermissions called:', { loading, pathname, hasInitialLoad: hasInitialLoadRef.current });

      /* Don't check permissions while still loading */
      if (loading) {
        console.log('[ClientRouteGuard] Still loading, returning early');
        return;
      }

      /* For subsequent navigations after initial load, skip the checking state */
      if (hasInitialLoadRef.current) {
        console.log('[ClientRouteGuard] Has initial load, setting isChecking to false');
        setIsChecking(false);
      }

      /* Get route permission requirements */
      const routePermission = getRoutePermission(pathname);

      /* If no permission required, allow access */
      if (!routePermission) {
        setIsChecking(false);
        setAccessDenied(false);
        hasInitialLoadRef.current = true;
        return;
      }

      /* Check if user has required module access */
      if (!hasModuleAccess(routePermission.module)) {
        console.log(`[ClientRouteGuard] Access denied for module: ${routePermission.module}`);
        setDeniedModule(routePermission.module);
        setDeniedPermission('');
        setAccessDenied(true);
        setIsChecking(false);
        hasInitialLoadRef.current = true;
        return;
      }

      /* Check if user has specific permission */
      if (!hasSpecificPermission(routePermission.module, routePermission.permission)) {
        console.log(`[ClientRouteGuard] Access denied for ${routePermission.module}:${routePermission.permission}`);
        setDeniedModule(routePermission.module);
        setDeniedPermission(routePermission.permission);
        setAccessDenied(true);
        setIsChecking(false);
        hasInitialLoadRef.current = true;
        return;
      }

      /* Access granted */
      console.log(`[ClientRouteGuard] Access granted for ${routePermission.module}:${routePermission.permission}`);
      setAccessDenied(false);
      setIsChecking(false);
      hasInitialLoadRef.current = true;
    };

    checkPermissions();
  }, [loading, pathname, hasModuleAccess, hasSpecificPermission]);

  /* Show loading state only on initial load - not during navigation */
  if (loading && isChecking && !hasInitialLoadRef.current) {
    console.log('[ClientRouteGuard] Showing FullPageLoader:', { loading, isChecking, hasInitialLoad: hasInitialLoadRef.current, pathname });
    return <FullPageLoader />;
  }

  /* Show error state if permission fetching failed */
  if (error) {
    const errorPage = (
      <ForbiddenPage
        customMessage={`Permission verification failed: ${error}`}
      />
    );

    /* Wrap with AdminLayout for admin routes */
    if (pathname.includes('/admin/')) {
      return <AdminLayout>{errorPage}</AdminLayout>;
    }

    return errorPage;
  }

  /* Show 403 page if access denied */
  if (accessDenied) {
    const forbiddenPage = (
      <ForbiddenPage
        module={deniedModule}
        permission={deniedPermission}
      />
    );

    /* Wrap with AdminLayout for admin routes */
    if (pathname.includes('/admin/')) {
      return <AdminLayout>{forbiddenPage}</AdminLayout>;
    }

    return forbiddenPage;
  }

  /* Render children if all checks pass */
  return <>{children}</>;
};