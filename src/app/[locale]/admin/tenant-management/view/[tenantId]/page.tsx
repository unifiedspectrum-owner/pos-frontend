'use client';

import { useParams } from 'next/navigation';
import { TenantDetailsPage } from '@tenant-management/pages';

const TenantDetailsRoute = () => {
  const params = useParams();
  const tenantId = params.tenantId as string;

  if (!tenantId || typeof tenantId !== 'string') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Tenant ID</h1>
          <p className="text-gray-600">The tenant ID provided is not valid.</p>
        </div>
      </div>
    );
  }

  return <TenantDetailsPage tenantId={tenantId} />;
};

export default TenantDetailsRoute;