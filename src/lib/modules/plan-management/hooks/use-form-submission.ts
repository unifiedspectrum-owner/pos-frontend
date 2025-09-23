import { useState, useCallback } from 'react'
import { UseFormGetValues } from 'react-hook-form'
import { CreatePlanFormData } from '@plan-management/schemas/validation/plans'
import { PlanFormMode } from '@plan-management/types/plans'
import { planService } from '@plan-management/api'
import { clearStorageData, formatFormDataToApiData } from '@plan-management/utils'
import { LOADING_DELAY, LOADING_DELAY_ENABLED } from '@shared/config'
import { PLAN_FORM_MODES } from '@plan-management/config'
import { useResourceErrors } from '@shared/contexts'
import { createToastNotification } from '@shared/utils/ui'
import { AxiosError } from 'axios'
import { handleApiError } from '@shared/utils/api'

/* Custom hook for handling form submission logic */
export const useFormSubmission = (
  mode: PlanFormMode, 
  planId: number | undefined,
  getValues: UseFormGetValues<CreatePlanFormData>,
  onSuccess?: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<any>(null)

  /* Resource error context */
  const { addError, removeError } = useResourceErrors();

  /* Handle form submission with API calls and notifications */
  const submitForm = useCallback(async (data: CreatePlanFormData) => {
    try {
      setIsSubmitting(true)
      setSubmissionError(null)
      removeError('plan-submission')
      if (LOADING_DELAY_ENABLED) await new Promise(resolve => setTimeout(resolve, LOADING_DELAY))
      
      /* Transform and submit data to appropriate endpoint */
      const apiData = formatFormDataToApiData(data)
      const response = await (mode === PLAN_FORM_MODES.CREATE 
        ? planService.createSubscriptionPlan(apiData)
        : planService.updateSubscriptionPlan(planId || parseInt(window.location.pathname.split('/').pop()!, 10), apiData))
      
      if (response?.data.success) {
        /* Handle successful submission */
        if (mode === PLAN_FORM_MODES.CREATE) {
          clearStorageData();
        }
        
        const planName = getValues('name')
        const actionText = mode === PLAN_FORM_MODES.CREATE ? 'Created' : 'Updated'
        createToastNotification({
          title: `Plan ${actionText} Successfully`,
          description: `"${planName}" has been ${actionText.toLowerCase()} ${mode === PLAN_FORM_MODES.CREATE ? 'and is ready to use' : 'with the latest changes'}.`
        })
        
        console.log(`[PlanFormSubmission] Plan ${mode === PLAN_FORM_MODES.CREATE ? 'created' : 'updated'} successfully`)
        onSuccess?.()
      } else {
        /* Handle API errors */
        const errorMessage = response?.data.message || `An error occurred while ${mode === PLAN_FORM_MODES.CREATE ? 'creating' : 'updating'} the plan.`
        console.error(`[PlanFormSubmission] Failed to ${mode} plan:`, errorMessage)
        
        const errorObj = {
          id: 'plan-submission',
          error: errorMessage,
          title: `Failed to ${mode === PLAN_FORM_MODES.CREATE ? 'Create' : 'Update'} Plan`,
          onRetry: () => submitForm(data),
          isRetrying: isSubmitting
        };
        
        setSubmissionError(errorObj);
        addError(errorObj);
      }
    } catch (error: any) {
      /* Handle unexpected errors */
      console.error(`[PlanFormSubmission] Error ${mode === PLAN_FORM_MODES.CREATE ? 'creating' : 'updating'} plan:`, error)
      const err = error as AxiosError;
      handleApiError(err, {
        title: `Failed to ${mode === PLAN_FORM_MODES.CREATE ? 'Create' : 'Update'} Plan`
      })
      let errorMessage = '';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      const errorObj = {
        id: 'plan-submission',
        error: errorMessage,
        title: `Failed to ${mode === PLAN_FORM_MODES.CREATE ? 'Create' : 'Update'} Plan`,
        onRetry: () => submitForm(data),
        isRetrying: isSubmitting
      };
      
      setSubmissionError(errorObj);
      addError(errorObj);
    } finally {
      setIsSubmitting(false)
    }
  }, [removeError, mode, planId, getValues, onSuccess, isSubmitting, addError])

  /* Get submit button text based on current state */
  const getSubmitButtonText = useCallback(() => 
    isSubmitting ? `${mode === PLAN_FORM_MODES.CREATE ? 'Creating' : 'Updating'}...` : `${mode === PLAN_FORM_MODES.CREATE ? 'Create' : 'Update'} Plan`,
    [mode, isSubmitting]
  )

  return {
    submitForm,
    isSubmitting,
    submissionError,
    getSubmitButtonText
  }
}