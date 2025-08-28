"use client"

import React from 'react';
import PlanFormContainer from '@plan-management/forms/form-container'
import { PLAN_FORM_MODES } from '@plan-management/config';
import { ResourceErrorProvider } from '@shared/contexts';

/* Props interface for edit plan page */
interface EditPlanPageProps {
  planId: number /* ID of the plan to edit */
}

/* Page component for editing existing subscription plans */
const EditPlanPage: React.FC<EditPlanPageProps> = ({ planId }) => {
  return (
    <ResourceErrorProvider>
      <PlanFormContainer mode={PLAN_FORM_MODES.EDIT} planId={planId} />{/* Render form in edit mode */}
    </ResourceErrorProvider>
  )
}

export default EditPlanPage;