/* Form field type constants */

/* Supported form field input types */
export const FORM_FIELD_TYPES = {
  INPUT: 'INPUT',
  INPUT_WITH_BUTTON: 'INPUT_WITH_BUTTON',
  SELECT: 'SELECT',
  TEXTAREA: 'TEXTAREA',
  WYSIWYG_EDITOR: 'WYSIWYG_EDITOR',
  COMBOBOX: 'COMBOBOX',
  DATE: 'DATE',
  PIN: 'PIN',
  FILE: 'FILE',
  CHECKBOX: 'CHECKBOX',
  RADIO: 'RADIO',
  NUMBER: 'NUMBER',
  PASSWORD: 'PASSWORD',
  EMAIL: 'EMAIL',
  PHONE_NUMBER: 'PHONE_NUMBER',
  TOGGLE: 'TOGGLE',
} as const

/* TypeScript type derived from form field types */
export type FormFieldType = typeof FORM_FIELD_TYPES[keyof typeof FORM_FIELD_TYPES]
