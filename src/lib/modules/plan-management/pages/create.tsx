"use client"

import React from 'react'
import PlanFormContainer from '@plan-management/forms/form-container'
import { PLAN_FORM_MODES } from '@plan-management/config'
import { ResourceErrorProvider } from '@shared/contexts'

/* Page component for creating new subscription plans */
const CreatePlan: React.FC = () => {
  return (
    <ResourceErrorProvider>
      <PlanFormContainer mode={PLAN_FORM_MODES.CREATE} />
    </ResourceErrorProvider>
  )
}

export default CreatePlan