/* Form field configuration for plan pricing information */

/* Libraries imports */
import { FaDollarSign, FaPercent, FaCreditCard } from 'react-icons/fa';
import { MdDevices } from 'react-icons/md';

/* Shared module imports */
import { FORM_FIELD_TYPES } from '@shared/constants';
import { FormFieldStructure } from '@shared/types';

/* Form configuration for plan pricing information */
export const PRICING_INFO_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Monthly Price ($)",
    schema_key: "monthly_price",
    placeholder: "0.00",
    left_icon: FaDollarSign,
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 1
    }
  },
  {
    id: 2,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Additional Device Cost ($)",
    schema_key: "additional_device_cost",
    placeholder: "0.00",
    left_icon: MdDevices,
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 1
    }
  },
  {
    id: 3,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Annual Discount (%)",
    schema_key: "annual_discount_percentage",
    placeholder: "0.00",
    left_icon: FaPercent,
    is_required: true,
    is_active: true,
    display_order: 3,
    grid: {
      col_span: 1
    }
  },
  {
    id: 4,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Biennial Discount (%)",
    schema_key: "biennial_discount_percentage",
    placeholder: "0.00",
    left_icon: FaPercent,
    is_required: true,
    is_active: false,
    display_order: 4,
    grid: {
      col_span: 1
    }
  },
  {
    id: 5,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Triennial Discount (%)",
    schema_key: "triennial_discount_percentage",
    placeholder: "0.00",
    left_icon: FaPercent,
    is_required: true,
    is_active: false,
    display_order: 5,
    grid: {
      col_span: 1
    }
  },
  {
    id: 6,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Monthly Fee (Our Gateway) ($)",
    schema_key: "monthly_fee_our_gateway",
    placeholder: "0.00",
    left_icon: FaDollarSign,
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
    label: "Monthly Fee (BYO Processor) ($)",
    schema_key: "monthly_fee_byo_processor",
    placeholder: "0.00",
    left_icon: FaDollarSign,
    is_required: true,
    is_active: true,
    display_order: 7,
    grid: {
      col_span: 1
    }
  },
  {
    id: 8,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Card Processing Fee (%)",
    schema_key: "card_processing_fee_percentage",
    placeholder: "0.00",
    left_icon: FaCreditCard,
    is_required: true,
    is_active: true,
    display_order: 8,
    grid: {
      col_span: 1
    }
  },
  {
    id: 9,
    type: FORM_FIELD_TYPES.INPUT,
    label: "Card Processing Fee (Fixed) ($)",
    schema_key: "card_processing_fee_fixed",
    placeholder: "0.00",
    left_icon: FaCreditCard,
    is_required: true,
    is_active: true,
    display_order: 9,
    grid: {
      col_span: 1
    }
  }
];
