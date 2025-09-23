'use client';

/* Libraries imports */
import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/* RBAC module imports */
import { ClientRouteGuard } from './client-route-guard';

/* Global route guard component props */
interface AdminRouteGuardProps {
  children: ReactNode;
}

/* Global route guard that automatically protects all admin routes */
export const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  const pathname = usePathname();

  /* Only apply route protection to admin routes */
  if (pathname.includes('/admin/')) {
    return (
      <ClientRouteGuard pathname={pathname}>
        {children}
      </ClientRouteGuard>
    );
  }

  /* For non-admin routes, render children directly */
  return <>{children}</>;
};