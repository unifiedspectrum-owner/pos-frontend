/* TypeScript interfaces for UI-specific data structures */

/* Libraries imports */
import { IconType } from "react-icons"

/* Shared module imports */
import { ValidationError } from "@shared/types";

/* Tenant module imports */
import { TenantInfo, TenantVerificationStatus } from './entities';

/* ==================== Workflow Types ==================== */

/* Workflow steps for tenant account creation process */
export type TenantAccountCreationStepType = 'tenant-info' | 'plan-selection' | 'addon-selection' | 'plan-summary' | 'payment' | 'payment-failed' | 'success'

/* Interface defining step configuration properties */
export interface TenantAccountCreationSteps {
  id: TenantAccountCreationStepType
  label: string
  title: string
  description: string
  icon: IconType
}

/* ==================== Cache Data Types ==================== */

/* Tenant account form cache data */
export interface TenantAccountFormCacheData {
  company_name: string;
  contact_person: string;
  primary_email: string;
  primary_phone: string,
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}

/* Account verification status cached data */
export interface TenantVerificationStatusCachedData {
  email_verified: boolean;
  phone_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
}

/* ==================== Account Info Types ==================== */

/* Complete tenant data structure */
export interface TenantAccountInfo {
  tenant_id: string;
  tenant_info: TenantInfo;
  basic_info_status: {
    is_complete: boolean;
    validation_errors: ValidationError[];
    validation_message: string;
  };
  verification_status: TenantVerificationStatus;
}
