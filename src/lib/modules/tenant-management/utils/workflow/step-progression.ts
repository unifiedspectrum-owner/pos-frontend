/* Tenant module imports */
import { STEP_IDS } from '@tenant-management/constants'
import { TenantAccountCreationStepType } from '@tenant-management/types/ui'
import { CachedPlanData } from '@tenant-management/types/subscription'

/* Calculate next step based on current completion state */
export const calculateStepProgression = (
  isBasicInfoComplete: boolean,
  isVerificationComplete: boolean,
  assignedPlanData: CachedPlanData | null,
  paymentSucceeded: boolean,
  planSummaryCompleted: boolean
): { targetStep: TenantAccountCreationStepType; completedSteps: Set<TenantAccountCreationStepType> } => {
  const completedSteps = new Set<TenantAccountCreationStepType>()

  /* Stay on tenant info if prerequisites not met */
  if (!isBasicInfoComplete || !isVerificationComplete) {
    return { targetStep: STEP_IDS.TENANT_INFO, completedSteps }
  }

  /* Basic info and verification complete */
  completedSteps.add(STEP_IDS.TENANT_INFO)

  /* Check if plan is assigned */
  if (!assignedPlanData) {
    return { targetStep: STEP_IDS.PLAN_SELECTION, completedSteps }
  }

  /* Plan is assigned */
  completedSteps.add(STEP_IDS.PLAN_SELECTION)

  /* Check if addons are configured */
  if (assignedPlanData.selectedAddons === undefined) {
    return { targetStep: STEP_IDS.ADDON_SELECTION, completedSteps }
  }

  /* Addons are configured */
  completedSteps.add(STEP_IDS.ADDON_SELECTION)

  /* Check if ready for payment */
  if (planSummaryCompleted) {
    completedSteps.add(STEP_IDS.PLAN_SUMMARY)
    return { targetStep: STEP_IDS.PAYMENT, completedSteps }
  }

  /* Check payment status */
  if (paymentSucceeded) {
    completedSteps.add(STEP_IDS.PAYMENT)
    return { targetStep: STEP_IDS.SUCCESS, completedSteps }
  }

  /* Default to plan summary */
  return { targetStep: STEP_IDS.PLAN_SUMMARY, completedSteps }
}