/* TypeScript interfaces for validation and error handling data structures */

/* Field validation error structure */
export interface ValidationError {
  field: string;
  message: string;
}

/* Generic payload validation response with optional validated data */
export interface PayloadValidationResponse<T> { 
  isValid: boolean; 
  data?: T, 
  errors?: ValidationError[]; 
  message?: string 
}