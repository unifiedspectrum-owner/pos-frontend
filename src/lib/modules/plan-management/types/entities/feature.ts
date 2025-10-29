/* TypeScript interfaces for plan feature data structures */

/* Shared module imports */
import { ValidationError } from "@shared/types";

/* Entity Interfaces */

/* Feature available for plan selection */
export interface Feature {
  id: number;
  name: string;
  description: string;
  display_order: number;
}

/* API: Get Features List */

/* Response for fetching all features */
export interface FeaturesListApiResponse {
  success: boolean;
  error?: string;
  message: string;
  timestamp: string;
  count: number;
  data?: Feature[];
}

/* API: Create Feature */

/* Feature creation request payload */
export interface CreateFeatureApiRequest {
  name: string;
  description: string;
}

/* Response for feature creation operations */
export interface CreateFeatureApiResponse {
  success: boolean;
  error?: string;
  message: string;
  timestamp: string;
  data?: {
    id: number;
    name: string;
    status: boolean;
  };
  validation_errors?: ValidationError[];
}
