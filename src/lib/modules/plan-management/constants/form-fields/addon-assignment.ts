/* Form field configuration for addon assignment details */

/* Libraries imports */
import { FaPuzzlePiece, FaLayerGroup, FaToggleOn, FaSortNumericDown, FaSortNumericUp } from 'react-icons/fa';
import { MdNumbers } from 'react-icons/md';

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants';
import { FormFieldStructure } from '@shared/types';

/* Form configuration for addon assignment details */
export const ADDONS_INFO_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Add-on Name",
    schema_key: "addon_name",
    placeholder: "Add-on name",
    left_icon: FaPuzzlePiece,
    is_required: false,
    is_active: true,
    display_order: 1,
    disabled: true,
    grid: {
      col_span: 1
    }
  },
  {
    id: 2,
    type: FORM_FIELD_TYPES.SELECT,
    label: "Feature Level",
    schema_key: "feature_level",
    placeholder: "Select feature level",
    left_icon: FaLayerGroup,
    is_required: true,
    is_active: true,
    display_order: 2,
    values: [
      { label: "Basic", value: "basic" },
      { label: "Custom", value: "custom" }
    ],
    grid: {
      col_span: 1
    }
  },
  {
    id: 3,
    type: FORM_FIELD_TYPES.TOGGLE,
    label: "Is Included",
    schema_key: "is_included",
    placeholder: "Toggle to include or exclude add-on",
    left_icon: FaToggleOn,
    is_required: false,
    is_active: true,
    display_order: 3,
    toggle_text: {
      true: "Included",
      false: "Optional"
    },
    grid: {
      col_span: 1
    }
  },
  {
    id: 4,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Default Quantity",
    schema_key: "default_quantity",
    placeholder: "0",
    left_icon: MdNumbers,
    is_required: false,
    is_active: true,
    display_order: 4,
    grid: {
      col_span: 1
    }
  },
  {
    id: 5,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Min Quantity",
    schema_key: "min_quantity",
    placeholder: "0",
    left_icon: FaSortNumericDown,
    is_required: false,
    is_active: true,
    display_order: 5,
    grid: {
      col_span: 1
    }
  },
  {
    id: 6,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Max Quantity",
    schema_key: "max_quantity",
    placeholder: "Unlimited",
    left_icon: FaSortNumericUp,
    is_required: false,
    is_active: true,
    display_order: 6,
    grid: {
      col_span: 1
    }
  }
];
