/* Storage configuration constants for tenant management */

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
  COMPLETED_STEPS: 'completed_steps',
  PENDING_STATE_RESTORE: 'pending_state_restore',
  PAYMENT_RETRY_ATTEMPTS: 'payment_retry_attempts'
} as const

/* Plan data cache configuration */
export const PLANS_CACHE_CONFIG = {
  KEY: 'cached_subscription_plans',
  TIMESTAMP_KEY: 'cached_subscription_plans_timestamp',
  DURATION: 5 * 60 * 1000 /* 5 minutes */
} as const;
