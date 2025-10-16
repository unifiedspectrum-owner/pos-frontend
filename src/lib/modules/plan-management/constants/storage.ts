/* Storage and auto-save configuration constants */

/* Debounce delay for auto-saving form data */
export const AUTO_SAVE_DEBOUNCE_MS = 1000;

/* Local storage keys for persisting plan data */
export const STORAGE_KEYS = {
  DRAFT_PLAN_DATA: 'draft_plan_data', /* Draft form data storage key */
  ACTIVE_TAB: 'plan_active_tab', /* Current active tab storage key */
  AUTO_SAVE_TIMESTAMP: 'plan_auto_save_timestamp', /* Last save timestamp key */
} as const;
