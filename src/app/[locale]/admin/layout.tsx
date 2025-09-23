/* Libraries imports */
import React from 'react';

/* Shared module imports */
import { PermissionProvider } from '@shared/contexts';
import { AdminRouteGuard } from '@shared/components/rbac';
import AdminLayout from '@/lib/shared/layouts/admin';

/* Admin layout component with RBAC protection and permission management */
const SaaSAdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    /* Permission context provider for user authorization */
    <PermissionProvider>
      {/* Route guard for admin area protection */}
      <AdminRouteGuard>
        {/* Admin UI layout with sidebar and navigation */}
        <AdminLayout>
          {children}
        </AdminLayout>
      </AdminRouteGuard>
    </PermissionProvider>
  );
};

export default SaaSAdminLayout;