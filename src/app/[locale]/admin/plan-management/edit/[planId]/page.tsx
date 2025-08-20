'use client';

import { useParams } from 'next/navigation';
import EditPlanPage from '@plan-management/pages/edit';

const EditPlanRoute = () => {
  const params = useParams();
  const planId = parseInt(params.planId as string, 10);

  if (isNaN(planId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Plan ID</h1>
          <p className="text-gray-600">The plan ID provided is not valid.</p>
        </div>
      </div>
    );
  }

  return <EditPlanPage planId={planId} />;
};

export default EditPlanRoute;