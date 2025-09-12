/* Shared imports */
import { FormFieldStructure } from "@shared/types";
import { MdBlock, MdDateRange } from "react-icons/md";

/* Form field configurations for tenant suspension */
export const TENANT_SUSPENSION_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: "TEXTAREA",
    label: "Suspension Reason",
    schema_key: "reason",
    placeholder: "Please provide a detailed reason for suspending this tenant account...",
    left_icon: MdBlock,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 1
    }
  },
  {
    id: 2,
    type: "DATE",
    label: "Suspend Until (Optional)",
    schema_key: "suspend_until", 
    placeholder: "Select end date for suspension",
    left_icon: MdDateRange,
    is_required: false,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 1
    }
  }
];

/* Form field configurations for tenant hold */
export const TENANT_HOLD_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: "TEXTAREA",
    label: "Hold Reason",
    schema_key: "reason",
    placeholder: "Please provide a detailed reason for placing this tenant on hold...",
    left_icon: MdBlock,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 1
    }
  },
  {
    id: 2,
    type: "DATE",
    label: "Hold Until (Optional)",
    schema_key: "hold_until",
    placeholder: "Select end date for hold",
    left_icon: MdDateRange,
    is_required: false,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 1
    }
  }
];

/* Form field configurations for tenant activation */
export const TENANT_ACTIVATION_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: "TEXTAREA",
    label: "Activation Reason",
    schema_key: "reason",
    placeholder: "Please provide a reason for activating this tenant account...",
    left_icon: MdBlock,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 1
    }
  }
];