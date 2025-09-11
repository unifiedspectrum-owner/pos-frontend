import { FormFieldStructure } from "@shared/types";
import { FaRegBuilding } from "react-icons/fa6";
import { FiPhone } from "react-icons/fi";
import { MdOutlineEmail, MdPersonOutline } from "react-icons/md";
import { SlLocationPin } from "react-icons/sl";

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
        type: "INPUT",
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
        type: "INPUT",
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
        type: "COMBOBOX",
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
        type: "INPUT_WITH_BUTTON",
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
        type: "INPUT_WITH_BUTTON",
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
        type: "PHONE_NUMBER",
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
      // {
      //   id: 12,
      //   type: "INPUT_WITH_BUTTON",
      //   label: "Email OTP",
      //   schema_key: "email_otp",
      //   placeholder: "Enter Email OTP",
      //   is_required: true,
      //   is_active: true,
      //   display_order: 4,
      //   grid: {
      //     col_span: 3
      //   }
      // },
      // {
      //   id: 13,
      //   type: "INPUT_WITH_BUTTON",
      //   label: "Phone OTP", 
      //   schema_key: "phone_otp",
      //   placeholder: "Enter Phone OTP",
      //   is_required: true,
      //   is_active: true,
      //   display_order: 5,
      //   grid: {
      //     col_span: 3
      //   }
      // },
      {
        id: 7,
        type: "INPUT_WITH_BUTTON",
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
        type: "TEXTAREA",
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
        type: "TEXTAREA",
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
        type: "INPUT",
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
        type: "COMBOBOX",
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
        type: "INPUT",
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