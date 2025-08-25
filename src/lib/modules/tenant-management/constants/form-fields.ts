import { FormFieldStructure } from "@shared/types";

/* Form field configurations for tenant account registration */
export const TENANT_BASIC_INFO_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: "INPUT",
    label: "Company Name",
    schema_key: "company_name",
    placeholder: "Enter your company name",
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 2
    }
  },
  {
    id: 2,
    type: "INPUT",
    label: "Primary Email Address",
    schema_key: "primary_email",
    placeholder: "Enter primary email address",
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 1
    }
  },
  {
    id: 3,
    type: "INPUT",
    label: "Secondary Email Address",
    schema_key: "secondary_email",
    placeholder: "Enter secondary email address (optional)",
    is_required: false,
    is_active: false,
    display_order: 3,
    grid: {
      col_span: 1
    }
  },
  {
    id: 4,
    type: "INPUT",
    label: "Primary Phone Number",
    schema_key: "primary_phone",
    placeholder: "Enter primary phone number",
    is_required: true,
    is_active: true,
    display_order: 4,
    grid: {
      col_span: 1
    }
  },
  {
    id: 5,
    type: "INPUT",
    label: "Secondary Phone Number",
    schema_key: "secondary_phone",
    placeholder: "Enter secondary phone number (optional)",
    is_required: false,
    is_active: false,
    display_order: 5,
    grid: {
      col_span: 1
    }
  },
  {
    id: 6,
    type: "TEXTAREA",
    label: "Address Line 1",
    schema_key: "address_line1",
    placeholder: "Enter company address line 1",
    is_required: true,
    is_active: true,
    display_order: 6,
    grid: {
      col_span: 2
    }
  },
  {
    id: 7,
    type: "TEXTAREA",
    label: "Address Line 2",
    schema_key: "address_line2",
    placeholder: "Enter company address line 2 (optional)",
    is_required: false,
    is_active: true,
    display_order: 7,
    grid: {
      col_span: 2
    }
  },
  {
    id: 8,
    type: "INPUT",
    label: "City",
    schema_key: "city",
    placeholder: "Enter city",
    is_required: true,
    is_active: true,
    display_order: 8,
    grid: {
      col_span: 1
    }
  },
  {
    id: 9,
    type: "INPUT",
    label: "State/Province",
    schema_key: "state_province",
    placeholder: "Enter state/province",
    is_required: true,
    is_active: true,
    display_order: 9,
    grid: {
      col_span: 1
    }
  },
  {
    id: 10,
    type: "INPUT",
    label: "Country",
    schema_key: "country",
    placeholder: "Enter country",
    is_required: true,
    is_active: true,
    display_order: 10,
    grid: {
      col_span: 1
    }
  },
  {
    id: 11,
    type: "INPUT",
    label: "Postal Code",
    schema_key: "postal_code",
    placeholder: "Enter postal code",
    is_required: true,
    is_active: true,
    display_order: 11,
    grid: {
      col_span: 1
    }
  }
];

/* Form field configurations for OTP verification */
export const TENANT_COMPANY_VERIFICATION_QUESTIONS: FormFieldStructure[] = [
  {
    id: 1,
    type: "PIN",
    label: "Email OTP",
    schema_key: "email_otp",
    placeholder: "",
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 1
    }
  },
  {
    id: 2,
    type: "PIN",
    label: "Phone OTP",
    schema_key: "phone_otp",
    placeholder: "",
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 1
    }
  }
];