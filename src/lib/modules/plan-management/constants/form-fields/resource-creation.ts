/* Form field configurations for creating new features, addons, and SLAs */

/* Libraries imports */
import { FaStar, FaFileAlt, FaPuzzlePiece, FaDollarSign, FaHandshake, FaHeadset, FaClock, FaCalendarAlt, FaStickyNote } from 'react-icons/fa';
import { MdCategory } from 'react-icons/md';

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants';
import { FormFieldStructure } from '@shared/types';

/* Form configuration for creating new features */
export const FEATURE_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Feature Name",
    schema_key: "name",
    placeholder: "Enter feature name",
    left_icon: FaStar,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 8
    }
  },
  {
    id: 2,
    type: FORM_FIELD_TYPES.TEXTAREA,
    label: "Description",
    schema_key: "description",
    placeholder: "Feature description",
    left_icon: FaFileAlt,
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 8
    }
  }
];

/* Form configuration for creating new addons */
export const ADDON_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Add-on Name",
    schema_key: "name",
    placeholder: "Enter add-on name",
    left_icon: FaPuzzlePiece,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 8
    }
  },
  {
    id: 2,
    type: FORM_FIELD_TYPES.TEXTAREA,
    label: "Description",
    schema_key: "description",
    placeholder: "Add-on description",
    left_icon: FaFileAlt,
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 8
    }
  },
  {
    id: 3,
    type: FORM_FIELD_TYPES.NUMBER,
    label: "Base Price ($)",
    schema_key: "base_price",
    placeholder: "0.00",
    left_icon: FaDollarSign,
    is_required: false,
    is_active: true,
    display_order: 3,
    grid: {
      col_span: 4
    }
  },
  {
    id: 4,
    type: FORM_FIELD_TYPES.SELECT,
    label: "Pricing Scope",
    schema_key: "pricing_scope",
    placeholder: "Select pricing scope",
    left_icon: MdCategory,
    is_required: true,
    is_active: true,
    display_order: 4,
    values: [
      { value: "branch", label: "Branch" },
      { value: "organization", label: "Organization" }
    ],
    grid: {
      col_span: 4
    }
  }
];

/* Form configuration for creating new SLA agreements */
export const SLA_FORM_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: FORM_FIELD_TYPES.INPUT,
    label: "SLA Name",
    schema_key: "name",
    placeholder: "Enter SLA name",
    left_icon: FaHandshake,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 4
    }
  },
  {
    id: 2,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Support Channel",
    schema_key: "support_channel",
    placeholder: "e.g., Email, Phone, Chat",
    left_icon: FaHeadset,
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 4
    }
  },
  {
    id: 3,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Response Time (hours)",
    schema_key: "response_time_hours",
    placeholder: "e.g., 24",
    left_icon: FaClock,
    is_required: true,
    is_active: true,
    display_order: 3,
    grid: {
      col_span: 4
    }
  },
  {
    id: 4,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Availability Schedule",
    schema_key: "availability_schedule",
    placeholder: "e.g., 24/7, Business Hours",
    left_icon: FaCalendarAlt,
    is_required: true,
    is_active: true,
    display_order: 4,
    grid: {
      col_span: 4
    }
  },
  {
    id: 5,
    type: FORM_FIELD_TYPES.TEXTAREA,
    label: "Notes (Optional)",
    schema_key: "notes",
    placeholder: "Additional notes about this SLA",
    left_icon: FaStickyNote,
    is_required: false,
    is_active: true,
    display_order: 5,
    grid: {
      col_span: 8
    }
  }
];
