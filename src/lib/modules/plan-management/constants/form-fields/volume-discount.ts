/* Form field configuration for volume discount settings */

/* Libraries imports */
import { FaTag, FaCodeBranch, FaPercent } from 'react-icons/fa';

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants';
import { FormFieldStructure } from '@shared/types';

/* Form configuration for volume discount settings */
export const VOLUME_DISCOUNT_FIELD_CONFIG: FormFieldStructure[] = [
  {
    id: 1,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Discount Name",
    schema_key: "name",
    placeholder: "Enter discount name",
    left_icon: FaTag,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 4
    }
  },
  {
    id: 2,
    type: FORM_FIELD_TYPES.NUMBER,
    label: "Min Branches",
    schema_key: "min_branches",
    placeholder: "0",
    left_icon: FaCodeBranch,
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 2
    }
  },
  {
    id: 3,
    type: FORM_FIELD_TYPES.NUMBER,
    label: "Max Branches",
    schema_key: "max_branches",
    placeholder: "Unlimited",
    left_icon: FaCodeBranch,
    is_required: false,
    is_active: true,
    display_order: 3,
    grid: {
      col_span: 2
    }
  },
  {
    id: 4,
    type: FORM_FIELD_TYPES.NUMBER,
    label: "Discount (%)",
    schema_key: "discount_percentage",
    placeholder: "0.00",
    left_icon: FaPercent,
    is_required: true,
    is_active: true,
    display_order: 4,
    grid: {
      col_span: 2
    }
  }
];
