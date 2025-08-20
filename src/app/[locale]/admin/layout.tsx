import AdminLayout from '@/lib/shared/layouts/admin';
import React from 'react'

const SaaSAdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}

export default SaaSAdminLayout