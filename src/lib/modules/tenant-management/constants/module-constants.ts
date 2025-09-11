/* React and external library imports */
import { IconType } from "react-icons"
import { FaBuilding, FaClipboardList, FaCheckCircle, FaCreditCard, FaPuzzlePiece, FaExclamationTriangle, FaTrophy } from "react-icons/fa"

/* Tenant module imports */
import { PlanBillingCycle, TenantAccountCreationStepType } from "@tenant-management/types"
import { TenantInfoFormData } from "@tenant-management/schemas/account";
import { VerificationConfig } from "@tenant-management/hooks/account/creation";

export const PLAN_BILLING_CYCLE = {
  MONTHLY: "monthly",
  YEARLY: "yearly"
} satisfies Record<string, PlanBillingCycle>

export const ADDON_PRICING_SCOPE = {
  ORGANIZATION: "organization",
  BRANCH: "branch"
}

export const PLAN_BILLING_CYCLES: PlanBillingCycle[] =  [PLAN_BILLING_CYCLE.MONTHLY, PLAN_BILLING_CYCLE.YEARLY];

/* Maximum number of branches allowed per account (system limit) */
export const MAX_BRANCH_COUNT = 100;

/* Plan data cache configuration */
export const PLANS_CACHE_CONFIG = {
  KEY: 'cached_subscription_plans',
  TIMESTAMP_KEY: 'cached_subscription_plans_timestamp',
  DURATION: 5 * 60 * 1000 /* 5 minutes */
} as const;

/* LocalStorage keys for tenant account creation process */
export const TENANT_ACCOUNT_CREATION_LS_KEYS = {
  TENANT_ID: 'tenant_id',
  TENANT_FORM_DATA: 'tenant_form_data',
  TENANT_VERIFICATION_DATA: 'tenant_verification_data',
  SELECTED_PLAN_DATA: 'selected_plan_data',
  PLAN_SUMMARY_COMPLETED: 'plan_summary_completed',
  PAYMENT_DATA: 'payment_data',
  PAYMENT_ACKNOWLEDGED: 'payment_acknowledged',
  FAILED_PAYMENT_INTENT: 'failed_payment_intent',
  OTP_STATE: 'otp_state',
  COMPLETED_STEPS: 'completed_steps'
} as const

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

export const CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES:TenantInfoFormData = {
  company_name: '',
  contact_person: '',
  primary_email: '',
  primary_phone: ['', ''],
  address_line1: '',
  address_line2: '',
  city: '',
  state_province: '',
  postal_code: '',
  country: ''
}

/* Verification configurations */
export const VERIFICATION_CONFIGS: Record<string, VerificationConfig> = {
  email: {
    type: 'email_verification',
    stepType: 'EMAIL_VERIFICATION',
    verifyButtonText: 'Verify Email OTP',
    resendDescriptionText: 'A new OTP has been sent to your email address.',
    successMessage: 'Email',
    verificationKey: 'email_otp'
  },
  phone: {
    type: 'phone_verification',
    stepType: 'PHONE_VERIFICATION', 
    verifyButtonText: 'Verify Phone OTP',
    resendDescriptionText: 'A new OTP has been sent to your phone number.',
    successMessage: 'Phone',
    verificationKey: 'phone_otp'
  }
}