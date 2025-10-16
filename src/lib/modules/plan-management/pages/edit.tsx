"use client"

/* React and form management imports */
import { useCallback } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

/* Shared module imports */
import { ResourceErrorProvider } from '@shared/contexts'
import { createToastNotification } from '@shared/utils/ui'

/* Plan management module imports */
import PlanFormContainer from '@plan-management/forms/form-container'
import { PLAN_FORM_MODES, PLAN_FORM_DEFAULT_VALUES, PLAN_PAGE_ROUTES } from '@plan-management/constants'
import { createPlanSchema, CreatePlanFormData } from '@plan-management/schemas'
import { usePlanOperations } from '@plan-management/hooks'
import { formatFormDataToApiData } from '@plan-management/utils'
import { PlanFormModeProvider } from '@plan-management/contexts'

/* Props interface for edit plan page */
interface EditPlanPageProps {
  planId: number /* ID of the plan to edit */
}

/* Page component for editing existing subscription plans */
const EditPlanPage: React.FC<EditPlanPageProps> = ({ planId }) => {
  /* Next.js router for navigation */
  const router = useRouter()

  /* Plan operations hook */
  const { updatePlan, isUpdating } = usePlanOperations()

  /* React Hook Form setup with Zod validation */
  const methods = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    mode: 'onChange',
    defaultValues: PLAN_FORM_DEFAULT_VALUES
  })

  /* Handle form submission */
  const handleFormSubmit = useCallback(async (data: CreatePlanFormData) => {
    /* Transform form data to API format */
    const apiData = formatFormDataToApiData(data)

    /* Call update operation */
    const success = await updatePlan(planId, apiData)

    if (success) {
      const planName = data.name
      createToastNotification({
        title: 'Plan Updated Successfully',
        description: `"${planName}" has been updated with the latest changes.`
      })

      console.log('[EditPlan] Plan updated successfully')
      router.push(PLAN_PAGE_ROUTES.HOME)
    }
  }, [updatePlan, planId, router])

  return (
    <ResourceErrorProvider>
      <PlanFormModeProvider mode={PLAN_FORM_MODES.EDIT} planId={planId}>
        <FormProvider {...methods}>
          <PlanFormContainer
            onSubmit={handleFormSubmit}
            isSubmitting={isUpdating}
          />
        </FormProvider>
      </PlanFormModeProvider>
    </ResourceErrorProvider>
  )
}

export default EditPlanPage