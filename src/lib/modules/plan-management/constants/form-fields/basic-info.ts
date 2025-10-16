/* Form field configuration for basic plan information */

/* Libraries imports */
import { FaInfoCircle, FaFileAlt, FaToggleOn, FaLayerGroup, FaUsers, FaCodeBranch } from 'react-icons/fa';
import { MdDevices } from 'react-icons/md';

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants';
import { FormFieldStructure } from '@shared/types';

/* Form configuration for basic plan information */
export const BASIC_INFO_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Plan Name",
    schema_key: "name",
    placeholder: "Enter plan name",
    left_icon: FaInfoCircle,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 1
    }
  },
  {
    id: 2,
    type: FORM_FIELD_TYPES.TOGGLE,
    label: "Status",
    schema_key: "is_active",
    placeholder: "Toggle to activate or deactivate the plan",
    left_icon: FaToggleOn,
    is_required: false,
    is_active: true,
    display_order: 2,
    toggle_text: {
      true: "Active",
      false: "Inactive"
    },
    grid: {
      col_span: 1
    }
  },
  {
    id: 3,
    type: FORM_FIELD_TYPES.TOGGLE,
    label: "Plan Type",
    schema_key: "is_custom",
    placeholder: "Toggle between custom and regular plan",
    left_icon: FaLayerGroup,
    is_required: false,
    is_active: true,
    display_order: 3,
    toggle_text: {
      true: "Custom Plan",
      false: "Regular Plan"
    },
    grid: {
      col_span: 1
    }
  },
  {
    id: 4,
    type: FORM_FIELD_TYPES.TEXTAREA,
    label: "Description",
    schema_key: "description",
    placeholder: "Enter plan description",
    left_icon: FaFileAlt,
    is_required: true,
    is_active: true,
    display_order: 4,
    grid: {
      col_span: 3
    }
  },
  {
    id: 5,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Included Devices Count",
    schema_key: "included_devices_count",
    placeholder: "0",
    left_icon: MdDevices,
    is_required: true,
    is_active: true,
    display_order: 5,
    grid: {
      col_span: 1
    }
  },
  {
    id: 6,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Max Users Per Branch",
    schema_key: "max_users_per_branch",
    placeholder: "0",
    left_icon: FaUsers,
    is_required: true,
    is_active: true,
    display_order: 6,
    grid: {
      col_span: 1
    }
  },
  {
    id: 7,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Included Branches Count",
    schema_key: "included_branches_count",
    placeholder: "0",
    left_icon: FaCodeBranch,
    is_required: true,
    is_active: true,
    display_order: 7,
    grid: {
      col_span: 1
    }
  }
];
