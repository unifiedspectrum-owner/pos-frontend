/* Form configuration constants for tenant management */

/* Libraries imports */
import { FaRegBuilding } from "react-icons/fa6";
import { FiPhone } from "react-icons/fi";
import { MdOutlineEmail, MdPersonOutline, MdBlock, MdDateRange } from "react-icons/md";
import { SlLocationPin } from "react-icons/sl";

/* Shared module imports */
import { FormFieldStructure } from "@shared/types";
import { FORM_FIELD_TYPES } from "@shared/constants";

/* Tenant module imports */
import { TenantInfoFormData } from "@tenant-management/schemas/account";
import { VerificationConfig } from "@tenant-management/hooks/account-creation";

/* Form field structure with section heading */
export interface FormFieldStructureWithSectionHeading {
  section_heading: string,
  section_values: FormFieldStructure[]
}

/* Section heading constants */
export const TENANT_FORM_SECTIONS = {
  BASIC_INFO: "Contact Information",
  ADDRESS_INFO: "Business Address"
} as const;

/* Form field configurations for tenant account registration */
export const TENANT_BASIC_INFO_QUESTIONS: FormFieldStructureWithSectionHeading[] = [
  {
    section_heading: TENANT_FORM_SECTIONS.BASIC_INFO,
    section_values: [
      {
        id: 1,
        type: FORM_FIELD_TYPES.INPUT,
        label: "Company Name",
        schema_key: "company_name",
        placeholder: "Enter your company name",
        left_icon: FaRegBuilding,
        is_required: true,
        is_active: true,
        display_order: 1,
        grid: {
          col_span: 2
        }
      },
      {
        id: 2,
        type: FORM_FIELD_TYPES.INPUT,
        label: "Contact Person",
        schema_key: "contact_person",
        placeholder: "Enter the Contact Person Name",
        left_icon: MdPersonOutline,
        is_required: true,
        is_active: true,
        display_order: 2,
        grid: {
          col_span: 2
        }
      },
      {
        id: 3,
        type: FORM_FIELD_TYPES.COMBOBOX,
        label: "Country",
        schema_key: "country",
        placeholder: "Enter country",
        is_required: true,
        is_active: true,
        display_order: 3,
        grid: {
          col_span: 2
        }
      },
      {
        id: 4,
        type: FORM_FIELD_TYPES.INPUT_WITH_BUTTON,
        label: "Email Address",
        schema_key: "primary_email",
        placeholder: "Enter email address",
        left_icon: MdOutlineEmail,
        is_required: true,
        is_active: true,
        display_order: 4,
        grid: {
          col_span: 3
        }
      },
      {
        id: 5,
        type: FORM_FIELD_TYPES.INPUT_WITH_BUTTON,
        label: "Secondary Email Address",
        schema_key: "secondary_email",
        placeholder: "Enter secondary email address (optional)",
        left_icon: MdOutlineEmail,
        is_required: false,
        is_active: false,
        display_order: 5,
        grid: {
          col_span: 3
        }
      },
      {
        id: 6,
        type: FORM_FIELD_TYPES.PHONE_NUMBER,
        label: "Phone Number",
        schema_key: "primary_phone",
        placeholder: "Enter primary phone number",
        left_icon: FiPhone,
        is_required: true,
        is_active: true,
        display_order: 6,
        grid: {
          col_span: 3
        }
      },
      {
        id: 7,
        type: FORM_FIELD_TYPES.INPUT_WITH_BUTTON,
        label: "Secondary Phone Number",
        schema_key: "secondary_phone",
        placeholder: "Enter secondary phone number (optional)",
        left_icon: FiPhone,
        is_required: false,
        is_active: false,
        display_order: 7,
        grid: {
          col_span: 3
        }
      }
    ]
  },
  {
    section_heading: TENANT_FORM_SECTIONS.ADDRESS_INFO,
    section_values: [
      {
        id: 8,
        type: FORM_FIELD_TYPES.TEXTAREA,
        label: "Address Line 1",
        schema_key: "address_line1",
        placeholder: "Enter company address line 1",
        left_icon: SlLocationPin,
        is_required: true,
        is_active: true,
        display_order: 8,
        grid: {
          col_span: 3
        }
      },
      {
        id: 9,
        type: FORM_FIELD_TYPES.TEXTAREA,
        label: "Address Line 2",
        schema_key: "address_line2",
        placeholder: "Enter company address line 2 (optional)",
        left_icon: SlLocationPin,
        is_required: false,
        is_active: true,
        display_order: 9,
        grid: {
          col_span: 3
        }
      },
      {
        id: 10,
        type: FORM_FIELD_TYPES.INPUT,
        label: "City",
        schema_key: "city",
        placeholder: "Enter city",
        is_required: true,
        is_active: true,
        display_order: 10,
        grid: {
          col_span: 2
        }
      },
      {
        id: 11,
        type: FORM_FIELD_TYPES.COMBOBOX,
        label: "State/Province",
        schema_key: "state_province",
        placeholder: "Enter state/province",
        is_required: true,
        is_active: true,
        display_order: 11,
        grid: {
          col_span: 2
        }
      },
      {
        id: 12,
        type: FORM_FIELD_TYPES.INPUT,
        label: "Postal Code",
        schema_key: "postal_code",
        placeholder: "Enter postal code",
        is_required: true,
        is_active: true,
        display_order: 12,
        grid: {
          col_span: 2
        }
      }
    ]
  }
];

/* Default form values for tenant registration */
export const CREATE_TENANT_ACCOUNT_FORM_DEFAULT_VALUES: TenantInfoFormData = {
  company_name: '',
  contact_person: '',
  primary_email: '',
  primary_phone: ['', ''],
  address_line1: '',
  address_line2: '',
  city: '',
  state_province: '',
  postal_code: '',
  country: ''
}

/* Form field configurations for tenant suspension */
export const TENANT_SUSPENSION_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: FORM_FIELD_TYPES.TEXTAREA,
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
    type: FORM_FIELD_TYPES.DATE,
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
    type: FORM_FIELD_TYPES.TEXTAREA,
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
    type: FORM_FIELD_TYPES.DATE,
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
    type: FORM_FIELD_TYPES.TEXTAREA,
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

/* Verification configurations for email and phone OTP */
export const VERIFICATION_CONFIGS: Record<string, VerificationConfig> = {
  email: {
    type: 'email_verification',
    stepType: 'EMAIL_VERIFICATION',
    verifyButtonText: 'Verify Email OTP',
    resendDescriptionText: 'A new OTP has been sent to your email address.',
    successMessage: 'Email',
    verificationKey: 'email_otp'
  },
  phone: {
    type: 'phone_verification',
    stepType: 'PHONE_VERIFICATION',
    verifyButtonText: 'Verify Phone OTP',
    resendDescriptionText: 'A new OTP has been sent to your phone number.',
    successMessage: 'Phone',
    verificationKey: 'phone_otp'
  }
}
