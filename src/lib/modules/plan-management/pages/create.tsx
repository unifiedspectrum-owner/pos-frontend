"use client"

/* React and Chakra UI component imports */
import React from 'react'

/* Shared module imports */
import { ResourceErrorProvider } from '@shared/contexts'

/* Plan module imports */
import PlanFormContainer from '@plan-management/forms/form-container'
import { PLAN_FORM_MODES } from '@plan-management/config'

/* Page component for creating new subscription plans */
const CreatePlan: React.FC = () => {
  return (
    <ResourceErrorProvider>
      <PlanFormContainer mode={PLAN_FORM_MODES.CREATE} />
    </ResourceErrorProvider>
  )
}

export default CreatePlan