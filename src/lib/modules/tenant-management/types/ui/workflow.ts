/* TypeScript interfaces for UI workflow data structures */

/* Workflow steps for tenant account creation process */
export type TenantAccountCreationStepType = 'tenant-info' | 'plan-selection' | 'addon-selection' | 'plan-summary' | 'payment' | 'payment-failed' | 'success'