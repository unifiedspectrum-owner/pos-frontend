"use client"

/* React and form management imports */
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

/* Shared module imports */
import { ResourceErrorProvider } from '@shared/contexts'

/* Plan management module imports */
import PlanFormContainer from '@plan-management/forms/form-container'
import { PLAN_FORM_MODES, PLAN_FORM_DEFAULT_VALUES } from '@plan-management/constants'
import { createPlanSchema, CreatePlanFormData } from '@plan-management/schemas'
import { PlanFormModeProvider } from '@plan-management/contexts'

/* Props interface for view plan page */
interface ViewPlanPageProps {
  planId: number /* ID of the plan to view */
}

/* Page component for viewing subscription plans in read-only mode */
const ViewPlanPage: React.FC<ViewPlanPageProps> = ({ planId }) => {
  /* React Hook Form setup with Zod validation */
  const methods = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    mode: 'onChange',
    defaultValues: PLAN_FORM_DEFAULT_VALUES
  })

  return (
    <ResourceErrorProvider>
      <PlanFormModeProvider mode={PLAN_FORM_MODES.VIEW} planId={planId}>
        <FormProvider {...methods}>
          <PlanFormContainer />
        </FormProvider>
      </PlanFormModeProvider>
    </ResourceErrorProvider>
  )
}

export default ViewPlanPage