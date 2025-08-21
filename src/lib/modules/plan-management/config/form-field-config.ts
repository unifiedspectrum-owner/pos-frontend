/* Interface defining form field configuration structure */
export interface FormFieldConfig {
  id: number; /* Unique identifier for the field */
  type: 'INPUT' | 'TEXTAREA' | 'TOGGLE' | 'SELECT'; /* Form input type */
  label: string; /* Display label for the field */
  schema_key: string; /* Key used for form data mapping */
  placeholder?: string; /* Optional placeholder text */
  is_required: boolean; /* Whether field is mandatory */
  is_active: boolean; /* Whether field is currently active/enabled */
  display_order: number; /* Order for field rendering */
  disabled?: boolean; /* Whether field is read-only */
  grid: {
    columns?: number;
    col_span: number; /* Number of columns to span */
  };
  toggle_text?: {
    true?: string; /* Text shown for toggle true state */
    false?: string; /* Text shown for toggle false state */
  };
  values?: {
    value: string; /* Option value for select fields */
    label: string; /* Option display text for select fields */
  }[];
}

/* Form configuration for basic plan information */
export const BASIC_INFO_QUESTIONS: FormFieldConfig[] = [
  {
    id: 1,
    type: "INPUT",
    label: "Name",
    schema_key: "name",
    placeholder: "Enter plan name",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 1
    }
  },
  {
    id: 2,
    type: "TOGGLE",
    label: "Status",
    schema_key: "is_active",
    placeholder: "",
    values: [],
    is_required: false,
    is_active: true,
    toggle_text: {
      true: "Active",
      false: "Inactive",
    },
    display_order: 2,
    grid: {
      col_span: 1
    }
  },
  {
    id: 3,
    type: "TOGGLE",
    label: "Plan Type",
    schema_key: "is_custom",
    placeholder: "",
    values: [],
    is_required: false,
    is_active: true,
    toggle_text: {
      true: "Custom Plan",
      false: "Regular Plan",
    },
    display_order: 3,
    grid: {
      col_span: 1
    }
  },
  {
    id: 4,
    type: "TEXTAREA",
    label: "Description",
    schema_key: "description",
    placeholder: "Enter plan description",
    is_required: true,
    is_active: true,
    display_order: 4,
    grid: {
      col_span: 3
    }
  },
  {
    id: 5,
    type: "INPUT",
    label: "Included devices count",
    schema_key: "included_devices_count",
    placeholder: "0",
    is_required: true,
    is_active: true,
    display_order: 5,
    grid: {
      col_span: 1
    }
  },
  {
    id: 6,
    type: "INPUT",
    label: "Max Users Per Branch ",
    schema_key: "max_users_per_branch",
    placeholder: "0",
    is_required: true,
    is_active: true,
    display_order: 6,
    grid: {
      col_span: 1
    }
  },
  {
    id: 7,
    type: "INPUT",
    label: "Included Branches Count",
    schema_key: "included_branches_count",
    placeholder: "0",
    is_required: true,
    is_active: true,
    display_order: 7,
    grid: {
      col_span: 1
    }
  }
];

/* Form configuration for plan pricing information */
export const PRICING_INFO_QUESTIONS: FormFieldConfig[] = [
  {
    id: 1,
    type: "INPUT",
    label: "Monthly Price ($)",
    schema_key: "monthly_price",
    placeholder: "0.00",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      columns: 5, 
      col_span: 1
    }
  },
  {
    id: 2,
    type: "INPUT",
    label: "Additional Device Cost ($)",
    schema_key: "additional_device_cost",
    placeholder: "0.00",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      columns: 5, 
      col_span: 1
    }
  },
  {
    id: 3,
    type: "INPUT",
    label: "Annual Discount (%)",
    schema_key: "annual_discount_percentage",
    placeholder: "0.00",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 3,
    grid: {
      columns: 5, 
      col_span: 1
    }
  },
  {
    id: 4,
    type: "INPUT",
    label: "Biennial Discount (%)",
    schema_key: "biennial_discount_percentage",
    placeholder: "0.00",
    values: [],
    is_required: true,
    is_active: false,
    display_order: 4,
    grid: {
      columns: 5, 
      col_span: 1
    }
  },
  {
    id: 5,
    type: "INPUT",
    label: "Triennial Discount (%)",
    schema_key: "triennial_discount_percentage",
    placeholder: "0.00",
    is_required: true,
    is_active: false,
    display_order: 5,
    grid: {
      columns: 5, 
      col_span: 1
    }
  },
  {
    id: 6,
    type: "INPUT",
    label: "Monthly Fee (Our Gateway) ($)",
    schema_key: "monthly_fee_our_gateway",
    placeholder: "0.00",
    is_required: true,
    is_active: true,
    display_order: 6,
    grid: {
      columns: 4, 
      col_span: 1
    }
  },
  {
    id: 7,
    type: "INPUT",
    label: "Monthly Fee (BYO Processor) ($)",
    schema_key: "monthly_fee_byo_processor",
    placeholder: "0.00",
    is_required: true,
    is_active: true,
    display_order: 7,
    grid: {
      columns: 4, 
      col_span: 1
    }
  },
  {
    id: 8,
    type: "INPUT",
    label: "Card Processing Fee (%)",
    schema_key: "card_processing_fee_percentage",
    placeholder: "0.00",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 8,
    grid: {
      columns: 4, 
      col_span: 1
    }
  },
  {
    id: 9,
    type: "INPUT",
    label: "Card Processing Fee (Fixed) ($)",
    schema_key: "card_processing_fee_fixed",
    placeholder: "0.00",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 9,
    grid: {
      columns: 4, 
      col_span: 1
    }
  }
];

/* Form configuration for addon assignment details */
export const ADDONS_INFO_QUESTIONS: FormFieldConfig[] = [
  {
    id: 1,
    type: "INPUT",
    label: "Add-on Name",
    schema_key: "addon_name",
    placeholder: "Add-on name",
    values: [],
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
    type: "SELECT",
    label: "Feature Level",
    schema_key: "feature_level",
    placeholder: "Select feature level",
    values: [
      { label: "Basic", value: "basic" },
      { label: "Custom", value: "custom" }
    ],
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 1
    }
  },
  {
    id: 3,
    type: "TOGGLE",
    label: "Is Included",
    schema_key: "is_included",
    placeholder: "",
    values: [],
    is_required: false,
    is_active: true,
    toggle_text: {
      true: "Included",
      false: "Optional",
    },
    display_order: 3,
    grid: {
      col_span: 1
    }
  },
  {
    id: 4,
    type: "INPUT",
    label: "Default Quantity",
    schema_key: "default_quantity",
    placeholder: "0",
    values: [],
    is_required: false,
    is_active: true,
    display_order: 4,
    grid: {
      col_span: 1
    }
  },
  {
    id: 5,
    type: "INPUT",
    label: "Min Quantity",
    schema_key: "min_quantity",
    placeholder: "0",
    values: [],
    is_required: false,
    is_active: true,
    display_order: 5,
    grid: {
      col_span: 1
    }
  },
  {
    id: 6,
    type: "INPUT",
    label: "Max Quantity",
    schema_key: "max_quantity",
    placeholder: "Unlimited",
    values: [],
    is_required: false,
    is_active: true,
    display_order: 6,
    grid: {
      col_span: 1
    }
  }
];

/* Form configuration for creating new features */
export const FEATURE_CREATE_FORM_CONFIG: FormFieldConfig[] = [
  {
    id: 1,
    type: "INPUT",
    label: "Feature Name",
    schema_key: "name",
    placeholder: "Enter feature name",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 1
    }
  },
  {
    id: 2,
    type: "TEXTAREA",
    label: "Description",
    schema_key: "description",
    placeholder: "Feature description",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 1
    }
  }
];

/* Form configuration for creating new addons */
export const ADDON_CREATE_FORM_CONFIG: FormFieldConfig[] = [
  {
    id: 1,
    type: "INPUT",
    label: "Add-on Name",
    schema_key: "name",
    placeholder: "Enter add-on name",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 2
    }
  },
  {
    id: 2,
    type: "TEXTAREA",
    label: "Description",
    schema_key: "description",
    placeholder: "Add-on description",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 2
    }
  },
  {
    id: 3,
    type: "INPUT",
    label: "Base Price ($)",
    schema_key: "base_price",
    placeholder: "0.00",
    values: [],
    is_required: false,
    is_active: true,
    display_order: 3,
    grid: {
      col_span: 1,
    }
  },
  {
    id: 4,
    type: "SELECT",
    label: "Pricing Scope",
    schema_key: "pricing_scope",
    placeholder: "Select pricing scope",
    values: [
      { value: "branch", label: "Branch" },
      { value: "organization", label: "Organization" }
    ],
    is_required: true,
    is_active: true,
    display_order: 4,
    grid: {
      col_span: 1,
    }
  }
];

/* Form configuration for creating new SLA agreements */
export const SLA_CREATE_FORM_CONFIG: FormFieldConfig[] = [
  {
    id: 1,
    type: "INPUT",
    label: "SLA Name",
    schema_key: "name",
    placeholder: "Enter SLA name",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 1,
    }
  },
  {
    id: 2,
    type: "INPUT",
    label: "Support Channel",
    schema_key: "support_channel",
    placeholder: "e.g., Email, Phone, Chat",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 1,
    }
  },
  {
    id: 3,
    type: "INPUT",
    label: "Response Time (hours)",
    schema_key: "response_time_hours",
    placeholder: "e.g., 24",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 3,
    grid: {
      col_span: 1,
    }
  },
  {
    id: 4,
    type: "INPUT",
    label: "Availability Schedule",
    schema_key: "availability_schedule",
    placeholder: "e.g., 24/7, Business Hours",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 4,
    grid: {
      col_span: 1,
    }
  },
  {
    id: 5,
    type: "TEXTAREA",
    label: "Notes (Optional)",
    schema_key: "notes",
    placeholder: "Additional notes about this SLA",
    values: [],
    is_required: false,
    is_active: true,
    display_order: 5,
    grid: {
      col_span: 1
    }
  }
];

/* Form configuration for volume discount settings */
export const VOLUME_DISCOUNT_FIELD_CONFIG: FormFieldConfig[] = [
  {
    id: 1,
    type: "INPUT",
    label: "Discount Name",
    schema_key: "name",
    placeholder: "Enter discount name",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 1,
    grid: {
      col_span: 1,
    }
  },
  {
    id: 2,
    type: "INPUT",
    label: "Min Branches", 
    schema_key: "min_branches",
    placeholder: "",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 2,
    grid: {
      col_span: 1,
    }
  },
  {
    id: 3,
    type: "INPUT",
    label: "Max Branches",
    schema_key: "max_branches",
    placeholder: "",
    values: [],
    is_required: false,
    is_active: true,
    display_order: 3,
    grid: {
      col_span: 1,
    }
  },
  {
    id: 4,
    type: "INPUT",
    label: "Discount (%)",
    schema_key: "discount_percentage",
    placeholder: "0.00",
    values: [],
    is_required: true,
    is_active: true,
    display_order: 4,
    grid: {
      col_span: 1,
    }
  }
];