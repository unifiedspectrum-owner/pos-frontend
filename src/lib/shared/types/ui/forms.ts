/* TypeScript interfaces for UI form configuration data structures */

/* External library imports */
import { IconType } from "react-icons";
import { FormFieldType } from "@shared/constants";

export interface FormSectionStructure {
  id: number;
  icon: IconType;
  heading: string;
  questions: FormFieldStructure[]
}

/* Dynamic form field configuration structure */
export interface FormFieldStructure {
  id: number; 
  type: FormFieldType,
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