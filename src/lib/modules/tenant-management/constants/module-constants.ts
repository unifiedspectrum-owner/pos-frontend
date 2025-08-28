/* React and external library imports */
import { IconType } from "react-icons"
import { FaBuilding, FaClipboardList, FaShieldAlt, FaCheckCircle } from "react-icons/fa"

/* Tenant module imports */
import { PlanBillingCycle, TenantAccountCreationStepType } from "@tenant-management/types"

export const PLAN_BILLING_CYCLES: PlanBillingCycle[] =  ['monthly', 'yearly'];

/* Step identifiers for tenant account creation flow */
export const STEP_IDS = {
  TENANT_INFO: 'tenant-info',
  VERIFICATION: 'verification', 
  PLAN_SELECTION: 'plan-selection',
  PLAN_SUMMARY: 'plan-summary'
} as const

/* Interface defining step configuration properties */
export interface TenantAccountCreationSteps {
  id: TenantAccountCreationStepType
  label: string
  title: string
  description: string
  icon: IconType
}

/* Complete step configuration for tenant account creation wizard */
export const TENANT_CREATION_STEPS: TenantAccountCreationSteps[] = [
  {
    id: STEP_IDS.TENANT_INFO,
    label: 'Company Details',
    title: 'Company Details',
    description: 'Enter your company and contact information',
    icon: FaBuilding
  },
  {
    id: STEP_IDS.VERIFICATION,
    label: 'Verification',
    title: 'Verify Account',
    description: 'Verify your email and phone number',
    icon: FaShieldAlt
  },
  {
    id: STEP_IDS.PLAN_SELECTION,
    label: 'Plan Selection',
    title: 'Choose Your Plan',
    description: 'Select a subscription plan for your account',
    icon: FaClipboardList
  },
  {
    id: STEP_IDS.PLAN_SUMMARY,
    label: 'Summary',
    title: 'Plan Summary',
    description: 'Review your selected plan and addons',
    icon: FaCheckCircle
  }
]