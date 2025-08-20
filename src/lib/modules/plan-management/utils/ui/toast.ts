/* Toast notification utilities for consistent UI feedback */

export interface ToastConfig {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description: string
  duration?: number
  closable?: boolean
}

/* Create standardized toast notification configuration */
export const createToastNotification = (
  type: 'success' | 'error' | 'warning' | 'info', 
  title: string, 
  description: string
): ToastConfig => ({
  type,
  title,
  description,
  duration: type === 'error' ? 7000 : 5000,
  closable: true,
})

/* Predefined toast configurations for common scenarios */
export const TOAST_PRESETS = {
  /* Success messages */
  PLAN_CREATED: (planName: string) => createToastNotification(
    'success',
    'Plan Created Successfully',
    `"${planName}" has been created and is ready to use.`
  ),
  
  PLAN_UPDATED: (planName: string) => createToastNotification(
    'success', 
    'Plan Updated Successfully',
    `"${planName}" has been updated with the latest changes.`
  ),
  
  PLAN_DELETED: (planName: string) => createToastNotification(
    'success',
    'Plan Deleted Successfully', 
    `"${planName}" has been deleted successfully.`
  ),

  /* Error messages */
  PLAN_CREATE_ERROR: (message?: string) => createToastNotification(
    'error',
    'Failed to Create Plan',
    message || 'An error occurred while creating the plan.'
  ),
  
  PLAN_UPDATE_ERROR: (message?: string) => createToastNotification(
    'error', 
    'Failed to Update Plan',
    message || 'An error occurred while updating the plan.'
  ),
  
  PLAN_DELETE_ERROR: (message?: string) => createToastNotification(
    'error',
    'Failed to Delete Plan',
    message || 'An error occurred while deleting the plan.'
  ),

  UNEXPECTED_ERROR: createToastNotification(
    'error',
    'Unexpected Error',
    'An unexpected error occurred. Please try again.'
  ),

  /* Auto-save messages */
  DATA_SAVED: createToastNotification(
    'success',
    'Data Saved',
    'Your changes have been saved automatically.'
  ),

  DATA_RESTORED: createToastNotification(
    'success',
    'Data Restored',
    'Your draft data has been restored successfully.'
  ),
} as const