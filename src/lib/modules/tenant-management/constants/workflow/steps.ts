/* React and external library imports */
import { IconType } from "react-icons"
import { FaBuilding, FaClipboardList, FaCheckCircle, FaCreditCard, FaPuzzlePiece, FaExclamationTriangle, FaTrophy } from "react-icons/fa"

/* Tenant module imports */
import { TenantAccountCreationStepType } from "@tenant-management/types"

/* Step identifiers for tenant account creation flow */
export const STEP_IDS = {
  TENANT_INFO: 'tenant-info',
  PLAN_SELECTION: 'plan-selection',
  ADDON_SELECTION: 'addon-selection',
  PLAN_SUMMARY: 'plan-summary',
  PAYMENT: 'payment',
  PAYMENT_FAILED: 'payment-failed',
  SUCCESS: 'success'
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
    label: 'Create Your Account',
    title: 'Create Your Account',
    description: 'Enter your company and contact information',
    icon: FaBuilding
  },
  {
    id: STEP_IDS.PLAN_SELECTION,
    label: 'Plan Selection',
    title: 'Choose Your Plan',
    description: 'Select a subscription plan for your account',
    icon: FaClipboardList
  },
  {
    id: STEP_IDS.ADDON_SELECTION,
    label: 'Add-on Selection',
    title: 'Select Add-ons',
    description: 'Choose additional features and services',
    icon: FaPuzzlePiece
  },
  {
    id: STEP_IDS.PLAN_SUMMARY,
    label: 'Summary',
    title: 'Plan Summary',
    description: 'Review your selected plan and addons',
    icon: FaCheckCircle
  },
  {
    id: STEP_IDS.PAYMENT,
    label: 'Payment',
    title: 'Payment Information',
    description: 'Enter payment details to complete setup',
    icon: FaCreditCard
  },
  {
    id: STEP_IDS.PAYMENT_FAILED,
    label: 'Payment Failed',
    title: 'Payment Failed',
    description: 'Payment processing encountered an error',
    icon: FaExclamationTriangle
  },
  {
    id: STEP_IDS.SUCCESS,
    label: 'Complete',
    title: 'Account Setup Complete',
    description: 'Your account has been successfully created',
    icon: FaTrophy
  }
]