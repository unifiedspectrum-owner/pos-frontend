"use client"

import React from 'react';
import PlanFormContainer from '@plan-management/forms/form-container'
import { PLAN_FORM_MODES } from '@plan-management/config';
import { ResourceErrorProvider } from '@shared/contexts';

/* Props interface for view plan page */
interface ViewPlanPageProps {
  planId: number /* ID of the plan to view */
}

/* Page component for viewing subscription plans in read-only mode */
const ViewPlanPage: React.FC<ViewPlanPageProps> = ({ planId }) => {
  return (
    <ResourceErrorProvider>
      <PlanFormContainer mode={PLAN_FORM_MODES.VIEW} planId={planId} />
    </ResourceErrorProvider>
  )
}

export default ViewPlanPage;