/* React Icons type and icon imports */
import { IconType } from "react-icons"
import { FaBuilding, FaClipboardList, FaShieldAlt } from "react-icons/fa"
import { TenantAccountCreationStepType } from "../types"

/* Step identifiers for tenant account creation flow */
export const STEP_IDS = {
  TENANT_INFO: 'tenant-info',
  VERIFICATION: 'verification', 
  PLAN_SELECTION: 'plan-selection'
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
  }
]