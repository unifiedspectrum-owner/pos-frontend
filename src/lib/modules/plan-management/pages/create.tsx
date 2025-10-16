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
import { formatFormDataToApiData, clearStorageData } from '@plan-management/utils'
import { PlanFormModeProvider } from '@plan-management/contexts'

/* Page component for creating new subscription plans */
const CreatePlan: React.FC = () => {
  /* Next.js router for navigation */
  const router = useRouter()

  /* Plan operations hook */
  const { createPlan, isCreating } = usePlanOperations()

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

    /* Call create operation */
    const success = await createPlan(apiData)

    if (success) {
      /* Clear storage data on successful creation */
      clearStorageData()

      const planName = data.name
      createToastNotification({
        title: 'Plan Created Successfully',
        description: `"${planName}" has been created and is ready to use.`
      })

      console.log('[CreatePlan] Plan created successfully')
      router.push(PLAN_PAGE_ROUTES.HOME)
    }
  }, [createPlan, router])

  return (
    <ResourceErrorProvider>
      <PlanFormModeProvider mode={PLAN_FORM_MODES.CREATE}>
        <FormProvider {...methods}>
          <PlanFormContainer
            onSubmit={handleFormSubmit}
            isSubmitting={isCreating}
          />
        </FormProvider>
      </PlanFormModeProvider>
    </ResourceErrorProvider>
  )
}

export default CreatePlan
