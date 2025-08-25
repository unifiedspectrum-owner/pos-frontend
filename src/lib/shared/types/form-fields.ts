export interface FormFieldStructure {
  id: number; 
  type: 'INPUT' | 'TEXTAREA' | 'SELECT' | 'TOGGLE' | 'PIN';
  label: string;
  schema_key: string;
  placeholder: string;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  disabled?: boolean;
  grid: {
    col_span: number;
  };
  toggle_text?: {
    true: string;
    false: string;
  };
  values?: {
    value: string; 
    label: string;
  }[];
}