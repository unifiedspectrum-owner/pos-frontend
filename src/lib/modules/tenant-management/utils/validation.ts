/* Tenant plan and branch validation utilities */

/* Plan module imports */
import { Plan } from '@plan-management/types'

/* Validation result interface with optional error message */
export interface ValidationResult {
  isValid: boolean
  message?: string
}

/* Validate that a plan has been selected */
export const validatePlanSelection = (selectedPlan: Plan | null): ValidationResult => {
  if (!selectedPlan) {
    return {
      isValid: false,
      message: 'Please select a plan to continue'
    }
  }
  
  return { isValid: true }
}

/* Validate branch count against minimum and maximum limits */
export const validateBranchCount = (branchCount: number, maxBranches?: number | null): ValidationResult => {
  /* Check minimum branch requirement */
  if (branchCount < 1) {
    return {
      isValid: false,
      message: 'Branch count must be at least 1'
    }
  }
  
  /* Check maximum branch limit if specified */
  if (maxBranches && branchCount > maxBranches) {
    return {
      isValid: false,
      message: `Branch count cannot exceed ${maxBranches}`
    }
  }
  
  return { isValid: true }
}