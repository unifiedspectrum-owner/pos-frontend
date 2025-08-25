/* Step tracking utility for tenant management flow */

/* Step tracking keys for localStorage */
export const STEP_TRACKING_KEYS = {
  TENANT_INFO: 'tenant_step_info_completed',
  EMAIL_VERIFICATION: 'tenant_step_email_verification_completed',
  PHONE_VERIFICATION: 'tenant_step_phone_verification_completed',
  PLAN_SELECTION: 'tenant_step_plan_selection_completed',
  COMPLETED_STEPS: 'tenant_completed_steps'
} as const

/* Available step identifiers */
export type StepKey = keyof typeof STEP_TRACKING_KEYS

/* Step completion tracking utilities */
export class StepTracker {
  
  /* Mark a specific step as completed */
  static markStepCompleted(stepKey: keyof typeof STEP_TRACKING_KEYS): void {
    try {
      const storageKey = STEP_TRACKING_KEYS[stepKey]
      localStorage.setItem(storageKey, 'true')
      
      /* Update the completed steps list */
      this.updateCompletedStepsList(stepKey)
      
      console.log(`Step ${stepKey} marked as completed`)
    } catch (error) {
      console.error('Error marking step as completed:', error)
    }
  }
  
  /* Check if a specific step is completed */
  static isStepCompleted(stepKey: keyof typeof STEP_TRACKING_KEYS): boolean {
    try {
      const storageKey = STEP_TRACKING_KEYS[stepKey]
      return localStorage.getItem(storageKey) === 'true'
    } catch (error) {
      console.error('Error checking step completion:', error)
      return false
    }
  }
  
  /* Get all completed steps */
  static getCompletedSteps(): string[] {
    try {
      const completedSteps = localStorage.getItem(STEP_TRACKING_KEYS.COMPLETED_STEPS)
      return completedSteps ? JSON.parse(completedSteps) : []
    } catch (error) {
      console.error('Error getting completed steps:', error)
      return []
    }
  }
  
  /* Update the completed steps list */
  private static updateCompletedStepsList(stepKey: keyof typeof STEP_TRACKING_KEYS): void {
    try {
      const completedSteps = this.getCompletedSteps()
      if (!completedSteps.includes(stepKey)) {
        completedSteps.push(stepKey)
        localStorage.setItem(STEP_TRACKING_KEYS.COMPLETED_STEPS, JSON.stringify(completedSteps))
      }
    } catch (error) {
      console.error('Error updating completed steps list:', error)
    }
  }
  
  /* Clear a specific step completion */
  static clearStepCompletion(stepKey: keyof typeof STEP_TRACKING_KEYS): void {
    try {
      const storageKey = STEP_TRACKING_KEYS[stepKey]
      localStorage.removeItem(storageKey)
      
      /* Remove from completed steps list */
      const completedSteps = this.getCompletedSteps()
      const updatedSteps = completedSteps.filter(step => step !== stepKey)
      localStorage.setItem(STEP_TRACKING_KEYS.COMPLETED_STEPS, JSON.stringify(updatedSteps))
      
      console.log(`Step ${stepKey} completion cleared`)
    } catch (error) {
      console.error('Error clearing step completion:', error)
    }
  }
  
  /* Clear all step completions */
  static clearAllStepCompletions(): void {
    try {
      Object.values(STEP_TRACKING_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      console.log('All step completions cleared')
    } catch (error) {
      console.error('Error clearing all step completions:', error)
    }
  }
  
  /* Get step completion progress percentage */
  static getCompletionProgress(): number {
    try {
      const totalSteps = Object.keys(STEP_TRACKING_KEYS).length - 1 // Exclude COMPLETED_STEPS key
      const completedSteps = this.getCompletedSteps().length
      return Math.round((completedSteps / totalSteps) * 100)
    } catch (error) {
      console.error('Error calculating completion progress:', error)
      return 0
    }
  }
  
  /* Check if all steps are completed */
  static areAllStepsCompleted(): boolean {
    const requiredSteps: (keyof typeof STEP_TRACKING_KEYS)[] = [
      'TENANT_INFO', 
      'EMAIL_VERIFICATION', 
      'PHONE_VERIFICATION'
    ]
    
    return requiredSteps.every(step => this.isStepCompleted(step))
  }
}