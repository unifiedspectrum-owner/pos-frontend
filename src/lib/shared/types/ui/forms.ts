/* TypeScript interfaces for UI form configuration data structures */

/* External library imports */
import { IconType } from "react-icons";

/* Dynamic form field configuration structure */
export interface FormFieldStructure {
  id: number; 
  type: 'INPUT' | 'TEXTAREA' | 'SELECT' | 'TOGGLE' | 'PIN' | 'INPUT_WITH_BUTTON' | 'COMBOBOX' | 'PHONE_NUMBER' | 'DATE' | 'FILE' | 'PASSWORD' | 'CHECKBOX';
  label: string;
  schema_key: string;
  left_icon?: IconType;
  placeholder: string;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  disabled?: boolean;
  grid: {
    col_span: number;
  };
  toggle_text?: {
    true: string;
    false: string;
  };
  values?: {
    value: string; 
    label: string;
  }[];
}